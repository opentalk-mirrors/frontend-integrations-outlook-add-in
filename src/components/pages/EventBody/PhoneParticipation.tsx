import Box from "@mui/material/Box";
import { FC } from "react";
import { CallInInfo } from "../../../api/types/events";
import { Caption } from "./Caption";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const PhoneParticipation: FC<CallInInfo> = ({ tel, id, password }) => {
  const { t } = useTranslation();
  return (
    <Box style={{ margin: "20px 0" }}>
      <Caption>{t("call-in-section-title", { ns: "invitation" })}</Caption>
      <Typography component="p">{t("call-in-paragraph-title", { ns: "invitation" })}</Typography>
      <Typography component="p">{t("call-in-paragraph-content", { ns: "invitation" })}</Typography>
      <strong>{t("call-in-number")}:</strong> {tel}
      <br />
      <strong>{t("call-in-conference-id")}:</strong> {id}
      <br />
      <strong>{t("call-in-conference-pin")}:</strong> {password}
      <br />
      <strong>{t("call-in-quick-dial")}:</strong> {tel},,{id},,{password}
      <br />
    </Box>
  );
};
