import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-black text-surface-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-sm text-surface-500 mb-6">
              An unexpected error occurred. Don't worry — your data is safe. Try refreshing the page.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left bg-surface-100 rounded-xl p-4 text-xs text-surface-600 overflow-auto max-h-48">
                <summary className="cursor-pointer font-bold text-surface-700 mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
                <pre className="whitespace-pre-wrap mt-2">{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

