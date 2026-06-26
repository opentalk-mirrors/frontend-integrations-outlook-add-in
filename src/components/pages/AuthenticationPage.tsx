import { FC } from "react";
import { Stack, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const AuthenticationPage: FC = () => {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center" justifyContent="center" height="100%" spacing={2} p={2}>
      <Typography variant="h6" align="center" gutterBottom>
        {t("fre-headline")}
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary">
        {t("fre-description")}
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary">
        {t("fre-account-hint")}
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()} // Reloads the app to trigger Client.load() again
      >
        {t("login")}
      </Button>
    </Stack>
  );
};
