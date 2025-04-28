import { FC, useState } from "react";
import { Stack, styled, Button, List } from "@mui/material";

import { callbackAsPromise, setAsyncAsPromise } from "../../utils/OfficeHelpers";
import { useClientContext } from "../../providers/ClientProvider";
import { CreateEventPayload, Event } from "../../api/types/events";
import { UserAutocomplete } from "../UserAutocomplete/UserAutocomplete";
import { ParticipantOption } from "../../api/types/user";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import UserListItem from "../UserAutocomplete/fragments/UserListItem";

const Container = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(1, 1, 0),
  display: "flex",
  flexDirection: "column",
  rowGap: "5px",
}));

const EventCreationPage: FC = () => {
  const client = useClientContext();
  const isSharedFolderAvailable = !!client?.tariff?.modules.sharedFolder;

  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [sharedFolderEnabled, setSharedFolderEnabled] = useState(false);
  const [meetingDetailsEnabled, setMeetingDetailsEnabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Array<ParticipantOption>>([]);

  const handleUserSelect = (user: ParticipantOption) => {
    setSelectedUsers((value) => [...value, user]);
  };
  const handleRemoveUser = (user: ParticipantOption) => {
    setSelectedUsers((value) => value.filter((selectedUser) => selectedUser.email !== user.email));
  };

  const handleSave = async () => {
    const item = Office.context.mailbox.item;

    if (item.itemType !== Office.MailboxEnums.ItemType.Appointment) {
      return;
    }
    const title = await callbackAsPromise<string>(item.subject.getAsync);
    const start = await callbackAsPromise<Date>(item.start.getAsync);
    const end = await callbackAsPromise<Date>(item.end.getAsync);
    const body = await callbackAsPromise<string>((callback) =>
      item.body.getAsync(Office.CoercionType.Text, callback)
    );

    //Beta function that is not yet available in the interface
    // const isAllDay = await getAsync<boolean>(item.isAllDayEvent.getAsync);
    //More complex pattern that requires conversion to be sent to the controller
    // const recurrence = await getAsync<Office.Recurrence>(item.recurrence.getAsync);

    try {
      const payload: CreateEventPayload = {
        title,
        startsAt: {
          datetime: new Date(start).toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        endsAt: {
          datetime: new Date(end).toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        description: body,
        isTimeIndependent: false,
        isAllDay: false,
        waitingRoom: waitingRoomEnabled,
        hasSharedFolder: sharedFolderEnabled,
        showMeetingDetails: meetingDetailsEnabled,
      };

      const response = await client.client?.post<Event>("events", payload);
      const invitePromises = selectedUsers.map(async (user) => {
        const invitee = "id" in user ? { invitee: user.id, role: "user" } : { email: user.email };
        return client.client?.post(
          `events/${response.id}/invites?suppress_email_notification=true`,
          invitee
        );
      });

      Promise.all(invitePromises).then(async () => {
        const attendeesEmailList = selectedUsers.map((user) => user.email);
        if (attendeesEmailList.length > 0) {
          await setAsyncAsPromise(item.requiredAttendees.setAsync, attendeesEmailList);
        }
      });

      const roomLink = new URL(`/room/${response.room.id}`, process.env.OPENTALK_OUTLOOK_HOST_URL);
      await setAsyncAsPromise(item.location.setAsync, roomLink.toString());

      const meetingRoom = `Meeting room: <a href="${roomLink}">${roomLink}</a>`;
      const bodyWithLink = body && body !== "" ? `${body}<br/><br/>${meetingRoom}` : meetingRoom;
      await setAsyncAsPromise(item.body.setAsync, bodyWithLink, {
        coercionType: Office.CoercionType.Html,
      });

      item.sendAsync();
    } catch (error) {
      console.error("Unable to create event due to the following error: ", error);
    }
  };

  return (
    <Container>
      <FormSwitch label="Waiting Room" flag={waitingRoomEnabled} setFlag={setWaitingRoomEnabled} />
      {isSharedFolderAvailable && (
        <FormSwitch
          label="Shared folder"
          flag={sharedFolderEnabled}
          setFlag={setSharedFolderEnabled}
        />
      )}
      <FormSwitch
        label="Show meeting details"
        flag={meetingDetailsEnabled}
        setFlag={setMeetingDetailsEnabled}
      />
      <Stack>
        <UserAutocomplete selectedUsers={selectedUsers} onUserSelect={handleUserSelect} />

        {selectedUsers.length > 0 && (
          <List sx={{ marginTop: 2, dispay: "flex" }}>
            {selectedUsers.map((user) => (
              <UserListItem
                key={user.email}
                option={user}
                action={
                  <Button
                    onClick={() => handleRemoveUser(user)}
                    variant="outlined"
                    color="secondary"
                  >
                    Remove
                  </Button>
                }
              />
            ))}
          </List>
        )}
      </Stack>
      <Button onClick={handleSave} sx={{ marginTop: 1 }}>
        Create OpenTalk meeting
      </Button>
    </Container>
  );
};

export default EventCreationPage;
