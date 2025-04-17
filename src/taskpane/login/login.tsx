import { FC, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { REDIRECT_QUERY } from "../constants";

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

const LoginPage: FC = () => {
  useEffect(() => {
    // Redirect to the url specified in the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = decodeURI(urlParams.get(REDIRECT_QUERY));
    window.location.replace(redirect);
  }, []);

  return <p>Redirecting to the login page. Please wait.</p>;
};

root?.render(<LoginPage />);
