import { FC, useEffect, useState } from "react";
import { Stack, Button, List, Typography, Box } from "@mui/material";
import { differenceBy } from "lodash";

import { callbackAsPromise, setAsyncAsPromise } from "../../utils/OfficeHelpers";
import { useClientContext } from "../../providers/ClientProvider";
import {
  Event,
  CreateEventPayload,
  DeleteEventQueryParams,
  UpdateEventPayload,
  CreateEventInviteQueryParams,
} from "../../api/types/events";
import { UserAutocomplete } from "../UserAutocomplete/UserAutocomplete";
import { ParticipantOption, UserRole } from "../../api/types/user";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import UserListItem from "../UserAutocomplete/fragments/UserListItem";
import { OPENTALK_EVENT_ID } from "../../constants";

const EVENT_INVITEES = 10;

const EventComposePage: FC = () => {
  const { client, tariff } = useClientContext();
  const isSharedFolderAvailable = !!tariff?.modules?.sharedFolder;

  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [sharedFolderEnabled, setSharedFolderEnabled] = useState(false);
  const [meetingDetailsEnabled, setMeetingDetailsEnabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Array<ParticipantOption>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customProps, setCustomProps] = useState<Office.CustomProperties>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [existingEvent, setExistingEvent] = useState<Event | undefined>();
  const [disableButtons, setDisableButtons] = useState(false);

  const item = Office.context.mailbox.item;

  useEffect(() => {
    Office.context.mailbox.item.loadCustomPropertiesAsync((result) => {
      const customProps = result.value;
      setCustomProps(customProps);
      const eventId = customProps.get(OPENTALK_EVENT_ID);
      if (eventId) {
        client.events
          .get(eventId, { inviteesMax: EVENT_INVITEES })
          .then((event) => {
            setExistingEvent(event);
            setWaitingRoomEnabled(event.room.waitingRoom);
            setSharedFolderEnabled(!!event.sharedFolder);
            setMeetingDetailsEnabled(event.showMeetingDetails);
            const invitees = event.invitees.map((invite) => invite.profile);
            setSelectedUsers(invitees);
          })
          .catch((error) => {
            console.error("Issue with fetching OpenTalk event: ", error);
          });
      }
      setIsLoading(false);
    });
  }, []);

  const handleUserSelect = (user: ParticipantOption) => {
    setSelectedUsers((value) => [...value, user]);
  };
  const handleRemoveUser = (user: ParticipantOption) => {
    setSelectedUsers((value) => value.filter((selectedUser) => selectedUser.email !== user.email));
  };

  const getEventPayload = async (): Promise<CreateEventPayload | UpdateEventPayload> => {
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

    return {
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
  };

  const sendInvites = async (userList: Array<ParticipantOption>, eventId: string) => {
    const invitePromises = userList.map(async (user) => {
      const invitee =
        "id" in user ? { invitee: user.id, role: UserRole.User } : { email: user.email };
      const params: CreateEventInviteQueryParams = { suppressEmailNotification: true };
      return client?.events.createInvitation(eventId, invitee, params);
    });

    await Promise.all(invitePromises);
    const attendeesEmailList = selectedUsers.map((user) => user.email);
    if (attendeesEmailList.length > 0) {
      await setAsyncAsPromise(item.requiredAttendees.setAsync, attendeesEmailList);
    }
  };

  const createMeeting = async () => {
    try {
      const payload = (await getEventPayload()) as CreateEventPayload;
      const event = await client?.events.create(payload);
      await sendInvites(selectedUsers, event.id);

      const roomLink = new URL(`/room/${event.room.id}`, client?.config.opentalkOutlookWebAppUrl);
      await setAsyncAsPromise(item.location.setAsync, roomLink.toString());

      const meetingRoom = `Meeting room: <a href="${roomLink}">${roomLink}</a>`;
      const bodyWithLink =
        payload.description && payload.description !== ""
          ? `${payload.description}<br/><br/>${meetingRoom}`
          : meetingRoom;
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
          setExistingEvent(event);
          item.sendAsync();
          return;
        }
        console.error("Saving custom properties failed: ", result.error);
      });
    } catch (error) {
      console.error("Unable to create event due to the following error: ", error);
    }
  };

  const updateMeeting = async () => {
    try {
      const payload = (await getEventPayload()) as UpdateEventPayload;
      const event = await client?.events.update(existingEvent.id, payload);
      const existingInvitees = existingEvent.invitees.map((invite) => invite.profile);
      const newInvitees = differenceBy(selectedUsers, existingInvitees, "email");

      existingInvitees.forEach(async (invitee) => {
        const isUserStillSelected = selectedUsers.some((user) => user.email === invitee.email);
        if (!isUserStillSelected) {
          await client?.events.deleteInvitation(
            existingEvent.id,
            { email: invitee.email },
            { suppressEmailNotification: true }
          );
        }
      });

      await sendInvites(newInvitees, event.id);

      item.sendAsync();
    } catch (error) {
      console.error("Unable to save event due to the following error: ", error);
    }
  };

  const handleSave = async () => {
    setDisableButtons(true);
    if (item.itemType !== Office.MailboxEnums.ItemType.Appointment) {
      return;
    }

    if (!!existingEvent) {
      await updateMeeting();
    } else {
      await createMeeting();
    }
    setDisableButtons(false);
  };

  const handleCancel = () => {
    setDisableButtons(true);
    const params: DeleteEventQueryParams = {
      forceDeleteReferenceIfExternalServicesFail: false,
      suppressEmailNotification: true,
    };
    client.events
      .delete(existingEvent?.id, params)
      .then(async () => {
        customProps.remove(OPENTALK_EVENT_ID);
        customProps.saveAsync(() => setShowDisclaimer(true));
        const item = Office.context.mailbox.item;
        await setAsyncAsPromise(item.location.setAsync, "");
        await setAsyncAsPromise(item.body.setAsync, "");
      })
      .catch((error) => {
        console.error("Issue with canceling event: ", error);
      })
      .finally(() => setDisableButtons(false));
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (showDisclaimer) {
    return (
      <Stack>
        <Typography>Meeting successfully cancelled.</Typography>
        <Typography component="div">
          <Box sx={{ fontWeight: "bold", display: "inline" }}>Important</Box>
          <Box sx={{ fontWeight: "regular", display: "inline" }}>
            : You will have to manually cancel it in Outlook.
          </Box>
        </Typography>
      </Stack>
    );
  }

  return (
    <>
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
      <Stack display="flex" direction="row-reverse" sx={{ marginTop: 1 }} spacing={1}>
        <Button sx={{ flex: 1, maxWidth: "50%" }} onClick={handleSave} disabled={disableButtons}>
          {existingEvent ? "Update" : "Create"}
        </Button>
        {existingEvent && (
          <Button sx={{ flex: 1 }} color="error" onClick={handleCancel} disabled={disableButtons}>
            Cancel
          </Button>
        )}
      </Stack>
    </>
  );
};

export default EventComposePage;
