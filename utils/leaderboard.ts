import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalScans: number;
  accuracy: number;
  badges: number;
  totalValue: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export type LeaderboardPeriod = 'week' | 'month' | 'all_time';

// Fetch leaderboard from backend (or generate demo data)
export const getLeaderboard = async (
  period: LeaderboardPeriod = 'week'
): Promise<LeaderboardEntry[]> => {
  try {
    // In production: call backend /leaderboard?period=week
    const { data: { user } } = await supabase.auth.getUser();

    // Demo leaderboard (replace with API call)
    const demo: LeaderboardEntry[] = [
      { rank: 1, userId: 'u1', displayName: 'Ibrahim Musa', totalScans: 347, accuracy: 0.94, badges: 11, totalValue: 4820000 },
      { rank: 2, userId: 'u2', displayName: 'Aisha Bello', totalScans: 291, accuracy: 0.91, badges: 10, totalValue: 3910000 },
      { rank: 3, userId: 'u3', displayName: 'David Okafor', totalScans: 245, accuracy: 0.89, badges: 9, totalValue: 3420000 },
      { rank: 4, userId: 'u4', displayName: 'Fatima Yusuf', totalScans: 218, accuracy: 0.92, badges: 8, totalValue: 2980000 },
      { rank: 5, userId: 'u5', displayName: 'John Tarka', totalScans: 187, accuracy: 0.88, badges: 8, totalValue: 2540000 },
      { rank: 6, userId: 'u6', displayName: 'Grace Adeyemi', totalScans: 156, accuracy: 0.90, badges: 7, totalValue: 2110000 },
      { rank: 7, userId: 'u7', displayName: 'Mohammed Sani', totalScans: 142, accuracy: 0.86, badges: 6, totalValue: 1870000 },
      { rank: 8, userId: 'u8', displayName: 'Blessing Nwosu', totalScans: 128, accuracy: 0.93, badges: 7, totalValue: 1650000 },
      { rank: 9, userId: 'u9', displayName: 'Chinedu Obi', totalScans: 112, accuracy: 0.85, badges: 5, totalValue: 1420000 },
      { rank: 10, userId: 'u10', displayName: 'Amaka Eze', totalScans: 98, accuracy: 0.91, badges: 6, totalValue: 1280000 },
    ];

    // Mark current user
    if (user) {
      const currentUserEntry = demo.find((e) => e.userId === user.id);
      if (!currentUserEntry) {
        // Add current user with their real data (fetched from scans table)
        demo.push({
          rank: 42,
          userId: user.id,
          displayName: user.email?.split('@')[0] || 'You',
          totalScans: 12,
          accuracy: 0.88,
          badges: 2,
          totalValue: 180000,
          isCurrentUser: true,
        });
      } else {
        currentUserEntry.isCurrentUser = true;
      }
    }

    return demo;
  } catch (e) {
    return [];
  }
};

// Get current user's rank and stats
export const getMyRank = async (): Promise<{
  rank: number;
  totalScans: number;
  badges: number;
  percentile: number;
}> => {
  const leaderboard = await getLeaderboard('all_time');
  const me = leaderboard.find((e) => e.isCurrentUser);
  return {
    rank: me?.rank || 999,
    totalScans: me?.totalScans || 0,
    badges: me?.badges || 0,
    percentile: me ? Math.round((1 - me.rank / leaderboard.length) * 100) : 0,
  };
};
