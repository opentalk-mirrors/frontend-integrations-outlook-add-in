import { createRoot } from "react-dom/client";
import App from "./App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import ClientProvider from "./providers/ClientProvider";

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
Office.onReady(() => {
  root?.render(
    <FluentProvider theme={webLightTheme}>
      <ClientProvider>
        <App />
      </ClientProvider>
    </FluentProvider>
  );
});

if (module.hot) {
  module.hot.accept("./App", async () => {
    const { default: NextApp } = await import("./App");
    root?.render(<NextApp />);
  });
}
