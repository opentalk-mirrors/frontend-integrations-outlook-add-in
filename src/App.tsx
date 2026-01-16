import { FC, useEffect } from "react";
import EventComposePage from "./components/pages/EventComposePage";
import { useClientContext } from "./providers/ClientProvider";
import { ErrorSeverity } from "./api/types/client";
import { Stack, styled, Typography } from "@mui/material";
import { LoadingPage } from "./components/pages/LoadingPage";
import { AuthenticationPage } from "./components/pages/AuthenticationPage";
import { OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY } from "./constants";
import { clearTaskpaneCloseSignal, consumeTaskpaneCloseSignal } from "./utils/taskpaneSignal";

const App: FC = () => {
  const { client, isLoading, error } = useClientContext();

  const Container = styled(Stack)(({ theme }) => ({
    minHeight: "100vh",
    padding: theme.spacing(0, 1, 0),
    display: "flex",
    flexDirection: "column",
    rowGap: "5px",
  }));

  useEffect(() => {
    const closeIfSignaled = async () => {
      const shouldClose = await consumeTaskpaneCloseSignal();
      if (!shouldClose) {
        return;
      }

      try {
        // Commands run in a separate runtime and can't reliably close the taskpane in Office,
        // so the taskpane watches a storage signal and closes itself.
        if (Office?.addin?.hide) {
          await Office.addin.hide();
          window.clearInterval(interval);
          return;
        }
        const ui = Office.context?.ui as { closeContainer?: () => void } | undefined;
        ui?.closeContainer?.();
      } catch (error) {
        console.warn("Unable to close taskpane:", error);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY) {
        void closeIfSignaled();
      }
    };

    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(closeIfSignaled, 500);
    // We clear the signal here first, to prevent the taskpane from closing when we create the meeting with default settings first.
    void clearTaskpaneCloseSignal();
    void closeIfSignaled();

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, []);

  const PageContent = () => {
    if (isLoading) {
      return <LoadingPage />;
    }

    if (error && error.severity === ErrorSeverity.Fatal) {
      return <Typography color="error">{error.message}</Typography>;
    }

    if (!client?.auth.isAuthenticated()) {
      return <AuthenticationPage />;
    }

    return <EventComposePage />;
  };

  return (
    <Container>
      <PageContent />
    </Container>
  );
};

export default App;
