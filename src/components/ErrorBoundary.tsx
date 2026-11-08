import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-surface p-6">
          <div className="max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center">
            <h1 className="text-xl text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-variant">
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary hover:bg-primary-hover"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}