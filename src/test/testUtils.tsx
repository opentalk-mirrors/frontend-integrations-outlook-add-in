import { ReactElement } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createOpenTalkTheme } from "../themes/opentalk";

// Dedicated i18n instance for tests
const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: ["common", "errors", "dashboard", "invitation"],
  defaultNS: "common",
  resources: {},
  interpolation: { escapeValue: false },
});

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={testI18n}>
    <ThemeProvider theme={createOpenTalkTheme()}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  </I18nextProvider>
);

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult => render(ui, { wrapper: AllProviders, ...options });

export { testI18n };
