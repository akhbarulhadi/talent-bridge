/**
 * Update the authenticated user's total score in the profiles table.
 * This is called when a talent completes a simulation scenario.
 * 
 * The new score REPLACES the old score (not cumulative).
 * 
 * Uses API route for secure server-side database update.
 * 
 * @param newScore - The final score from the completed simulation (replaces old score)
 * @returns The updated score information or throws an error
 */
export async function updateProfileScore(newScore: number): Promise<{
  success: boolean;
  previousScore: number;
  newScore: number;
}> {
  console.log('[Service] updateProfileScore called with newScore:', newScore);
  
  try {
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newScore }),  // Changed from scoreToAdd
    });

    console.log('[Service] API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Service] API returned error:', error);
      throw new Error(error.error || 'Failed to update score');
    }

    const data = await response.json();
    console.log('[Service] ✅ Score update successful:', data);
    console.log(`Score REPLACED: ${data.previousScore} → ${data.newScore}`);
    
    return data;
  } catch (error) {
    console.error('[Service] ❌ Update score error:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user's profile score.
 * 
 * Uses API route for secure server-side data fetching.
 * 
 * @returns The user's current score and email
 */
export async function getUserScore(): Promise<{
  score: number;
  email: string;
}> {
  try {
    const response = await fetch('/api/score', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch score');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get score error:', error);
    throw error;
  }
}
