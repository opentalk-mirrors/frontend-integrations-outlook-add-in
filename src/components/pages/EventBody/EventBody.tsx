import { FC } from "react";
import { Event } from "../../../api/types/events";
import Box from "@mui/material/Box";
import { COLORS } from "./constants";
import { Header } from "./Header";
import { MeetingInformation } from "./MeetingInformation";
import { PhoneParticipation } from "./PhoneParticipation";
import { Footer } from "./Footer";

interface EventBodyProps {
  event: Event;
  roomLink: string;
  senderName: string;
  e2eEncryptionEnabled: boolean;
  guestLink?: string;
}

export const EventBody: FC<EventBodyProps> = ({
  event,
  roomLink,
  guestLink,
  senderName,
  e2eEncryptionEnabled,
}) => {
  return (
    <Box
      style={{
        color: COLORS.text,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Header title={event.title} senderName={senderName} />
      <MeetingInformation
        event={event}
        roomLink={roomLink}
        guestLink={guestLink}
        e2eEncryptionEnabled={e2eEncryptionEnabled}
      />
      {!e2eEncryptionEnabled && event.room.callIn && <PhoneParticipation {...event.room.callIn} />}
      <Footer roomLink={roomLink} />
    </Box>
  );
};

export default EventBody;
