import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const problemId = searchParams.get('problemId');

  if (!problemId) {
    return NextResponse.json({ error: 'Parameter problemId diperlukan' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('mst_problem_statement')
      .select('*')
      .eq('id', problemId)
      .single();

    if (error || !data) {
      // Tabel/kolom belum tersedia atau data tidak ditemukan —
      // biarkan client menggunakan skenario default sebagai fallback.
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(
      {
        id: data.id,
        roleTitle: data.role_title ?? data.roleTitle ?? undefined,
        incidentTitle: data.incident_title ?? data.judul ?? undefined,
        narrative: data.narrative ?? data.deskripsi ?? data.situasi_awal ?? undefined,
        objectives: data.objectives ?? undefined,
        alerts: data.alerts ?? undefined,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching problem statement:', err);
    return NextResponse.json(null, { status: 200 });
  }
}
