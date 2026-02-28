import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useErrorStore } from '../../stores/useErrorStore';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// Hook-based error dispatcher for functional components
export const useErrorHandler = () => {
    const dispatchError = useErrorStore((state) => state.dispatchError);

    const handleError = (error: Error, context?: string) => {
        const message = context ? `${context}: ${error.message}` : error.message;
        dispatchError(message, 'error');
    };

    return handleError;
};

// Class-based error boundary for catching render errors
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Dispatch error to global error store
        const dispatchError = useErrorStore.getState().dispatchError;
        dispatchError(
            `ErrorBoundary caught: ${error.message}${errorInfo.componentStack ? ` in ${errorInfo.componentStack}` : ''}`,
            'error'
        );

        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleDismiss = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, fallback } = this.props;

        if (hasError && error) {
            if (fallback) {
                return fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-[200px] p-6">
                    <div className="bg-red-950/90 border border-red-500 text-red-200 rounded-lg p-6 max-w-md shadow-2xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="shrink-0 mt-0.5" size={24} />
                            <div className="flex-grow">
                                <h3 className="font-semibold mb-2">Something went wrong</h3>
                                <p className="text-sm opacity-90 mb-4">{error.message}</p>
                                <button
                                    onClick={this.handleDismiss}
                                    className="text-xs bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return children;
    }
}

// Simple alert icon component (avoiding external dependency)
const AlertCircle: React.FC<{ size?: number; className?: string }> = ({
    size = 24,
    className = '',
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
);
