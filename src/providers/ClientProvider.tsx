import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Client } from "../api/Client";
import { ErrorContext, ContextualizedRequestError, Config } from "../api/types/client";
import { Tariff } from "../api/types/tariff";
import { EventsAPI } from "../api/Events";
import { UsersAPI } from "../api/Users";
import { AuthAPI } from "../api/Auth";
import { RoomsAPI } from "../api/Rooms";
import { StreamingTargetAPI } from "../api/StreamingTarget";

interface APIClient {
  auth: AuthAPI;
  events: EventsAPI;
  rooms: RoomsAPI;
  users: UsersAPI;
  streamingTargets: StreamingTargetAPI;
  config: Config;
}

interface ClientState {
  client: APIClient | null;
  isLoading: boolean;
  error?: ErrorContext;
  tariff?: Tariff;
}

export const ClientContext = createContext<ClientState>(null);

export const useClientContext = () => {
  const contextValue = useContext(ClientContext);

  return contextValue;
};

const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<APIClient>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorContext>();
  const [tariff, setTariff] = useState<Tariff>();

  useEffect(() => {
    setIsLoading(true);
    Client.load()
      .then((client) => {
        const authAPI = new AuthAPI(client);
        const eventsAPI = new EventsAPI(client);
        const usersAPI = new UsersAPI(client);
        const roomsAPI = new RoomsAPI(client);
        const streamingTargetAPI = new StreamingTargetAPI(client);
        setClient({
          auth: authAPI,
          events: eventsAPI,
          users: usersAPI,
          rooms: roomsAPI,
          streamingTargets: streamingTargetAPI,
          config: client.config,
        });
        usersAPI.getTariff().then((response) => {
          setTariff(response);
        });

        setIsLoading(false);
      })
      .catch((error: ContextualizedRequestError) => {
        setIsLoading(false);
        setError(error.context);
      });
  }, []);

  return (
    <ClientContext.Provider value={{ client, isLoading, error, tariff }}>
      {children}
    </ClientContext.Provider>
  );
};

export default ClientProvider;
