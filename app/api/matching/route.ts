import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("job_id");

  try {
    // 1. Fetch jobs — optionally filter by specific job_id
    let jobsQuery = supabase
      .from("mst_jobs")
      .select("*")
      .eq("status", "visible")
      .order("created_at", { ascending: false });

    if (jobId) {
      jobsQuery = jobsQuery.eq("id", jobId);
    }

    const { data: jobsData, error: jobsError } = await jobsQuery;
    if (jobsError) {
      return NextResponse.json({ error: jobsError.message }, { status: 400 });
    }

    if (!jobsData || jobsData.length === 0) {
      return NextResponse.json({ matches: [], totalMatches: 0 });
    }

    // 2. Fetch all talents
    const { data: talentsData, error: talentsError } = await supabase
      .from("profiles")
      .select("id, email, job_title, skor, skills")
      .eq("role", "talent");

    if (talentsError) {
      return NextResponse.json(
        { error: talentsError.message },
        { status: 400 }
      );
    }

    if (!talentsData || talentsData.length === 0) {
      return NextResponse.json({ matches: [], totalMatches: 0 });
    }

    // 3. Matching engine: talent.skor >= job.minimum_skor
    interface MatchResult {
      talentId: string;
      talentEmail: string;
      talentJobTitle: string | null;
      talentSkor: number;
      talentSkills: unknown;
      jobId: string;
      jobTitle: string;
      jobLocation: string;
      minimumSkor: number;
      matchPercentage: number;
    }

    const matches: MatchResult[] = [];

    for (const job of jobsData) {
      const minSkor = job.minimum_skor || 0;

      for (const talent of talentsData) {
        if (talent.skor === null || talent.skor === undefined) continue;

        if (talent.skor >= minSkor) {
          // Calculate match percentage (capped at 100)
          const matchPercentage =
            minSkor > 0
              ? Math.min(Math.round((talent.skor / minSkor) * 100), 100)
              : 100;

          matches.push({
            talentId: talent.id,
            talentEmail: talent.email,
            talentJobTitle: talent.job_title,
            talentSkor: talent.skor,
            talentSkills: talent.skills,
            jobId: job.id,
            jobTitle: job.job_title,
            jobLocation: job.location,
            minimumSkor: minSkor,
            matchPercentage,
          });
        }
      }
    }

    // Sort by highest skor first
    matches.sort((a, b) => b.talentSkor - a.talentSkor);

    return NextResponse.json({
      matches,
      totalMatches: matches.length,
      jobs: jobsData,
    });
  } catch (err) {
    console.error("Matching API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
