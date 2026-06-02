import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error Boundary Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-slate-800 font-sans">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full border border-slate-100 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-pink-100">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">System Telemetry Alert</h1>
                <p className="text-slate-500 text-sm font-medium">A rendering anomaly was intercepted in sector 7</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-6 overflow-hidden">
              <p className="text-red-600 font-mono text-sm font-bold truncate">
                {this.state.error?.toString() || 'Unknown anomaly'}
              </p>
              {this.state.errorInfo && (
                <details className="mt-3 group">
                  <summary className="text-xs text-slate-600 cursor-pointer select-none font-bold uppercase hover:text-slate-800 transition-colors list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform inline-block">▸</span> View Telemetry Logs
                  </summary>
                  <pre className="mt-3 text-[11px] font-mono text-slate-500 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed border-t border-slate-200 pt-3">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
              Don't worry, all clinic logs and database connections are monitored and intact. You can try refreshing the sector or charting back to standard coordinates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                <span>Re-Initialize Sector</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Landing Port</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
