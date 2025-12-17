import { FC, useCallback, useEffect, useState } from "react";
import { Stack, Button, Typography, Box, TextField, Paper } from "@mui/material";
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
  TrainingParticipationReportParameterSet,
} from "../../api/types/events";
import { EmailUser } from "../../api/types/user";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import { StreamingTargetFields } from "../StreamingTargetFields";
import { useStreamingTarget } from "../../hooks/useStreamingTarget";
import { OPENTALK_EVENT_ID, OPENTALK_INVITE_CODE } from "../../constants";
import ReactDOMServer from "react-dom/server";
import { EventBody } from "./EventBody/EventBody";
import { useTranslation } from "react-i18next";
import { ProfileHeader } from "../ProfileHeader";
import { TrainingParticipationReportSelect } from "../TrainingParticipatationReportSelect/TrainingParticipationReportSelect";
import { useTrainingParticipation } from "../../hooks/useTrainingParticipation";

const EVENT_INVITEES = 10;

const EventComposePage: FC = () => {
  const { client, tariff } = useClientContext();
  const isSharedFolderAvailable = !!tariff?.modules?.sharedFolder;
  const isStreamingEnabled =
    tariff?.modules?.recording?.features?.some((feature) => feature.includes("stream")) ?? false;
  const isTrainingParticipationReportAvailable = !!tariff?.modules?.trainingParticipationReport;
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [e2eEncryptionEnabled, setE2eEncryptionEnabled] = useState(false);
  const [sharedFolderEnabled, setSharedFolderEnabled] = useState(false);
  const [meetingDetailsEnabled, setMeetingDetailsEnabled] = useState(true);
  const [password, setPassword] = useState("");
  const { t } = useTranslation();
  const {
    livestreamEnabled,
    streamingTarget,
    streamingErrors,
    setStreamingTarget,
    toggleLivestream,
    validateStreaming,
    buildStreamingPayload,
    syncStreamingTarget,
  } = useStreamingTarget();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customProps, setCustomProps] = useState<Office.CustomProperties | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [existingEvent, setExistingEvent] = useState<Event | undefined>();
  const [inviteCode, setInviteCode] = useState<string | undefined>();
  const [disableButtons, setDisableButtons] = useState(false);
  const [disableSaveButton, setDisableSaveButton] = useState(false);
  const {
    enabled: trainingParticipationEnabled,
    params: trainingParticipationParams,
    toggle: toggleTrainingParticipation,
    setParams: setTrainingParticipationParams,
    validate: validateTrainingParticipation,
  } = useTrainingParticipation();

  const item = Office.context.mailbox.item;
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
          setE2eEncryptionEnabled(!!event.room.e2eEncryption);
          setSharedFolderEnabled(!!event.sharedFolder);
          setMeetingDetailsEnabled(event.showMeetingDetails);
          setPassword(event.room.password ?? "");
          const [firstTarget] = event.streamingTargets ?? [];
          if (firstTarget) {
            toggleLivestream(true);
            setStreamingTarget({
              id: firstTarget.id,
              kind: firstTarget.kind ?? "custom",
              name: firstTarget.name ?? "",
              publicUrl: firstTarget.publicUrl ?? "",
              streamingEndpoint: firstTarget.streamingEndpoint ?? "",
              streamingKey: firstTarget.streamingKey ?? "",
            });
          }
          if (event.trainingParticipationReport) {
            toggleTrainingParticipation(true);
            setTrainingParticipationParams(event.trainingParticipationReport);
          }
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

    const streamingPayload = buildStreamingPayload();

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
      e2eEncryption: e2eEncryptionEnabled,
      password: password.trim() || null,
      streamingTargets: streamingPayload ? [streamingPayload] : undefined,
      trainingParticipationReport: trainingParticipationEnabled
        ? (trainingParticipationParams ?? null)
        : null,
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
          const [firstTarget] = event.streamingTargets ?? [];
          if (firstTarget?.id) {
            setStreamingTarget((prev) => ({ ...prev, id: firstTarget.id }));
          }
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
      await syncStreamingTarget(event.room.id, client);
      await client?.rooms.update(event.room.id, { e2eEncryption: e2eEncryptionEnabled });
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
    if (item.itemType !== Office.MailboxEnums.ItemType.Appointment) {
      return;
    }
    const { isValid: isStreamingValid } = validateStreaming();
    const { isValid: isTrainingParticipationValid } = validateTrainingParticipation();
    if (!isStreamingValid || !isTrainingParticipationValid) {
      setDisableSaveButton(true);
      return;
    }

    if (!!existingEvent) {
      await updateMeeting();
    } else {
      await createMeeting();
    }
    setDisableSaveButton(false);
  };

  useEffect(() => {
    if (!disableSaveButton) {
      return;
    }
    const { isValid: isStreamingValid } = validateStreaming();
    const { isValid: isTrainingParticipationValid } = validateTrainingParticipation();
    if (isStreamingValid && isTrainingParticipationValid) {
      setDisableSaveButton(false);
    }
  }, [
    disableSaveButton,
    livestreamEnabled,
    streamingTarget,
    validateStreaming,
    validateTrainingParticipation,
  ]);
  const handleTrainingReportChange = useCallback(
    (enabled: boolean, parameter?: TrainingParticipationReportParameterSet) => {
      toggleTrainingParticipation(enabled);
      if (enabled && parameter) {
        setTrainingParticipationParams(parameter);
      }
    },
    [setTrainingParticipationParams, toggleTrainingParticipation]
  );

  const handleCancel = () => {
    if (!existingEvent || !customProps) {
      return;
    }
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
    <Box sx={{ pb: 15 }}>
      <ProfileHeader />

      <Stack spacing={2} mt={2}>
        <FormSwitch
          label={t("waiting-room-switch", { ns: "dashboard" })}
          flag={waitingRoomEnabled}
          setFlag={setWaitingRoomEnabled}
        />
        {client.config.opentalkExperimentalEnableE2EE && (
          <FormSwitch
            label={t("e2e-encryption-switch", { ns: "dashboard" })}
            flag={e2eEncryptionEnabled}
            setFlag={setE2eEncryptionEnabled}
          />
        )}
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
        <TextField
          fullWidth
          label={t("password")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="text"
          autoComplete="off"
          size="small"
        />
        {isStreamingEnabled && (
          <StreamingTargetFields
            livestreamEnabled={livestreamEnabled}
            onToggleLivestream={toggleLivestream}
            streamingTarget={streamingTarget}
            streamingErrors={streamingErrors}
            setStreamingTarget={setStreamingTarget}
          />
        )}
        {isTrainingParticipationReportAvailable && (
          <TrainingParticipationReportSelect
            enabled={trainingParticipationEnabled}
            parameter={trainingParticipationParams}
            onChange={handleTrainingReportChange}
          />
        )}
      </Stack>

      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: "background.paper",
          borderTop: "1px solid rgba(0,0,0,0.12)",
          zIndex: 1300,
        }}
      >
        <Stack display="flex" direction="row-reverse" spacing={1}>
          <Button
            sx={{ flex: 1, maxWidth: existingEvent ? "50%" : "100%" }}
            variant="contained"
            onClick={handleSave}
            disabled={disableButtons || disableSaveButton}
          >
            {existingEvent ? t("update") : t("create")}
          </Button>
          {existingEvent && (
            <Button
              sx={{ flex: 1 }}
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={disableButtons}
            >
              {t("cancel")}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default EventComposePage;
