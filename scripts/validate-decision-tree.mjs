#!/usr/bin/env node
/**
 * Development utility: validates a scenario's decision-tree graph.
 *
 * Usage:
 *   node scripts/validate-decision-tree.mjs "<scenario name or id>"
 *
 * Checks performed:
 *   - Missing next node: a decision's next_problem_statement_id points to
 *     a UUID that doesn't exist in mst_problem_statement.
 *   - Dead end: a reachable problem statement has zero decisions attached
 *     (it can never progress or reach a terminal decision).
 *   - Orphan node: a problem statement exists in the database but can
 *     never be reached by walking the graph from the scenario's
 *     start_problem_statement_id.
 *   - Circular dependency: a cycle exists in the
 *     problem_statement -> decision -> next_problem_statement graph.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from
 * .env (same as the app) — never the service role key.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const content = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {
    // .env not found — assume env vars are already set (e.g. CI).
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const scenarioArg = process.argv[2];
if (!scenarioArg) {
  console.error('Usage: node scripts/validate-decision-tree.mjs "<scenario name or id>"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function findScenario(arg) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(arg);
  const query = supabase.from("mst_skenario").select("*");
  const { data, error } = isUuid ? await query.eq("id", arg).single() : await query.eq("skenario", arg).single();

  if (error || !data) {
    throw new Error(`Scenario not found for "${arg}": ${error?.message ?? "no rows"}`);
  }
  return data;
}

async function fetchAllProblemStatements() {
  const { data, error } = await supabase.from("mst_problem_statement").select("id");
  if (error) throw new Error(`Failed to fetch problem statements: ${error.message}`);
  return new Set((data ?? []).map((row) => row.id));
}

async function fetchDecisionsFor(problemStatementIds) {
  const { data, error } = await supabase
    .from("mst_decision")
    .select("*")
    .in("problem_statement_id", problemStatementIds);
  if (error) throw new Error(`Failed to fetch decisions: ${error.message}`);
  return data ?? [];
}

async function main() {
  const scenario = await findScenario(scenarioArg);
  console.log(`\nValidating scenario: "${scenario.skenario}" (${scenario.id})`);

  if (!scenario.start_problem_statement_id) {
    console.error("ERROR: Scenario has no start_problem_statement_id.");
    process.exit(1);
  }

  const allProblemStatementIds = await fetchAllProblemStatements();

  // BFS the graph from the start node, collecting every reachable node and
  // every decision along the way.
  const visited = new Set();
  const queue = [scenario.start_problem_statement_id];
  const allDecisions = [];
  const errors = [];
  const warnings = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    if (!allProblemStatementIds.has(current)) {
      errors.push(`Invalid next problem statement: ${current} does not exist in mst_problem_statement.`);
      continue;
    }

    const decisions = await fetchDecisionsFor([current]);
    allDecisions.push(...decisions);

    if (decisions.length === 0) {
      errors.push(`Problem statement has no decision: ${current}`);
    }

    for (const decision of decisions) {
      if (decision.next_problem_statement_id) {
        queue.push(decision.next_problem_statement_id);
      }
    }
  }

  // Orphan nodes: exist in the table but never visited via BFS from start.
  for (const id of allProblemStatementIds) {
    if (!visited.has(id)) {
      warnings.push(`Orphan node (unreachable from start): ${id}`);
    }
  }

  // Cycle detection (DFS) over the reachable subgraph only.
  const graph = new Map();
  for (const decision of allDecisions) {
    if (!decision.next_problem_statement_id) continue;
    if (!graph.has(decision.problem_statement_id)) graph.set(decision.problem_statement_id, []);
    graph.get(decision.problem_statement_id).push(decision.next_problem_statement_id);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  const cyclePath = [];

  function dfs(node, path) {
    color.set(node, GRAY);
    path.push(node);
    for (const next of graph.get(node) ?? []) {
      if (color.get(next) === GRAY) {
        cyclePath.push(...path, next);
        return true;
      }
      if (color.get(next) !== BLACK && dfs(next, path)) return true;
    }
    path.pop();
    color.set(node, BLACK);
    return false;
  }

  for (const node of visited) {
    if (color.get(node) === undefined) {
      if (dfs(node, [])) break;
    }
  }

  if (cyclePath.length > 0) {
    warnings.push(`Circular dependency detected: ${cyclePath.join(" -> ")}`);
  }

  console.log(`\nReachable nodes: ${visited.size}`);
  console.log(`Total decisions (reachable): ${allDecisions.length}`);

  if (errors.length > 0) {
    console.log(`\n${errors.length} ERROR(S):`);
    errors.forEach((e) => console.log(`  ERROR: ${e}`));
  }

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} WARNING(S):`);
    warnings.forEach((w) => console.log(`  WARNING: ${w}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("\nGraph looks healthy: no missing nodes, dead ends, orphans, or cycles.");
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
