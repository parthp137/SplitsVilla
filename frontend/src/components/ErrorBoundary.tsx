import { Component, ReactNode } from "react";
import { AlertCircle, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/50 px-4">
          <div className="max-w-md w-full">
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center backdrop-blur-md">
              <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Oops! Something Went Wrong
              </h1>
              <p className="text-muted-foreground mb-4">
                {this.state.error?.message || "An unexpected error occurred. Please try again."}
              </p>
              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={this.reset}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-4 py-3 font-bold hover:bg-primary/90 transition"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 rounded-lg border border-primary/50 text-primary px-4 py-3 font-bold hover:bg-primary/10 transition"
                >
                  Reload Page
                </button>
              </div>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-4 text-left text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-mono">Error Details</summary>
                  <pre className="mt-2 overflow-auto bg-black/20 p-2 rounded">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
