import { generateMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata(
  'Register | D4L - Decentralized for Life',
  'Sign up for a D4L account to participate in airdrops, manage tokens, and access exclusive blockchain features.',
  '/register',
  '/images/register-og.jpg'
);
