import { FC } from "react";
import { Stack, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const AuthenticationPage: FC = () => {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center" justifyContent="center" height="100%">
      <Typography variant="h6" gutterBottom>
        {t("please-sign-in")}
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
