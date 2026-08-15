import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  // Mengambil data profiles yang rolenya adalah 'talent'
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, job_title, skor, following")
    .eq("role", "talent");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}