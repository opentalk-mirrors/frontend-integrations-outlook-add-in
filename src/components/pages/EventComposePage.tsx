import { FC, useEffect, useState } from "react";
import { Stack, Button, Typography, Box } from "@mui/material";
import { differenceBy } from "lodash";

import { callbackAsPromise, setAsyncAsPromise } from "../../utils/OfficeHelpers";
import { useClientContext } from "../../providers/ClientProvider";
import {
  Event,
  CreateEventPayload,
  DeleteEventQueryParams,
  UpdateEventPayload,
  CreateEventInviteQueryParams,
  CreateEventQueryParams,
  UpdateEventQueryParams,
} from "../../api/types/events";
import { EmailUser } from "../../api/types/user";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import { OPENTALK_EVENT_ID, OPENTALK_INVITE_CODE } from "../../constants";
import ReactDOMServer from "react-dom/server";
import { EventBody } from "./EventBody/EventBody";
import { useTranslation } from "react-i18next";

const EVENT_INVITEES = 10;

const EventComposePage: FC = () => {
  const { client, tariff } = useClientContext();
  const isSharedFolderAvailable = !!tariff?.modules?.sharedFolder;

  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [sharedFolderEnabled, setSharedFolderEnabled] = useState(false);
  const [meetingDetailsEnabled, setMeetingDetailsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customProps, setCustomProps] = useState<Office.CustomProperties>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [existingEvent, setExistingEvent] = useState<Event | undefined>();
  const [inviteCode, setInviteCode] = useState<string | undefined>();
  const [disableButtons, setDisableButtons] = useState(false);

  const item = Office.context.mailbox.item;

  const { t } = useTranslation();

  useEffect(() => {
    Office.context.mailbox.item.loadCustomPropertiesAsync(async (result) => {
      const customProps = result.value;
      setCustomProps(customProps);
      const eventId = customProps.get(OPENTALK_EVENT_ID);
      const inviteCode = customProps.get(OPENTALK_INVITE_CODE);
      setInviteCode(inviteCode);
      if (eventId) {
        try {
          const event = await client.events.get(eventId, { inviteesMax: EVENT_INVITEES });
          setExistingEvent(event);
          setWaitingRoomEnabled(event.room.waitingRoom);
          setSharedFolderEnabled(!!event.sharedFolder);
          setMeetingDetailsEnabled(event.showMeetingDetails);
          await setAsyncAsPromise(item.body.setAsync, event.description, {
            coercionType: Office.CoercionType.Text,
          });
        } catch (error) {
          console.error("Issue with fetching OpenTalk event: ", error);
        }
      }
      setIsLoading(false);
    });
  }, []);

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

  const getInvitees = async (): Promise<Array<EmailUser>> => {
    const requiredAttendees = await callbackAsPromise<Office.EmailAddressDetails[]>(
      item.requiredAttendees.getAsync
    );
    const invitees: Array<EmailUser> = requiredAttendees.map((requiredAttendee) => ({
      email: requiredAttendee.emailAddress,
    }));
    return invitees;
  };

  const sendInvites = async (userList: Array<EmailUser>, eventId: string) => {
    const invitePromises = userList.map(async (user) => {
      const invitee = { email: user.email };
      const params: CreateEventInviteQueryParams = { suppressEmailNotification: true };
      return client?.events.createInvitation(eventId, invitee, params);
    });

    await Promise.all(invitePromises);
  };

  const createEventBody = (event: Event, inviteCode?: string): string => {
    const roomLink = new URL(
      `/room/${event.room.id}`,
      client?.config.opentalkOutlookWebAppUrl
    ).toString();
    const guestLink = inviteCode
      ? new URL(
          `/room/${event.room.id}?invite=${inviteCode}`,
          client?.config.opentalkOutlookWebAppUrl
        ).toString()
      : null;

    // Use EmailTemplate component and serialize to string
    return ReactDOMServer.renderToStaticMarkup(
      <EventBody
        event={event}
        roomLink={roomLink}
        guestLink={guestLink}
        senderName={Office.context.mailbox.userProfile.displayName}
      />
    );
  };

  const createMeeting = async () => {
    try {
      const payload = (await getEventPayload()) as CreateEventPayload;
      const queryParams = { suppressEmailNotification: true } as CreateEventQueryParams;
      const event = await client?.events.create(payload, queryParams);

      // Invite guests
      const invitees = await getInvitees();
      await sendInvites(invitees, event.id);

      // Create an invite link
      const guestInvite = await client?.rooms.createInvitation(event.room.id, {});
      await setAsyncAsPromise(item.body.setAsync, createEventBody(event, guestInvite?.inviteCode), {
        coercionType: Office.CoercionType.Html,
      });

      // Store the event id as a custom property, so it can be retrieved from
      // the event edit page.
      const customProps = await callbackAsPromise(item.loadCustomPropertiesAsync);
      customProps.set(OPENTALK_EVENT_ID, event.id);
      if (guestInvite?.inviteCode) {
        customProps.set(OPENTALK_INVITE_CODE, guestInvite?.inviteCode);
      }
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
      const queryParams = { suppressEmailNotification: true } as UpdateEventQueryParams;
      const event = await client?.events.update(existingEvent.id, payload, queryParams);
      const originalInvitees = existingEvent.invitees.map((invite) => invite.profile);
      const updatedInvitees = await getInvitees();
      const addedInvitees = differenceBy(updatedInvitees, originalInvitees, "email");

      originalInvitees.forEach(async (invitee) => {
        const isUserStillSelected = updatedInvitees.some((user) => user.email === invitee.email);
        if (!isUserStillSelected) {
          await client?.events.deleteInvitation(
            existingEvent.id,
            { email: invitee.email },
            { suppressEmailNotification: true }
          );
        }
      });

      await sendInvites(addedInvitees, event.id);

      await setAsyncAsPromise(item.body.setAsync, createEventBody(event, inviteCode), {
        coercionType: Office.CoercionType.Html,
      });

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
    return <Typography>{t("loading")}</Typography>;
  }

  if (showDisclaimer) {
    return (
      <Stack>
        <Typography>{t("outlook-meeting-cancel-success", { ns: "dashboard" })}</Typography>
        <Typography component="div">
          <Box sx={{ fontWeight: "bold", display: "inline" }}>{t("important")}</Box>
          <Box sx={{ fontWeight: "regular", display: "inline" }}>
            : {t("outlook-meeting-cancel-note", { ns: "dashboard" })}
          </Box>
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <FormSwitch
        label={t("waiting-room-switch", { ns: "dashboard" })}
        flag={waitingRoomEnabled}
        setFlag={setWaitingRoomEnabled}
      />
      {isSharedFolderAvailable && (
        <FormSwitch
          label={t("shared-folder-switch", { ns: "dashboard" })}
          flag={sharedFolderEnabled}
          setFlag={setSharedFolderEnabled}
        />
      )}
      <FormSwitch
        label={t("meeting-details-switch", { ns: "dashboard" })}
        flag={meetingDetailsEnabled}
        setFlag={setMeetingDetailsEnabled}
      />
      <Stack display="flex" direction="row-reverse" sx={{ marginTop: 1 }} spacing={1}>
        <Button sx={{ flex: 1, maxWidth: "50%" }} onClick={handleSave} disabled={disableButtons}>
          {existingEvent ? t("update") : t("create")}
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
