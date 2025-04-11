"use client";

import React from 'react';
import StructuredData, { organizationSchema, websiteSchema } from './StructuredData';

/**
 * Client-side component to manage structured data
 * This helps avoid hydration mismatches by loading structured data only on the client
 */
export default function StructuredDataManager() {
  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
    </>
  );
}
