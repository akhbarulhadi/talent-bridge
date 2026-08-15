import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const titleId = searchParams.get('titleId');

    if (!titleId) {
      return NextResponse.json({ error: 'Parameter titleId diperlukan' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Ambil detail Title
    const { data: titleData, error: titleError } = await supabase
      .from('mst_title')
      .select('name')
      .eq('id', titleId)
      .single();

    if (titleError) {
      return NextResponse.json({ error: 'Title tidak ditemukan' }, { status: 404 });
    }

    // 2. Ambil skenario berdasarkan id_title
    const { data: scenariosData, error: scenariosError } = await supabase
      .from('mst_skenario')
      .select('*')
      .eq('id_title', titleId);

    if (scenariosError) {
      return NextResponse.json({ error: scenariosError.message }, { status: 400 });
    }

    return NextResponse.json({
      titleName: titleData.name,
      scenarios: scenariosData || []
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}