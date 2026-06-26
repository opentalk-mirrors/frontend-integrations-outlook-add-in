import "react-app-polyfill/ie11";
import "whatwg-fetch";

import ReactDOM from "react-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./index.css";
import App from "./App";
import ClientProvider from "./providers/ClientProvider";
import { createOpenTalkTheme } from "./themes/opentalk";
import { Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { setLanguageOnOfficeReady } from "./i18n";

const rootElement: HTMLElement | null = document.getElementById("container");

Office.onReady(() => {
  try {
    setLanguageOnOfficeReady();
  } catch (error) {
    console.error("Unable to set language on Office ready:", error);
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Suspense fallback={<h2>Loading...</h2>}>
        <ClientProvider>
          <ThemeProvider theme={createOpenTalkTheme()}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </ClientProvider>
      </Suspense>
    </ErrorBoundary>,
    rootElement
  );
});

if (module.hot) {
  module.hot.accept("./App", async () => {
    const { default: NextApp } = await import("./App");
    ReactDOM.render(<NextApp />, rootElement);
  });
}
