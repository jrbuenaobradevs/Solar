import { Component, ReactNode, ErrorInfo } from "react"
import PageHero from "./PageHero"
import Button from "./Button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="page">
          <PageHero
            kicker="Error"
            title="Something went wrong"
            text="We're sorry, but an unexpected error occurred while loading this page."
          />
          <section className="section">
            <div className="shell">
              <div
                className="empty-state"
                style={{ textAlign: "center", padding: "3rem 1rem" }}
              >
                <span
                  style={{
                    fontSize: "3rem",
                    display: "block",
                    marginBottom: "1rem",
                  }}
                >
                  ⚠
                </span>
                <h2 style={{ marginBottom: "0.5rem" }}>
                  Failed to load content
                </h2>
                <p
                  style={{
                    color: "var(--color-muted)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {this.state.error?.message || "An unknown error occurred"}
                </p>
                <Button onClick={this.handleRetry} variant="primary">
                  Try Again
                </Button>
              </div>
            </div>
          </section>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
