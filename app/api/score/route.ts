import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/score
 * Update talent's profile score after completing a simulation
 * 
 * Request body:
 * {
 *   newScore: number  // New score that REPLACES old score (not cumulative)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   previousScore: number,
 *   newScore: number
 * }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[API /api/score POST] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    });

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated', details: authError?.message }, 
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { newScore } = body;

    console.log('[API /api/score POST] Request body:', { newScore, type: typeof newScore });

    if (typeof newScore !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score value. Must be a number.' }, 
        { status: 400 }
      );
    }

    // 3. Get current profile (for logging only)
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('skor')
      .eq('id', user.id)
      .single();

    console.log('[API /api/score POST] Fetch profile result:', { 
      profile, 
      fetchError: fetchError?.message,
      fetchErrorDetails: fetchError 
    });

    if (fetchError) {
      console.error('[API /api/score POST] Fetch profile error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: fetchError.message }, 
        { status: 500 }
      );
    }

    const previousScore = profile?.skor ?? 0;

    console.log('[API /api/score POST] Score update:', { 
      previousScore, 
      newScore,
      action: 'REPLACE (not add!)'
    });

    // 4. Update score - REPLACE not ADD
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ skor: newScore })  // Direct replace!
      .eq('id', user.id)
      .select();

    console.log('[API /api/score POST] Update result:', { 
      updateData,
      updateError: updateError?.message,
      updateErrorDetails: updateError
    });

    if (updateError) {
      console.error('[API /api/score POST] Update profile error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update score', details: updateError.message }, 
        { status: 500 }
      );
    }

    // 5. Success response
    console.log('[API /api/score POST] ✅ Success! Score REPLACED:', previousScore, '→', newScore);

    return NextResponse.json({
      success: true,
      previousScore: previousScore,
      newScore: newScore,
      message: 'Score successfully updated'
    }, { status: 200 });

  } catch (err: any) {
    console.error('[API /api/score POST] ❌ Catch error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/score
 * Get current authenticated user's score
 * 
 * Response:
 * {
 *   score: number,
 *   email: string
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' }, 
        { status: 401 }
      );
    }

    // 2. Get profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('skor, email')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Fetch profile error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      score: profile?.skor ?? 0,
      email: profile?.email
    }, { status: 200 });

  } catch (err: any) {
    console.error('Get score error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
