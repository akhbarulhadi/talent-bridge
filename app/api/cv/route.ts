import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/cv
 * Get current user's CV information
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user's CV information from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('cv_url, cv_filename, cv_upload_date')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fetch profile error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch CV information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cv: {
        url: profile?.cv_url || null,
        filename: profile?.cv_filename || null,
        uploadDate: profile?.cv_upload_date || null,
        hasCV: !!profile?.cv_url
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error('CV GET error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cv
 * Upload a new CV file
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop();
    const filename = `cv_${user.id}_${timestamp}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cv-files')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('cv-files')
      .getPublicUrl(filename);

    // Update user profile with CV information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        cv_url: publicUrl,
        cv_filename: file.name,
        cv_upload_date: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      // Try to clean up uploaded file
      await supabase.storage.from('cv-files').remove([filename]);
      
      return NextResponse.json(
        { error: 'Failed to update profile with CV information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'CV uploaded successfully',
      cv: {
        url: publicUrl,
        filename: file.name,
        uploadDate: new Date().toISOString(),
        hasCV: true
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error('CV POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cv
 * Remove current user's CV
 */
export async function DELETE() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get current CV URL to extract filename
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('cv_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fetch profile error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Extract filename from URL if CV exists
    let filename = null;
    if (profile?.cv_url) {
      const urlParts = profile.cv_url.split('/');
      filename = urlParts[urlParts.length - 1];
    }

    // Update profile to remove CV information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        cv_url: null,
        cv_filename: null,
        cv_upload_date: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove CV from profile' },
        { status: 500 }
      );
    }

    // Delete file from storage if it exists
    if (filename) {
      const { error: deleteError } = await supabase.storage
        .from('cv-files')
        .remove([filename]);

      if (deleteError) {
        console.error('File delete error:', deleteError);
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'CV removed successfully'
    }, { status: 200 });

  } catch (err: any) {
    console.error('CV DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}