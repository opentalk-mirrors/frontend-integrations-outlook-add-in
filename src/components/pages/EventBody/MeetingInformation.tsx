import { Box } from "@mui/material";
import { FC } from "react";
import { Event, isTimedEvent } from "../../../api/types/events";
import { Caption } from "./Caption";
import { Link } from "./Link";
import { useTranslation } from "react-i18next";

interface MeetingInformationProps {
  event: Event;
  roomLink: string;
  guestLink?: string;
  e2eEncryptionEnabled: boolean;
}

export const MeetingInformation: FC<MeetingInformationProps> = ({
  event,
  roomLink,
  guestLink,
  e2eEncryptionEnabled,
}) => {
  const { t } = useTranslation();
  const livestreamTarget = event.streamingTargets?.[0];

  return (
    <Box style={{ margin: "20px 0" }}>
      <Caption>{t("meeting-information")}</Caption>
      <strong>{t("title")}:</strong> {event.title}
      <br />
      {event.description !== "" && (
        <>
          <strong>{t("description")}:</strong> {event.description}
          <br />
        </>
      )}
      {isTimedEvent(event) && (
        <>
          <strong>{t("time")}:</strong>{" "}
          {`${new Date(event.startsAt.datetime).toLocaleString(undefined, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}-${new Date(event.endsAt.datetime).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}`}
          <br />
        </>
      )}
      {event.room.password && (
        <>
          <strong>{t("password")}:</strong> {event.room.password}
          <br />
        </>
      )}
      <strong>{t("meeting-link")}:</strong>{" "}
      <Link href={roomLink}>{t("meeting-link-msg", { ns: "invitation" })}</Link>
      <br />
      {guestLink && !e2eEncryptionEnabled && (
        <>
          <strong>{t("guest-link")}:</strong> <Link href={guestLink}>{guestLink}</Link>
          <br />
        </>
      )}
      {livestreamTarget?.publicUrl && (
        <>
          {t("livestream-public-info", {
            name: livestreamTarget.name || t("livestream"),
          })}{" "}
          <Link href={livestreamTarget.publicUrl}>{livestreamTarget.publicUrl}</Link>
          <br />
        </>
      )}
    </Box>
  );
};
