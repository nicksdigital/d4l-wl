'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          We apologize for the inconvenience. Our team has been notified.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Go back home
          </Link>
        </div>
        {error.message && process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg text-left overflow-auto max-w-2xl mx-auto">
            <p className="text-sm text-gray-300 font-mono">{error.message}</p>
            {error.stack && (
              <pre className="mt-2 text-xs text-gray-400 overflow-auto">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
