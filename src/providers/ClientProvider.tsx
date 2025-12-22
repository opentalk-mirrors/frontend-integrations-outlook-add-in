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
import { ContextualizedRequestError, ErrorContext } from "../api/types/client";
import { Tariff } from "../api/types/tariff";
import { PrivateUserProfile } from "../api/types/privateUserProfile";
import { APIClient, initializeApiClient } from "../api/apiService";

interface ClientState {
  client: APIClient | null;
  isLoading: boolean;
  error?: ErrorContext;
  tariff?: Tariff;
  me?: PrivateUserProfile;
  logout: () => Promise<void>;
}

export const ClientContext = createContext<ClientState | null>(null);

export const useClientContext = () => {
  const contextValue = useContext(ClientContext);
  if (!contextValue) {
    throw new Error("useClientContext must be used within a ClientProvider");
  }
  return contextValue;
};

const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<APIClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorContext>();
  const [tariff, setTariff] = useState<Tariff>();
  const [me, setMe] = useState<PrivateUserProfile>();

  const logout = useCallback(async () => {
    // 1. Clear local state to trigger re-render
    setMe(undefined);
    setTariff(undefined);

    // 2. Clear the actual session (cookies/storage)
    await Client.clearSession();
    setClient(null);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    initializeApiClient()
      .then((apiClient) => {
        setClient(apiClient);

        // Fetch User Data
        return Promise.all([apiClient.users.getTariff(), apiClient.users.me()]).then(
          ([tariffRes, meRes]) => {
            setTariff(tariffRes);
            setMe(meRes);
          }
        );
      })
      .catch((error: ContextualizedRequestError | Error) => {
        if ("context" in error) {
          setError((error as ContextualizedRequestError).context);
        } else {
          console.error(error);
        }
      })
      .finally(() => {
        setIsLoading(false);
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
