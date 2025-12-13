import { FC } from "react";
import EventComposePage from "./components/pages/EventComposePage";
import { useClientContext } from "./providers/ClientProvider";
import { ErrorSeverity } from "./api/types/client";
import { Stack, styled, Typography } from "@mui/material";
import { LoadingPage } from "./components/pages/LoadingPage";
import { AuthenticationPage } from "./components/pages/AuthenticationPage";

const App: FC = () => {
  const { client, isLoading, error } = useClientContext();

  const Container = styled(Stack)(({ theme }) => ({
    minHeight: "100vh",
    padding: theme.spacing(0, 1, 0),
    display: "flex",
    flexDirection: "column",
    rowGap: "5px",
  }));

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
