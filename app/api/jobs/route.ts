import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET: Mengambil semua daftar jobs
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mst_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

// POST: Menambah job baru
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  // Ambil user yang sedang login untuk mengisi 'created_by'
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("mst_jobs")
    .insert([
      {
        job_title: body.job_title,
        location: body.location,
        minimum_skor: body.minimum_skor,
        status: body.status || "visible",
        created_by: user?.id || null,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data[0]);
}

// PUT: Mengubah data job atau statusnya
export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { id, job_title, location, status, minimum_skor } = body;

  const updateData: any = {};
  if (job_title !== undefined) updateData.job_title = job_title;
  if (location !== undefined) updateData.location = location;
  if (status !== undefined) updateData.status = status;
  if (minimum_skor !== undefined) updateData.minimum_skor = minimum_skor;

  const { data, error } = await supabase
    .from("mst_jobs")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data[0]);
}

// DELETE: Menghapus job berdasarkan ID
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
  }

  const { error } = await supabase.from("mst_jobs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}