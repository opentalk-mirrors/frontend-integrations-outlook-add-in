import { Box, Link } from "@mui/material";
import { FC } from "react";
import { COLORS } from "./constants";
import { useTranslation } from "react-i18next";

interface FooterProps {
  roomLink: string;
}

export const Footer: FC<FooterProps> = ({ roomLink }) => {
  const { t } = useTranslation();
  return (
    <>
      <Box
        style={{ backgroundColor: COLORS.contrastBackground, padding: "20px 0", margin: "15px" }}
      >
        {t("join-meeting-hint", { ns: "invitation" })}
        <br />
        {roomLink}
      </Box>
      {t("quick-guide-hint", { ns: "invitation" })}
      <Link href="https://opentalk.eu/en/quick-manual">https://opentalk.eu/en/quick-manual</Link>
    </>
  );
};
