'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Something went wrong
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              We apologize for the inconvenience. Please try again.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Try again
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Go back home
              </Link>
            </div>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-800 rounded-lg text-left overflow-auto max-w-2xl mx-auto">
                <p className="text-sm text-gray-300 font-mono">{this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-xs text-gray-400 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
