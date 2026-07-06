import { Component, CSSProperties, ErrorInfo, ReactNode } from "react";
import i18n from "../i18n";
import { Client } from "../api/Client";
import {
  backgroundGradientDark,
  brandPrimary,
  textPrimaryDark,
  textPrimaryLight,
} from "../themes/opentalk/palette";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const containerStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  padding: "24px",
  boxSizing: "border-box",
  textAlign: "center",
  fontFamily: "sans-serif",
  backgroundColor: "#20434F",
  backgroundImage: backgroundGradientDark,
  color: textPrimaryDark,
};

const buttonBaseStyle: CSSProperties = {
  borderRadius: "40px",
  padding: "8px 20px",
  fontSize: "14px",
  fontFamily: "inherit",
  cursor: "pointer",
};

const reloadButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: brandPrimary,
  color: textPrimaryLight,
  border: "none",
};

const reauthenticateButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: "transparent",
  color: textPrimaryDark,
  border: `1px solid ${textPrimaryDark}`,
};

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

  private handleReauthenticate = async (): Promise<void> => {
    await Client.clearSession();
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={containerStyle}>
        <p style={{ margin: 0 }}>
          {i18n.t("error-boundary-message", {
            defaultValue: "Something went wrong while loading the OpenTalk add-in.",
          })}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" onClick={() => window.location.reload()} style={reloadButtonStyle}>
            {i18n.t("reload", { defaultValue: "Reload" })}
          </button>
          <button
            type="button"
            onClick={() => void this.handleReauthenticate()}
            style={reauthenticateButtonStyle}
          >
            {i18n.t("reauthenticate", { defaultValue: "Sign in again" })}
          </button>
        </div>
      </div>
    );
  }
}
