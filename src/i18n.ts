import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";

export const FALLBACK_LNG = "en";

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    // Though it's an overkill for now, we can use the namespace approach in the app
    // Later on, we can share the translations between projects
    ns: ["common", "errors", "dashboard", "invitation"],
    defaultNS: "common",
    // Currently there are no specific requirements for language detection or switching
    // Therefore we set the language based on the user's Office display language
    // Refer to setLanguageOnOfficeReady function below
    lng: FALLBACK_LNG,
    supportedLngs: ["en", "de"],
    fallbackLng: FALLBACK_LNG,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
  });

// IMPORTANT: Call this function after Office is ready
export const setLanguageOnOfficeReady = () =>
  i18n.changeLanguage(Office.context.displayLanguage || FALLBACK_LNG);

export default i18n;
