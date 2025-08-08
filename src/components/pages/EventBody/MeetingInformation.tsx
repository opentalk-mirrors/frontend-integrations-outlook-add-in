import { Box } from "@mui/material";
import { FC } from "react";
import { Event, isTimedEvent } from "../../../api/types/events";
import { Caption } from "./Caption";
import { Link } from "./Link";

interface MeetingInformationProps {
  event: Event;
  roomLink: string;
}

export const MeetingInformation: FC<MeetingInformationProps> = ({ event, roomLink }) => {
  return (
    <Box style={{ margin: "20px 0" }}>
      <Caption>Meeting Information</Caption>
      <strong>Title:</strong> {event.title}
      <br />
      {event.description !== "" && (
        <>
          <strong>Description:</strong> {event.description}
          <br />
        </>
      )}
      {isTimedEvent(event) && (
        <>
          <strong>Time:</strong>{" "}
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
          <strong>Password:</strong> {event.room.password}
          <br />
        </>
      )}
      <strong>Link to Meeting:</strong>{" "}
      <Link href={roomLink}>Open the conference room in new tab/window</Link>
      <br />
    </Box>
  );
};
