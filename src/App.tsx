import { FC } from "react";
import EventComposePage from "./components/pages/EventComposePage";
import { useClientContext } from "./providers/ClientProvider";
import { ErrorSeverity } from "./api/types/client";
import { Stack, styled, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const Container = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(1, 1, 0),
  display: "flex",
  flexDirection: "column",
  rowGap: "5px",
}));

const App: FC = () => {
  const { t } = useTranslation();
  const { client, isLoading, error } = useClientContext();

  const PageContent = () => {
    if (isLoading) {
      return <Typography>{t("loading")}</Typography>;
    }

    if (error && error.severity === ErrorSeverity.Fatal) {
      return <Typography color="error">{error.message}</Typography>;
    }

    if (!client?.auth.isAuthenticated()) {
      return <Typography color="error">{(t("auth"), { ns: "errors" })}</Typography>;
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
