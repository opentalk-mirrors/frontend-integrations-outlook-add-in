import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Stack,
  Button,
  Typography,
  Box,
  TextField,
  Paper,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { callbackAsPromise, setAsyncAsPromise } from "../../utils/OfficeHelpers";
import { useClientContext } from "../../providers/ClientProvider";
import {
  Event,
  DeleteEventQueryParams,
  TrainingParticipationReportParameterSet,
  EventInvite,
} from "../../api/types/events";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import { OPENTALK_EVENT_ID, OPENTALK_INVITE_CODE, OPENTALK_OWNER_ID } from "../../constants";
import { useTranslation } from "react-i18next";
import { RequestError } from "../../api/types/client";
import { useStreamingTarget } from "../../hooks/useStreamingTarget";
import { StreamingTargetFields } from "../StreamingTargetFields";
import { ProfileHeader } from "../ProfileHeader";
import { TrainingParticipationReportSelect } from "../TrainingParticipatationReportSelect/TrainingParticipationReportSelect";
import { useTrainingParticipation } from "../../hooks/useTrainingParticipation";
import { LockReason, lockMessageKey } from "../../api/types/lockReason";
import { EventService, MeetingOptions } from "../../services/EventService";
import { removeOldMeetingBody } from "../../utils/meetingBody";
import { EventParticipantsPage, EventParticipantsPageHandle } from "./EventParticipantsPage";
import {
  buildMeetingLink,
  normalizeLocationString,
  removeMeetingLinkByBase,
  removeMeetingLinkFromLocation,
} from "../../utils/meetingLocation";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { StepIconProps } from "@mui/material/StepIcon";
import StepIcon from "@mui/material/StepIcon";
import { LoadingPage } from "./LoadingPage";

const EVENT_INVITEES = 10;
const SUPPRESS_DELETE_WARNING_KEY = "suppress-delete-warning";

const createStepIcon = (inactiveIcon: React.ReactNode) => {
  const StepIconComponent = (props: StepIconProps) => (
    <StepIcon {...props} icon={props.active ? props.icon : inactiveIcon} />
  );

  return StepIconComponent;
};

enum SidepanelPages {
  MeetingDetails = 0,
  Invited = 1,
}

const EventComposePage: FC = () => {
  const { client, tariff, me } = useClientContext();
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
  const [lockReason, setLockReason] = useState<LockReason | undefined>();
  const [disableButtons, setDisableButtons] = useState(false);
  const [disableSaveButton, setDisableSaveButton] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogHideFuture, setDeleteDialogHideFuture] = useState(false);
  const [activeStep, setActiveStep] = useState(SidepanelPages.MeetingDetails);

  // Ref to the participants page to trigger save
  const participantsRef = useRef<EventParticipantsPageHandle>(null);

  const stepIconComponents = [
    createStepIcon(<EditOutlinedIcon fontSize="small" />),
    createStepIcon(<GroupOutlinedIcon fontSize="small" />),
  ];

  const {
    enabled: trainingParticipationEnabled,
    params: trainingParticipationParams,
    toggle: toggleTrainingParticipation,
    setParams: setTrainingParticipationParams,
    validate: validateTrainingParticipation,
  } = useTrainingParticipation();

  const item = Office.context.mailbox.item;

  const isLocked = !!lockReason;

  const isOwner = (ownerId?: string) => ownerId === me.id;

  useEffect(() => {
    if (activeStep === SidepanelPages.Invited && !existingEvent) {
      setActiveStep(SidepanelPages.MeetingDetails);
    }
  }, [activeStep, existingEvent]);

  useEffect(() => {
    if (!client) {
      return;
    }

    const init = async () => {
      Office.context.mailbox.item.loadCustomPropertiesAsync(async (result) => {
        const customProps = result.value;
        setCustomProps(customProps);
        const eventId = customProps.get(OPENTALK_EVENT_ID);
        const ownerId = customProps.get(OPENTALK_OWNER_ID);
        const inviteCode = customProps.get(OPENTALK_INVITE_CODE);
        setInviteCode(inviteCode);
        if (eventId) {
          try {
            const event = await client.events.get(eventId, {
              inviteesMax: EVENT_INVITEES,
            });
            const userIsOwner = isOwner(ownerId);
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
            if (!userIsOwner && !event.canEdit) {
              setLockReason(LockReason.Invitee);
            }
          } catch (error) {
            if (error instanceof RequestError && error.statusCode === 403) {
              const userIsOwner = isOwner(ownerId);
              setLockReason(userIsOwner ? LockReason.Deleted : LockReason.NotOwnerForbidden);
            } else {
              console.error("Issue with fetching OpenTalk event: ", error);
            }
          }
        }
        setIsLoading(false);
      });
    };

    init();
  }, [
    client,
    item.body,
    setStreamingTarget,
    setTrainingParticipationParams,
    toggleLivestream,
    toggleTrainingParticipation,
  ]);

  const handleInviteesChanged = useCallback((invitees: EventInvite[]) => {
    setExistingEvent((prevEvent) => {
      // If there is no event loaded yet, do nothing
      if (!prevEvent) return prevEvent;

      return {
        ...prevEvent,
        invitees: invitees,
      };
    });
  }, []);

  const buildMeetingOptions = (): MeetingOptions => {
    const streamingPayload = buildStreamingPayload();

    return {
      waitingRoom: waitingRoomEnabled,
      sharedFolder: sharedFolderEnabled,
      showMeetingDetails: meetingDetailsEnabled,
      e2eEncryption: e2eEncryptionEnabled,
      password: password.trim() || null,
      streamingTargets: streamingPayload ? [streamingPayload] : undefined,
      trainingParticipationReport: trainingParticipationEnabled
        ? (trainingParticipationParams ?? null)
        : null,
    };
  };

  const handleClearMeetingInformation = async () => {
    setDisableButtons(true);
    try {
      const item = Office.context.mailbox.item;
      if (customProps) {
        customProps.remove(OPENTALK_EVENT_ID);
        customProps.remove(OPENTALK_OWNER_ID);
        customProps.remove(OPENTALK_INVITE_CODE);
        await callbackAsPromise<void>(customProps.saveAsync.bind(customProps));
      }
      const rawLocation = await callbackAsPromise<unknown>((cb) => item.location.getAsync(cb));
      const currentLocation = normalizeLocationString(rawLocation);
      const cleanedLocation = client?.config?.opentalkOutlookWebAppUrl
        ? existingEvent?.room?.id
          ? removeMeetingLinkFromLocation(
              currentLocation ?? "",
              buildMeetingLink(client.config.opentalkOutlookWebAppUrl, existingEvent.room.id)
            )
          : removeMeetingLinkByBase(currentLocation ?? "", client.config.opentalkOutlookWebAppUrl)
        : (currentLocation ?? "");
      await setAsyncAsPromise(item.location.setAsync, cleanedLocation);
      await setAsyncAsPromise(item.body.setAsync, "");
      setExistingEvent(undefined);
      setLockReason(undefined);
    } catch (error) {
      console.error("Unable to clear meeting information: ", error);
    } finally {
      setDisableButtons(false);
    }
  };

  const handleSave = async () => {
    if (isLocked) {
      setDisableButtons(false);
      return;
    }
    if (item.itemType !== Office.MailboxEnums.ItemType.Appointment) {
      return;
    }
    const { isValid: isStreamingValid } = validateStreaming();
    const { isValid: isTrainingParticipationValid } = validateTrainingParticipation();
    if (!isStreamingValid || !isTrainingParticipationValid) {
      setDisableSaveButton(true);
      setActiveStep(SidepanelPages.MeetingDetails);
      return;
    }

    if (!client) {
      return;
    }

    const service = new EventService(client);
    const options = buildMeetingOptions();
    setDisableButtons(true);

    try {
      if (!!existingEvent) {
        // 1. Update the meeting details
        const updatedEvent = await service.updateMeeting(
          existingEvent.id,
          options,
          existingEvent,
          inviteCode
        );

        // 2. Trigger the save on the participants page (updates roles)
        if (participantsRef.current) {
          await participantsRef.current.save();
          participantsRef.current.refresh();
        }

        await syncStreamingTarget(updatedEvent.room.id, client);
        setExistingEvent(updatedEvent);
      } else {
        const { event: newEvent, inviteCode: newInviteCode } = await service.createMeeting(options);
        const [firstTarget] = newEvent.streamingTargets ?? [];
        if (firstTarget?.id) {
          setStreamingTarget((prev) => ({ ...prev, id: firstTarget.id }));
        }
        if (newInviteCode) {
          setInviteCode(newInviteCode);
        }
        setExistingEvent(newEvent);
        participantsRef.current?.refresh();
        setActiveStep(SidepanelPages.Invited);
      }
    } catch (error) {
      console.error("Unable to save event due to the following error: ", error);
    } finally {
      setDisableButtons(false);
    }
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

  const performMeetingCancellation = useCallback(async () => {
    if (!existingEvent || !customProps || !client) {
      return;
    }
    setDisableButtons(true);
    try {
      const params: DeleteEventQueryParams = {
        forceDeleteReferenceIfExternalServicesFail: false,
        suppressEmailNotification: true,
      };
      await client.events.delete(existingEvent.id, params);
      customProps.remove(OPENTALK_EVENT_ID);
      customProps.remove(OPENTALK_OWNER_ID);
      await callbackAsPromise<void>(customProps.saveAsync.bind(customProps));
      const item = Office.context.mailbox.item;
      const rawLocation = await callbackAsPromise<unknown>((cb) => item.location.getAsync(cb));
      const currentLocation = normalizeLocationString(rawLocation);
      const meetingLink = buildMeetingLink(
        client.config.opentalkOutlookWebAppUrl,
        existingEvent.room.id
      );
      const cleanedLocation = removeMeetingLinkFromLocation(currentLocation ?? "", meetingLink);
      await setAsyncAsPromise(item.location.setAsync, cleanedLocation);
      const currentBody = await callbackAsPromise<string>((cb) =>
        item.body.getAsync(Office.CoercionType.Html, cb)
      );
      const cleanBody = removeOldMeetingBody(currentBody, existingEvent?.room?.id);
      await setAsyncAsPromise(item.body.setAsync, cleanBody, {
        coercionType: Office.CoercionType.Html,
      });
      setShowDisclaimer(true);
    } catch (error) {
      console.error("Issue with canceling event: ", error);
    } finally {
      setDisableButtons(false);
    }
  }, [client, customProps, existingEvent]);

  const handleCancelClick = () => {
    const isSuppressed = localStorage.getItem(SUPPRESS_DELETE_WARNING_KEY) === "true";

    if (isSuppressed) {
      performMeetingCancellation();
    } else {
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteDialogHideFuture) {
      localStorage.setItem(SUPPRESS_DELETE_WARNING_KEY, "true");
    }
    setDeleteDialogOpen(false);
    performMeetingCancellation();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteDialogHideFuture(false);
  };

  const switchProps = { disabled: isLocked };

  if (isLoading) {
    return <LoadingPage></LoadingPage>;
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
      {lockReason && (
        <Stack spacing={1} sx={{ marginBottom: 2 }}>
          <Alert severity="warning">{t(lockMessageKey[lockReason], { ns: "dashboard" })}</Alert>
          {lockReason === LockReason.Deleted && (
            <Button onClick={handleClearMeetingInformation} disabled={disableButtons}>
              {t("outlook-meeting-no-longer-available-delete", {
                ns: "dashboard",
              })}
            </Button>
          )}
        </Stack>
      )}
      {lockReason !== LockReason.Deleted && (
        <Box sx={{ pb: 15 }}>
          <ProfileHeader />
          <Stepper
            sx={{
              mt: 1,
              overflow: "hidden",
            }}
            activeStep={activeStep}
          >
            {[
              t("step-meeting", { ns: "dashboard" }),
              t("step-participants", { ns: "dashboard" }),
            ].map((label, index) => {
              const isParticipantsStep = index === SidepanelPages.Invited;
              const isDisabled = isParticipantsStep && !existingEvent;
              const StepIconComponent = stepIconComponents[index];

              return (
                <Step key={label} disabled={isDisabled}>
                  <StepButton
                    disabled={isDisabled}
                    onClick={() => setActiveStep(index)}
                    disableRipple
                    disableTouchRipple
                  >
                    <StepLabel StepIconComponent={StepIconComponent}>{label}</StepLabel>
                  </StepButton>
                </Step>
              );
            })}
          </Stepper>

          {/* We use display:none instead of conditional rendering to keep the 
            EventParticipantsPage mounted. This ensures pending role changes
            stored in the child's local state are not lost when switching tabs.
          */}
          <Box
            sx={{
              display: activeStep === SidepanelPages.MeetingDetails ? "block" : "none",
            }}
          >
            <Stack spacing={2} mt={2}>
              <TextField
                fullWidth
                label={t("password")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="text"
                autoComplete="off"
                size="small"
                sx={{ mt: 1 }}
                disabled={isLocked}
              />
              <FormSwitch
                label={t("waiting-room-switch", { ns: "dashboard" })}
                flag={waitingRoomEnabled}
                setFlag={setWaitingRoomEnabled}
                switchProps={switchProps}
              />
              {client.config.opentalkExperimentalEnableE2EE && (
                <FormSwitch
                  label={t("e2e-encryption-switch", { ns: "dashboard" })}
                  flag={e2eEncryptionEnabled}
                  setFlag={setE2eEncryptionEnabled}
                  switchProps={switchProps}
                />
              )}
              {isSharedFolderAvailable && (
                <FormSwitch
                  label={t("shared-folder-switch", { ns: "dashboard" })}
                  flag={sharedFolderEnabled}
                  setFlag={setSharedFolderEnabled}
                  switchProps={switchProps}
                />
              )}
              <FormSwitch
                label={t("meeting-details-switch", { ns: "dashboard" })}
                flag={meetingDetailsEnabled}
                setFlag={setMeetingDetailsEnabled}
                switchProps={switchProps}
              />
              {isStreamingEnabled && (
                <StreamingTargetFields
                  livestreamEnabled={livestreamEnabled}
                  onToggleLivestream={toggleLivestream}
                  streamingTarget={streamingTarget}
                  streamingErrors={streamingErrors}
                  setStreamingTarget={setStreamingTarget}
                  disabled={isLocked}
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
          </Box>

          <Box
            sx={{
              display: activeStep === SidepanelPages.Invited ? "block" : "none",
            }}
          >
            <EventParticipantsPage
              ref={participantsRef}
              eventId={existingEvent?.id}
              isLocked={isLocked}
              onInviteesChanged={handleInviteesChanged}
            />
          </Box>

          {/* Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {t("delete-meeting-title", { ns: "dashboard" })}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description" color="accent">
                {t("delete-meeting-description", { ns: "dashboard" })}
              </DialogContentText>
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={deleteDialogHideFuture}
                      onChange={(e) => setDeleteDialogHideFuture(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label={t("do-not-show-again", { ns: "dashboard" })}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} color="secondary" variant="outlined">
                {t("cancel")}
              </Button>
              <Button onClick={handleConfirmDelete} color="error" autoFocus>
                {t("cancel-meeting")}
              </Button>
            </DialogActions>
          </Dialog>

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
            <Stack display="flex" direction="row-reverse" m={1} spacing={1}>
              <Button
                sx={{ flex: 1, maxWidth: existingEvent ? "50%" : "100%" }}
                variant="contained"
                onClick={handleSave}
                disabled={disableButtons || disableSaveButton || isLocked}
              >
                {existingEvent ? t("update") : t("create")}
              </Button>
              {existingEvent && (
                <Button
                  sx={{ flex: 1 }}
                  variant="outlined"
                  color="error"
                  onClick={handleCancelClick}
                  disabled={disableButtons || isLocked}
                >
                  {t("cancel-meeting")}
                </Button>
              )}
            </Stack>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default EventComposePage;
