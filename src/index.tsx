import "react-app-polyfill/ie11";
import "whatwg-fetch";

import ReactDOM from "react-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./index.css";
import App from "./App";
import ClientProvider from "./providers/ClientProvider";
import { createOpenTalkTheme } from "./themes/opentalk";
import "./i18n";
import { Suspense } from "react";

import { t } from "i18next";

const rootElement: HTMLElement | null = document.getElementById("container");

/* Render application after Office initializes */
Office.onReady(() => {
  ReactDOM.render(
    <Suspense fallback={<h2>{t("loading")}</h2>}>
      <ClientProvider>
        <ThemeProvider theme={createOpenTalkTheme()}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ClientProvider>
    </Suspense>,
    rootElement
  );
});

if (module.hot) {
  module.hot.accept("./App", async () => {
    const { default: NextApp } = await import("./App");
    ReactDOM.render(<NextApp />, rootElement);
  });
}
