import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const REFERRAL_KEY = 'spectra_my_referral_code';

export interface Referral {
  id: string;
  code: string;
  referredBy?: string;
  joinedAt: string;
  status: 'pending' | 'active' | 'rewarded';
  rewardScans: number;
}

const REWARD_SCANS = 10;

// Generate a unique referral code from user ID
export const generateReferralCode = (userId: string): string => {
  const base = userId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `SPX${base}`;
};

// Get or create referral code for current user
export const getMyReferralCode = async (): Promise<string> => {
  const cached = await AsyncStorage.getItem(REFERRAL_KEY);
  if (cached) return cached;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');

  const code = generateReferralCode(user.id);
  await AsyncStorage.setItem(REFERRAL_KEY, code);
  return code;
};

// Apply a referral code (called when new user signs up)
export const applyReferralCode = async (code: string): Promise<boolean> => {
  try {
    // In production, hit backend endpoint /referral/apply
    // For now, save locally
    await AsyncStorage.setItem('spectra_referrer_code', code);
    return true;
  } catch {
    return false;
  }
};

// Get referral stats for current user
export const getMyReferralStats = async (): Promise<{
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  totalScansEarned: number;
  referralLink: string;
}> => {
  const code = await getMyReferralCode();
  const referralLink = `https://spectra.app/join?ref=${code}`;

  // In production, fetch from backend
  // For demo, return sample data
  return {
    code,
    totalReferrals: 0,
    activeReferrals: 0,
    totalScansEarned: 0,
    referralLink,
  };
};

// Get list of referred users
export const getReferredUsers = async (): Promise<Referral[]> => {
  // In production, fetch from backend
  return [];
};

export const REWARD_PER_REFERRAL = REWARD_SCANS;
