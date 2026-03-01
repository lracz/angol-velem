import { Component } from 'react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h2>💥 React Error Boundary Caught an Error!</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>Kattints a hiba részleteiért (Error details)</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#c62828', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Oldal frissítése
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
