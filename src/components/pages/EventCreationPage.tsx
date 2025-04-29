import { FC, useState } from "react";
import { Stack, Button, List } from "@mui/material";

import { callbackAsPromise, setAsyncAsPromise } from "../../utils/OfficeHelpers";
import { useClientContext } from "../../providers/ClientProvider";
import { CreateEventPayload } from "../../api/types/events";
import { UserAutocomplete } from "../UserAutocomplete/UserAutocomplete";
import { ParticipantOption, UserRole } from "../../api/types/user";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import UserListItem from "../UserAutocomplete/fragments/UserListItem";
import { CreateEventQueryParams } from "../../api/types/events";
import { OPENTALK_EVENT_ID } from "../../constants";
import Container from "./container";

const EventCreationPage: FC = () => {
  const { client, tariff } = useClientContext();
  const isSharedFolderAvailable = !!tariff?.modules.sharedFolder;

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

      const event = await client?.events.create(payload);
      const invitePromises = selectedUsers.map(async (user) => {
        const invitee =
          "id" in user ? { invitee: user.id, role: UserRole.User } : { email: user.email };
        const params: CreateEventQueryParams = { suppressEmailNotification: true };
        return client?.events.createInvitation(event.id, invitee, params);
      });

      Promise.all(invitePromises).then(async () => {
        const attendeesEmailList = selectedUsers.map((user) => user.email);
        if (attendeesEmailList.length > 0) {
          await setAsyncAsPromise(item.requiredAttendees.setAsync, attendeesEmailList);
        }
      });

      const roomLink = new URL(`/room/${event.room.id}`, process.env.OPENTALK_OUTLOOK_HOST_URL);
      await setAsyncAsPromise(item.location.setAsync, roomLink.toString());

      const meetingRoom = `Meeting room: <a href="${roomLink}">${roomLink}</a>`;
      const bodyWithLink = body && body !== "" ? `${body}<br/><br/>${meetingRoom}` : meetingRoom;
      await setAsyncAsPromise(item.body.setAsync, bodyWithLink, {
        coercionType: Office.CoercionType.Html,
      });

      // Store the event id as a custom property, so it can be retrieved from
      // the event edit page.
      const customProps = await callbackAsPromise(item.loadCustomPropertiesAsync);
      customProps.set(OPENTALK_EVENT_ID, event.id);
      // Calling saveAsync with callBackAsPromise does throw an error
      customProps.saveAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          item.sendAsync();
          return;
        }
        console.error("Saving custom properties failed: ", result.error);
      });
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
