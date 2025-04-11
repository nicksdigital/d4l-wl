import { generateMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata(
  'Login | D4L - Decentralized for Life',
  'Securely log in to your D4L account to manage your tokens, airdrops, and blockchain interactions.',
  '/login',
  '/images/login-og.jpg'
);
