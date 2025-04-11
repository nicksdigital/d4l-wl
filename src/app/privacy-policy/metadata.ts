import { generateMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata(
  'Privacy Policy | D4L - Decentralized for Life',
  'Learn about how D4L collects, uses, and protects your personal information and data privacy rights.',
  '/privacy-policy',
  '/images/privacy-og.jpg'
);
