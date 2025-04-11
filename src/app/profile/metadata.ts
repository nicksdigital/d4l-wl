import { generateMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata(
  'Profile | D4L - Decentralized for Life',
  'Manage your D4L profile, view token balances, and track your participation in airdrops and other blockchain activities.',
  '/profile',
  '/images/profile-og.jpg'
);
