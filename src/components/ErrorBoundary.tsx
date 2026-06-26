import { Component, ErrorInfo, ReactNode } from "react";
import i18n from "../i18n";
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Prevents a single render-time error from leaving the user with a blank
// white taskpane (observed on some Safari/Outlook combinations) by rendering
// a visible fallback message instead.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled error in OpenTalk add-in:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "16px", textAlign: "center", fontFamily: "sans-serif" }}>
          <p>
            {i18n.t("error-boundary-message", {
              defaultValue: "Something went wrong while loading the OpenTalk add-in.",
            })}
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            {i18n.t("reload", { defaultValue: "Reload" })}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
