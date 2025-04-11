import { FC } from "react";
import EventCreationPage from "./components/pages/EventCreationPage";
import { useClientContext } from "./providers/ClientProvider";
import { ErrorSeverity } from "./api/types/client";

const App: FC = () => {
  const clientState = useClientContext();

  if (clientState?.isLoading) {
    return <p>Is loading</p>;
  }

  if (clientState?.error && clientState.error.severity === ErrorSeverity.Fatal) {
    return <p>{clientState.error.message}</p>;
  }

  return <>{clientState?.client?.isAuthenticated() && <EventCreationPage />}</>;
};

export default App;
