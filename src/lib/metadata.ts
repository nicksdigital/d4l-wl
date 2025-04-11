import type { Metadata } from 'next';

// Base metadata that will be used across the site
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://d4l.ai'),
  title: {
    template: '%s | D4L - Decentralized for Life',
    default: 'D4L - Decentralized for Life',
  },
  description: 'D4L is a next-generation decentralized platform for token management, blockchain interactions, and Web3 technology.',
  keywords: ['blockchain', 'crypto', 'airdrop', 'tokens', 'D4L', 'decentralized', 'web3'],
  authors: [{ name: 'D4L Team' }],
  creator: 'D4L Team',
  publisher: 'D4L',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://d4l.ai',
    siteName: 'D4L - Decentralized for Life',
    title: 'D4L - Decentralized for Life',
    description: 'D4L is a next-generation decentralized platform for token management, blockchain interactions, and Web3 technology.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'D4L - Decentralized for Life',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@D4L_Official',
    creator: '@D4L_Team',
    title: 'D4L - Decentralized for Life',
    description: 'D4L is a next-generation decentralized platform for token management, blockchain interactions, and Web3 technology.',
    images: ['/images/twitter-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/images/apple-touch-icon.png' }
    ],
    other: [
      { url: '/images/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ]
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://d4l.ai',
    languages: {
      'en-US': 'https://d4l.ai/en-US',
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
};

// Generate page-specific metadata
export function generateMetadata(
  title: string,
  description: string,
  path: string = '',
  imageUrl: string = '/images/og-image.jpg',
  type: 'website' | 'article' = 'website'
): Metadata {
  const url = `https://d4l.ai${path}`;
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [imageUrl],
    },
  };
}
