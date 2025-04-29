import { FC } from "react";
import EventCreationPage from "./components/pages/EventCreationPage";
import { useClientContext } from "./providers/ClientProvider";
import { ErrorSeverity } from "./api/types/client";
import EventEditPage from "./components/pages/EventEditPage";

const App: FC = () => {
  const { client, isLoading, error } = useClientContext();

  if (isLoading) {
    return <p>Is loading</p>;
  }

  if (error && error.severity === ErrorSeverity.Fatal) {
    return <p>{error.message}</p>;
  }

  const page = "itemId" in Office.context.mailbox.item ? <EventEditPage /> : <EventCreationPage />;
  return <>{client?.auth.isAuthenticated() && page}</>;
};

export default App;
