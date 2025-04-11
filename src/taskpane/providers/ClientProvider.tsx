import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Client } from "../api/Client";
import { ErrorContext, ContextualizedRequestError } from "../api/types/client";

interface ClientState {
  client: Client | null;
  isLoading: boolean;
  error?: ErrorContext;
}

export const ClientContext = createContext<ClientState>(null);

export const useClientContext = () => {
  const contextValue = useContext(ClientContext);

  return contextValue;
};

const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Client>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorContext>();

  useEffect(() => {
    setIsLoading(true);
    Client.load()
      .then((client) => {
        setClient(client);
        setIsLoading(false);
      })
      .catch((error: ContextualizedRequestError) => {
        setIsLoading(false);
        setError(error.context);
      });
  }, []);

  return (
    <ClientContext.Provider value={{ client, isLoading, error }}>{children}</ClientContext.Provider>
  );
};

export default ClientProvider;
