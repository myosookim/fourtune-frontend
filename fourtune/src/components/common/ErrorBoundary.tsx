import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global ErrorBoundary — isolates render-time errors to prevent full app crashes.
 * Wrap subtrees or pages with this to show a graceful fallback UI on failure.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px',
                    padding: '2rem',
                    gap: '1rem',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '3rem' }}>⚠️</div>
                    <h2 style={{ margin: 0, color: 'var(--color-text, #1a1a1a)' }}>문제가 발생했습니다</h2>
                    <p style={{ color: 'var(--color-text-muted, #666)', fontSize: '0.95rem', margin: 0 }}>
                        {this.state.error?.message || '일시적인 오류가 발생했습니다. 다시 시도해 주세요.'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--color-primary, #6c63ff)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        다시 시도
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
