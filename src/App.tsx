import { FC } from "react";
import EventCreationPage from "./components/pages/EventCreationPage";
import { useClientContext } from "./providers/ClientProvider";
import { ErrorSeverity } from "./api/types/client";
import EventEditPage from "./components/pages/EventEditPage";
import { Stack, styled, Typography } from "@mui/material";

const Container = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(1, 1, 0),
  display: "flex",
  flexDirection: "column",
  rowGap: "5px",
}));

const App: FC = () => {
  const { client, isLoading, error } = useClientContext();

  const PageContent = () => {
    if (isLoading) {
      return <Typography>Loading...</Typography>;
    }

    if (error && error.severity === ErrorSeverity.Fatal) {
      return <Typography color="error">{error.message}</Typography>;
    }

    if (!client?.auth.isAuthenticated()) {
      return <Typography color="error">Authentication failed</Typography>;
    }

    return "itemId" in Office.context.mailbox.item ? <EventEditPage /> : <EventCreationPage />;
  };

  return (
    <Container>
      <PageContent />
    </Container>
  );
};

export default App;
