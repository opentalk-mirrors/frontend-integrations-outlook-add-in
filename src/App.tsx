import { FC } from "react";
import EventCreationPage from "./components/pages/EventCreationPage";
import { useClientContext } from "./providers/ClientProvider";
import { ErrorSeverity } from "./api/types/client";
import EventEditPage from "./components/pages/EventEditPage";

const App: FC = () => {
  const clientState = useClientContext();

  if (clientState?.isLoading) {
    return <p>Is loading</p>;
  }

  if (clientState?.error && clientState.error.severity === ErrorSeverity.Fatal) {
    return <p>{clientState.error.message}</p>;
  }

  const page = "itemId" in Office.context.mailbox.item ? <EventEditPage /> : <EventCreationPage />;
  return <>{clientState?.client?.isAuthenticated() && page}</>;
};

export default App;
