import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from './constants';
import { LeaderboardResponse } from '@/types';

export async function fetchLeaderboard(
  type: 'whales' | 'referrals' | 'live',
  limit: number,
  telegramId: string
): Promise<LeaderboardResponse> {
  const resp = await axios.get<LeaderboardResponse>(
    `${BASE_URL}${API_ENDPOINTS.LEADERBOARD}/${telegramId}`,
    {
      params: { type, limit },
    }
  );
  return resp.data;
}

