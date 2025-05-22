import { FC, useEffect } from "react";
import { REDIRECT_QUERY } from "../constants";
import ReactDOM from "react-dom";

const rootElement: HTMLElement | null = document.getElementById("container");

const LoginPage: FC = () => {
  useEffect(() => {
    // Redirect to the url specified in the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = decodeURI(urlParams.get(REDIRECT_QUERY));
    window.location.replace(redirect);
  }, []);

  return <p>Redirecting to the login page. Please wait.</p>;
};

// eslint-disable-next-line react/no-deprecated
ReactDOM.render(<LoginPage />, rootElement);
