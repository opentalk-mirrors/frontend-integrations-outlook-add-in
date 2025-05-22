import "react-app-polyfill/ie11";
import "whatwg-fetch";

import ReactDOM from "react-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./index.css";
import App from "./App";
import ClientProvider from "./providers/ClientProvider";
import { createOpenTalkTheme } from "./themes/opentalk";

const rootElement: HTMLElement | null = document.getElementById("container");

/* Render application after Office initializes */
Office.onReady(() => {
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <ClientProvider>
      <ThemeProvider theme={createOpenTalkTheme()}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ClientProvider>,
    rootElement
  );
});

if (module.hot) {
  module.hot.accept("./App", async () => {
    const { default: NextApp } = await import("./App");
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(<NextApp />, rootElement);
  });
}
