import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ocr_results, skills, updated_at')
      .eq('id', user.id)
      .maybeSingle(); 

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const hasCV = profile ? !!profile.ocr_results : false;

    return NextResponse.json({
      success: true,
      cv: {
        hasCV: hasCV,
        filename: hasCV ? "Uploaded_CV.pdf" : null,
        uploadDate: profile?.updated_at || null,
        extractedSkills: profile?.skills || [] // Langsung kirim (sudah dalam bentuk array/object)
      },
      ocr_results: profile?.ocr_results || null
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}