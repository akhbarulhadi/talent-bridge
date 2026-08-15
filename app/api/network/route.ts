import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/network
 * Get all HR profiles for talent to follow
 * Returns list of HR with follow status
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

    // 2. Get current user's following list
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('following')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fetch profile error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    const followingList = (currentProfile?.following as string[]) || [];

    // 3. Get all HR profiles
    const { data: hrProfiles, error: hrError } = await supabase
      .from('profiles')
      .select('id, email, job_title, followed')
      .eq('role', 'hr');

    if (hrError) {
      console.error('Fetch HR profiles error:', hrError);
      return NextResponse.json(
        { error: 'Failed to fetch HR profiles' },
        { status: 500 }
      );
    }

    // 4. Add isFollowing status to each HR
    const hrWithFollowStatus = hrProfiles.map(hr => ({
      ...hr,
      isFollowing: followingList.includes(hr.id),
      followerCount: ((hr.followed as string[]) || []).length
    }));

    return NextResponse.json({
      success: true,
      hrProfiles: hrWithFollowStatus
    }, { status: 200 });

  } catch (err: any) {
    console.error('Network GET error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/network
 * Follow or unfollow an HR
 * 
 * Request body:
 * {
 *   hrId: string,
 *   action: 'follow' | 'unfollow'
 * }
 */
export async function POST(request: Request) {
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

    // 2. Parse request body
    const body = await request.json();
    const { hrId, action } = body;

    if (!hrId || !action || !['follow', 'unfollow'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: hrId and action (follow/unfollow)' },
        { status: 400 }
      );
    }

    // 3. Get current user's following list
    const { data: talentProfile, error: talentError } = await supabase
      .from('profiles')
      .select('following')
      .eq('id', user.id)
      .single();

    if (talentError) {
      console.error('Fetch talent profile error:', talentError);
      return NextResponse.json(
        { error: 'Failed to fetch talent profile' },
        { status: 500 }
      );
    }

    let followingList = (talentProfile?.following as string[]) || [];

    // 4. Get HR's followed list
    const { data: hrProfile, error: hrError } = await supabase
      .from('profiles')
      .select('followed, role')
      .eq('id', hrId)
      .single();

    if (hrError) {
      console.error('Fetch HR profile error:', hrError);
      return NextResponse.json(
        { error: 'Failed to fetch HR profile' },
        { status: 500 }
      );
    }

    if (hrProfile.role !== 'hr') {
      return NextResponse.json(
        { error: 'Target user is not an HR' },
        { status: 400 }
      );
    }

    let followedList = (hrProfile?.followed as string[]) || [];

    // 5. Update lists based on action
    if (action === 'follow') {
      if (!followingList.includes(hrId)) {
        followingList.push(hrId);
      }
      if (!followedList.includes(user.id)) {
        followedList.push(user.id);
      }
    } else {
      // unfollow
      followingList = followingList.filter(id => id !== hrId);
      followedList = followedList.filter(id => id !== user.id);
    }

    // 6. Update talent's following
    const { error: updateTalentError } = await supabase
      .from('profiles')
      .update({ following: followingList })
      .eq('id', user.id);

    if (updateTalentError) {
      console.error('Update talent following error:', updateTalentError);
      return NextResponse.json(
        { error: 'Failed to update following' },
        { status: 500 }
      );
    }

    // 7. Update HR's followed
    const { error: updateHrError } = await supabase
      .from('profiles')
      .update({ followed: followedList })
      .eq('id', hrId);

    if (updateHrError) {
      console.error('Update HR followed error:', updateHrError);
      return NextResponse.json(
        { error: 'Failed to update followed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action: action,
      message: action === 'follow' ? 'Successfully followed HR' : 'Successfully unfollowed HR',
      followingCount: followingList.length,
      followerCount: followedList.length
    }, { status: 200 });

  } catch (err: any) {
    console.error('Network POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
