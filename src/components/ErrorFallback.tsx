
import React from 'react';

interface ErrorFallbackProps {
  children: React.ReactNode;
}

interface ErrorFallbackState {
  hasError: boolean;
  error: any;
}

class ErrorFallback extends React.Component<ErrorFallbackProps, ErrorFallbackState> {
  state = { hasError: false, error: null as any };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: any, info: { componentStack: string }) {
    console.error("App error:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message || "Unknown error"}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorFallback;
