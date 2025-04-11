"use client";

import React, { useEffect, useState } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  // Only render on client-side to avoid hydration mismatches
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use a stable, deterministic JSON string
  const jsonString = JSON.stringify(data);
  
  if (!mounted) {
    // Return null during SSR to avoid hydration mismatch
    return null;
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

// Organization structured data
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'D4L - Decentralized for Life',
  url: 'https://d4l.ai',
  logo: 'https://d4l.ai/images/logo.png',
  sameAs: [
    'https://twitter.com/D4L_Official',
    'https://discord.gg/d4l',
    'https://github.com/d4l-project'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@d4l.ai',
    contactType: 'customer service'
  }
};

// Website structured data
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'D4L - Decentralized for Life',
  url: 'https://d4l.ai',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://d4l.ai/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

// FAQ structured data generator
export const generateFaqSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

// Breadcrumb structured data generator
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://d4l.ai${item.url}`
    }))
  };
};

// Article structured data generator
export const generateArticleSchema = (
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  datePublished: string,
  dateModified: string,
  authorName: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: `https://d4l.ai${imageUrl}`,
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'D4L - Decentralized for Life',
      logo: {
        '@type': 'ImageObject',
        url: 'https://d4l.ai/images/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://d4l.ai${url}`
    }
  };
};
