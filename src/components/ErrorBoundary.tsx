import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold font-display text-white">
              Application State Reset Required
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed break-words font-mono">
              {this.state.errorMessage}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold text-sm rounded-lg hover:bg-amber-400 transition-colors"
            >
              Restore Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
