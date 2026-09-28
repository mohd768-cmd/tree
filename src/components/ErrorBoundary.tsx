import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fef9ef] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg border border-[#e7e2d8]">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h2 className="text-xl font-bold text-[#0d2419] mb-2 font-display">
              Something went wrong
            </h2>
            <p className="text-xs text-[#525e57] mb-6">
              An unexpected error occurred while rendering the page.
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-left p-3 rounded-lg bg-red-50 text-red-700 font-mono overflow-x-auto mb-6 max-h-32 border border-red-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0d2419] text-[#fdcd7b] font-bold text-sm hover:bg-[#1a3d2c] transition-colors cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
