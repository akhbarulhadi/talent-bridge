/**
 * Network Service
 * Handles HR follow/unfollow operations
 */

export interface HRProfile {
  id: string;
  email: string;
  job_title: string | null;
  isFollowing: boolean;
  followerCount: number;
}

export async function getHRProfiles(): Promise<HRProfile[]> {
  try {
    const response = await fetch('/api/network', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch HR profiles');
    }

    const data = await response.json();
    return data.hrProfiles;
  } catch (error) {
    console.error('Get HR profiles error:', error);
    throw error;
  }
}

export async function followHR(hrId: string): Promise<void> {
  try {
    const response = await fetch('/api/network', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hrId, action: 'follow' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to follow HR');
    }
  } catch (error) {
    console.error('Follow HR error:', error);
    throw error;
  }
}

export async function unfollowHR(hrId: string): Promise<void> {
  try {
    const response = await fetch('/api/network', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hrId, action: 'unfollow' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unfollow HR');
    }
  } catch (error) {
    console.error('Unfollow HR error:', error);
    throw error;
  }
}
