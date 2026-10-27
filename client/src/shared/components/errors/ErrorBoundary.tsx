import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorPage from "./ErrorPage";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep diagnostic details in the console.
    // Connect a monitoring service here when deploying to production.
    console.error("MovieBox rendering error:", error, info.componentStack);
  }

  private handleRetry = () => {
    // Reset the boundary so React can attempt to render the children again.
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen">
          <ErrorPage
            statusCode={500}
            title="Something Went Wrong"
            message="An unexpected error occurred. You can try again or return to the home page."
          />

          <div className="flex justify-center px-4 pb-10">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-transform hover:opacity-90 active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}