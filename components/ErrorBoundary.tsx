'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Check if this is a search params error
      const isSearchParamsError = this.state.error?.message?.includes('useSearchParams');
      
      if (isSearchParamsError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-red-500 mb-4">Navigation Error</h2>
              <p className="text-gray-700 mb-4">
                There was an issue loading the page with the provided parameters.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-900 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        );
      }
      
      return this.props.fallback;
    }

    return this.props.children;
  }
} 