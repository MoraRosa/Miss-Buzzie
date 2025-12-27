/**
 * Granular Error Boundary for individual features/tabs.
 * Shows a compact error state that doesn't disrupt the entire app.
 */
import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  /** Feature name to display in error message */
  featureName?: string;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Size variant for the error display */
  variant?: "compact" | "full";
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Feature-level Error Boundary for wrapping individual components or tabs.
 * Less disruptive than the global ErrorBoundary - allows rest of app to work.
 */
class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[FeatureErrorBoundary] ${this.props.featureName || "Feature"} error:`, error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, featureName = "This feature", fallback, variant = "full" } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const isCompact = variant === "compact";

      return (
        <div className={cn("flex items-center justify-center", isCompact ? "p-2" : "min-h-[300px] p-4")}>
          <Card className={cn("w-full", isCompact ? "max-w-sm" : "max-w-md")}>
            <CardHeader className={cn("text-center", isCompact && "py-3")}>
              <div
                className={cn(
                  "mx-auto rounded-full bg-amber-500/10 flex items-center justify-center",
                  isCompact ? "mb-2 h-8 w-8" : "mb-4 h-12 w-12"
                )}
              >
                <AlertTriangle className={cn("text-amber-500", isCompact ? "h-4 w-4" : "h-6 w-6")} />
              </div>
              <CardTitle className={isCompact ? "text-base" : undefined}>
                {featureName} encountered an error
              </CardTitle>
              <CardDescription className={isCompact ? "text-xs" : undefined}>
                Something went wrong, but you can try again.
              </CardDescription>
            </CardHeader>
            <CardContent className={cn("space-y-3", isCompact && "py-2")}>
              {/* Error details (dev only, collapsible) */}
              {process.env.NODE_ENV === "development" && error && (
                <div className="rounded-md bg-muted p-2">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        showDetails && "rotate-180"
                      )}
                    />
                    {showDetails ? "Hide" : "Show"} error details
                  </button>
                  {showDetails && (
                    <div className="mt-2 space-y-2">
                      <p className="font-mono text-xs text-destructive break-all">
                        {error.message}
                      </p>
                      {errorInfo && (
                        <pre className="text-[10px] overflow-auto max-h-24 text-muted-foreground">
                          {errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={this.handleRetry}
                size={isCompact ? "sm" : "default"}
                className="w-full"
              >
                <RefreshCw className={cn("mr-2", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default FeatureErrorBoundary;

