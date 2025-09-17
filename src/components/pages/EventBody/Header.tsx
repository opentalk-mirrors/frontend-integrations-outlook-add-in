import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { COLORS } from "./constants";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  title: string;
  senderName: string;
}

export const Header: FC<HeaderProps> = ({ title, senderName }) => {
  const { t } = useTranslation();
  return (
    <Box
      style={{
        paddingBottom: "15px",
        backgroundColor: COLORS.contrastBackground,
      }}
    >
      <Typography component="h1" style={{ fontSize: "24px", margin: "10px 0" }}>
        {t("title", { ns: "invitation", title })}
      </Typography>
      <p>{t("invitor", { ns: "invitation", name: senderName })}</p>
    </Box>
  );
};
