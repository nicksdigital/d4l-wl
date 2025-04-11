import { generateMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata(
  'Terms and Conditions | D4L - Decentralized for Life',
  'Review the terms and conditions for using the D4L platform, including user responsibilities and platform policies.',
  '/terms-conditions',
  '/images/terms-og.jpg'
);
