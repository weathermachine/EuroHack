import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              background: '#0a0a0f',
              color: '#ff3333',
              fontFamily: 'monospace',
              padding: 24,
              height: '100vh',
            }}
          >
            <h2 style={{ color: '#ffcc00' }}>AI Rack — Runtime Error</h2>
            <pre style={{ color: '#e0e0e0', whiteSpace: 'pre-wrap' }}>
              {this.state.error.message}
            </pre>
            <pre style={{ color: '#555577', fontSize: 12, marginTop: 12 }}>
              {this.state.error.stack}
            </pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
