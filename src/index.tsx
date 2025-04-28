import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ClientProvider from "./providers/ClientProvider";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createOpenTalkTheme } from "./themes/opentalk";

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
Office.onReady(() => {
  root?.render(
    <ClientProvider>
      <ThemeProvider theme={createOpenTalkTheme()}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ClientProvider>
  );
});

if (module.hot) {
  module.hot.accept("./App", async () => {
    const { default: NextApp } = await import("./App");
    root?.render(<NextApp />);
  });
}
