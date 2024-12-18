'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function ApiDocs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen">
      <Script
        src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"
        strategy="afterInteractive"
      />
      <div 
        id="scalar-api-reference" 
        data-spec-url="/api/docs"
      />
    </div>
  );
} 