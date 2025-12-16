import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Client } from "../api/Client";
import { ErrorContext, ContextualizedRequestError, Config } from "../api/types/client";
import { Tariff } from "../api/types/tariff";
import { EventsAPI } from "../api/Events";
import { UsersAPI } from "../api/Users";
import { AuthAPI } from "../api/Auth";
import { RoomsAPI } from "../api/Rooms";
import { StreamingTargetAPI } from "../api/StreamingTarget";
import { PrivateUserProfile } from "../api/types/privateUserProfile";

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
  me?: PrivateUserProfile;
  logout: () => void;
}

export const ClientContext = createContext<ClientState>({} as ClientState);

export const useClientContext = () => {
  return useContext(ClientContext);
};

const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<APIClient>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorContext>();
  const [tariff, setTariff] = useState<Tariff>();
  const [me, setMe] = useState<PrivateUserProfile>();

  const logout = useCallback(() => {
    // 1. Clear local state to trigger re-render
    setMe(undefined);
    setTariff(undefined);

    // 2. Clear the actual session (cookies/storage)
    Client.clearSession();
    setClient(null);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Client.load()
      .then((clientInstance) => {
        // Initialize APIs
        const authAPI = new AuthAPI(clientInstance);
        const eventsAPI = new EventsAPI(clientInstance);
        const usersAPI = new UsersAPI(clientInstance);
        const roomsAPI = new RoomsAPI(clientInstance);
        const streamingTargetAPI = new StreamingTargetAPI(clientInstance);

        setClient({
          auth: authAPI,
          events: eventsAPI,
          users: usersAPI,
          rooms: roomsAPI,
          streamingTargets: streamingTargetAPI,
          config: clientInstance.config,
        });

        // Fetch User Data
        // Ideally, run these in parallel for faster loading
        Promise.all([usersAPI.getTariff(), usersAPI.me()])
          .then(([tariffRes, meRes]) => {
            setTariff(tariffRes);
            setMe(meRes);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Failed to load user data", err);
            setIsLoading(false);
          });
      })
      .catch((error: ContextualizedRequestError) => {
        setIsLoading(false);
        setError(error.context);
      });
  }, []);

  const contextValue = useMemo(
    () => ({
      client,
      isLoading,
      error,
      tariff,
      me,
      logout,
    }),
    [client, isLoading, error, tariff, me, logout]
  );

  return <ClientContext.Provider value={contextValue}>{children}</ClientContext.Provider>;
};

export default ClientProvider;
