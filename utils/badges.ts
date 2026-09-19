import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  category: 'scan' | 'social' | 'streak' | 'market';
  unlockedAt?: string;
}

export const ALL_BADGES: Badge[] = [
  // SCAN BADGES
  {
    id: 'first_scan',
    name: 'First Scan',
    description: 'Identify your first mineral',
    icon: '🔬',
    color: '#FFD700',
    requirement: 'Complete 1 scan',
    category: 'scan',
  },
  {
    id: 'scanner_10',
    name: 'Scanner',
    description: 'Identify 10 minerals',
    icon: '📷',
    color: '#00E5FF',
    requirement: 'Complete 10 scans',
    category: 'scan',
  },
  {
    id: 'mineral_master',
    name: 'Mineral Master',
    description: 'Identify 50 minerals',
    icon: '💎',
    color: '#7C4DFF',
    requirement: 'Complete 50 scans',
    category: 'scan',
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Identify 200 minerals',
    icon: '👑',
    color: '#FF1744',
    requirement: 'Complete 200 scans',
    category: 'scan',
  },

  // STREAK BADGES
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Scan 3 days in a row',
    icon: '🔥',
    color: '#FF9800',
    requirement: '3-day streak',
    category: 'streak',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Scan 7 days in a row',
    icon: '⚡',
    color: '#FFD700',
    requirement: '7-day streak',
    category: 'streak',
  },
  {
    id: 'streak_30',
    name: 'Dedicated Miner',
    description: 'Scan 30 days in a row',
    icon: '💪',
    color: '#00C853',
    requirement: '30-day streak',
    category: 'streak',
  },

  // SOCIAL BADGES
  {
    id: 'first_referral',
    name: 'Friend Finder',
    description: 'Refer your first friend',
    icon: '🤝',
    color: '#00E5FF',
    requirement: '1 successful referral',
    category: 'social',
  },
  {
    id: 'referral_5',
    name: 'Community Builder',
    description: 'Refer 5 friends',
    icon: '🌐',
    color: '#7C4DFF',
    requirement: '5 successful referrals',
    category: 'social',
  },
  {
    id: 'referral_25',
    name: 'Mining Ambassador',
    description: 'Refer 25 friends',
    icon: '🏆',
    color: '#FFD700',
    requirement: '25 successful referrals',
    category: 'social',
  },

  // MARKET BADGES
  {
    id: 'first_sale',
    name: 'First Sale',
    description: 'Sell your first mineral',
    icon: '💰',
    color: '#00C853',
    requirement: 'Complete 1 marketplace sale',
    category: 'market',
  },
  {
    id: 'verified_farmer',
    name: 'Verified Miner',
    description: 'Complete KYC verification',
    icon: '✅',
    color: '#00E5FF',
    requirement: 'Complete verification',
    category: 'market',
  },
];

const UNLOCKED_KEY = 'spectra_unlocked_badges';

export const getUnlockedBadges = async (): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(UNLOCKED_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const unlockBadge = async (badgeId: string): Promise<boolean> => {
  const unlocked = await getUnlockedBadges();
  if (unlocked.includes(badgeId)) return false;
  unlocked.push(badgeId);
  await AsyncStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  return true;
};

export const getBadgesWithStatus = async (): Promise<(Badge & { unlocked: boolean })[]> => {
  const unlocked = await getUnlockedBadges();
  return ALL_BADGES.map((b) => ({ ...b, unlocked: unlocked.includes(b.id) }));
};

export const getBadgesByCategory = async () => {
  const all = await getBadgesWithStatus();
  return {
    scan: all.filter((b) => b.category === 'scan'),
    streak: all.filter((b) => b.category === 'streak'),
    social: all.filter((b) => b.category === 'social'),
    market: all.filter((b) => b.category === 'market'),
  };
};
