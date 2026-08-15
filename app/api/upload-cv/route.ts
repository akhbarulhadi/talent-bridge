import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File PDF tidak ditemukan' }, { status: 400 });
    }

// ==========================================
    // 1. UPLOAD FILE KE SUPABASE STORAGE BUCKET
    // ==========================================
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; 
    
    // Pastikan nama ini sama persis dengan nama bucket di Supabase Anda!
    const BUCKET_NAME = 'cv_bucket'; 

    // PERBAIKAN: Ubah File menjadi Buffer agar didukung penuh oleh Supabase Node.js client
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true // Timpa jika file sudah ada
      });

    if (uploadError) {
      // CEK CONSOLE TERMINAL ANDA UNTUK MELIHAT ERROR ASLINYA
      console.error("Gagal upload ke bucket (Detail Supabase):", uploadError);
      throw new Error(`Gagal mengunggah file ke Storage Supabase: ${uploadError.message}`);
    }

    // Dapatkan Public URL dari file yang baru saja diupload
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // ==========================================
    // 2. KIRIM KE PYTHON OCR SERVICE
    // ==========================================
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:5000/api/extract-ocr';
    
    let ocrResponse;
    try {
      ocrResponse = await fetch(pythonApiUrl, {
        method: 'POST',
        body: pythonFormData,
      });
    } catch (fetchError: any) {
      throw new Error(`Gagal menghubungi server Python di ${pythonApiUrl}. Pastikan server Flask berjalan.`);
    }

    const rawText = await ocrResponse.text();
    let ocrData;
    
    try {
      ocrData = rawText ? JSON.parse(rawText) : {};
    } catch (parseError) {
      throw new Error("Server Python tidak mengembalikan format JSON yang valid.");
    }

    if (!ocrResponse.ok) {
      throw new Error(ocrData.error || 'Gagal memproses OCR di server Python');
    }

    const extractedText = ocrData.ocr_text || "";
    const extractedTextLower = extractedText.toLowerCase();

    // ==========================================
    // 3. MATCHING SKILLS
    // ==========================================
    const { data: mstSkills, error: mstError } = await supabase
      .from('mst_skills')
      .select('id, skill'); 

    let matchedSkills: any[] = [];

    if (!mstError && mstSkills) {
      matchedSkills = mstSkills.filter((item) => {
        if (!item.skill) return false;
        return extractedTextLower.includes(item.skill.toLowerCase());
      });
    } else {
      console.error("Gagal mengambil mst_skills:", mstError);
    }

    // ==========================================
    // 4. UPDATE DATABASE PROFILES
    // ==========================================
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        ocr_results: extractedText,
        skills: matchedSkills, 
        cv_url: publicUrl, // OPSIONAL: Simpan URL ini di tabel profiles jika Anda punya kolom cv_url
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
       console.error("Update profile error:", updateError);
       throw updateError;
    }

    // Kirim response beserta URL-nya ke Frontend
    return NextResponse.json({
      success: true,
      message: 'CV berhasil diproses!',
      ocr_results: extractedText,
      cv: {
        hasCV: true,
        filename: file.name,
        url: publicUrl, // <--- Ini penting agar iframe / preview jalan!
        extractedSkills: matchedSkills 
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error('Upload CV Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}