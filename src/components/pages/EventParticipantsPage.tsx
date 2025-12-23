import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { LocalPoliceOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useClientContext } from "../../providers/ClientProvider";
import { EventInvite, InviteStatus } from "../../api/types/events";
import { RegisteredUser, UserKind, UserRole } from "../../api/types/user";
import { useOutlookAttendees, normalizeEmail } from "../../hooks/useOutlookAttendees";
import { ParticipantListItem } from "../ParticipantListItem";

export type EventParticipantsPageHandle = {
  save: () => Promise<void>;
  reset: () => void;
  hasPendingChanges: boolean;
  refresh: () => void;
};

type EventParticipantsPageProps = {
  eventId?: string;
  isLocked: boolean;
  onInviteesChanged?: (invitees: EventInvite[]) => void;
};

const isRegisteredUser = (profile: EventInvite["profile"]): profile is RegisteredUser =>
  "id" in profile;

const createPlaceholderInvitee = (email: string): EventInvite => ({
  profile: {
    kind: UserKind.Unregistered,
    email,
    title: "",
    firstname: "",
    lastname: "",
    avatarUrl: "",
  },
  status: InviteStatus.Pending,
});

export const EventParticipantsPage = forwardRef<
  EventParticipantsPageHandle,
  EventParticipantsPageProps
>(({ eventId, isLocked, onInviteesChanged }, ref) => {
  const { client } = useClientContext();
  const { t } = useTranslation();

  // 1. Server & Local State
  const [apiInvitees, setApiInvitees] = useState<EventInvite[]>([]);
  const [pendingRoleUpdates, setPendingRoleUpdates] = useState<Record<string, UserRole>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const apiInviteesRef = useRef<EventInvite[]>([]);

  const { outlookInviteOrder, hasLoadedOutlookRecipients } = useOutlookAttendees(eventId);

  const searchPlaceholder = t("participants-search-placeholder", {
    ns: "dashboard",
    defaultValue: "Search",
  });

  const pendingSyncEmails = useMemo(() => {
    const apiEmails = new Set(apiInvitees.map((invite) => normalizeEmail(invite.profile.email)));
    return new Set(outlookInviteOrder.filter((email) => !apiEmails.has(email)));
  }, [apiInvitees, outlookInviteOrder]);

  const orderedInvitees = useMemo(() => {
    if (!hasLoadedOutlookRecipients) {
      return apiInvitees;
    }
    if (!outlookInviteOrder.length) {
      return [];
    }
    const apiMap = new Map(
      apiInvitees.map((invite) => [normalizeEmail(invite.profile.email), invite])
    );
    return outlookInviteOrder.map((email) => apiMap.get(email) ?? createPlaceholderInvitee(email));
  }, [apiInvitees, hasLoadedOutlookRecipients, outlookInviteOrder]);

  const filteredInvitees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return orderedInvitees;
    }
    return orderedInvitees.filter(({ profile }) => profile.email.toLowerCase().includes(term));
  }, [orderedInvitees, searchTerm]);

  const fetchInvitees = useCallback(async () => {
    if (!client || !eventId) {
      setApiInvitees([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await client.events.getInvites(eventId);
      const invitees = Array.isArray(response) ? response : (response.invitees ?? []);
      setApiInvitees(invitees);
    } catch (error) {
      console.error("Unable to fetch event invitees: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [client, eventId]);

  useImperativeHandle(
    ref,
    () => ({
      hasPendingChanges: Object.keys(pendingRoleUpdates).length > 0,
      reset: () => setPendingRoleUpdates({}),
      save: async () => {
        if (!client || !eventId || Object.keys(pendingRoleUpdates).length === 0) {
          return;
        }

        setIsSaving(true);
        try {
          const updatePromises = Object.entries(pendingRoleUpdates).map(([userId, newRole]) =>
            client.events.updateInviteRole(eventId, userId, { role: newRole })
          );

          await Promise.all(updatePromises);

          setPendingRoleUpdates({});

          const freshInvitees = await client.events.getInvites(eventId);
          if (Array.isArray(freshInvitees)) {
            setApiInvitees(freshInvitees);
          } else {
            setApiInvitees(freshInvitees.invitees ?? []);
          }
        } catch (error) {
          console.error("Failed to save participant roles", error);
        } finally {
          setIsSaving(false);
        }
      },
      refresh: () => fetchInvitees(),
    }),
    [client, eventId, pendingRoleUpdates, fetchInvitees]
  );

  useEffect(() => {
    fetchInvitees();
  }, [fetchInvitees]);

  useEffect(() => {
    if (onInviteesChanged) {
      onInviteesChanged(apiInvitees);
    }
  }, [apiInvitees, onInviteesChanged]);

  useEffect(() => {
    apiInviteesRef.current = apiInvitees;
  }, [apiInvitees]);

  useEffect(() => {
    setPendingRoleUpdates({});
    fetchInvitees();
  }, [eventId]);

  // Cleanup Effect: Remove pending role changes if user is removed from Outlook
  useEffect(() => {
    if (
      !hasLoadedOutlookRecipients ||
      apiInvitees.length === 0 ||
      Object.keys(pendingRoleUpdates).length === 0
    ) {
      return;
    }

    setPendingRoleUpdates((prev) => {
      const validEmails = new Set(outlookInviteOrder);
      const nextState = { ...prev };
      let hasChanges = false;

      const idToEmailMap = new Map<string, string>();
      for (const invite of apiInvitees) {
        if (invite.profile.kind === UserKind.Registered && isRegisteredUser(invite.profile)) {
          idToEmailMap.set(invite.profile.id, normalizeEmail(invite.profile.email));
        }
      }

      for (const userId of Object.keys(nextState)) {
        const email = idToEmailMap.get(userId);
        if (email && !validEmails.has(email)) {
          delete nextState[userId];
          hasChanges = true;
        }
      }

      return hasChanges ? nextState : prev;
    });
  }, [outlookInviteOrder, apiInvitees, hasLoadedOutlookRecipients]);

  const handleToggleRole = (invite: EventInvite) => {
    const { profile } = invite;
    if (profile.kind !== UserKind.Registered || !isRegisteredUser(profile) || isLocked) {
      return;
    }

    const profileId = profile.id;
    const originalRole = profile.role;
    const currentEffectiveRole = pendingRoleUpdates[profileId] ?? originalRole;
    const nextRole =
      currentEffectiveRole === UserRole.Moderator ? UserRole.User : UserRole.Moderator;

    setPendingRoleUpdates((prev) => {
      const nextState = { ...prev };
      if (nextRole === originalRole) {
        delete nextState[profileId];
      } else {
        nextState[profileId] = nextRole;
      }
      return nextState;
    });
  };

  return (
    <Stack spacing={2} mt={2}>
      <TextField
        fullWidth
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        type="text"
        size="small"
        sx={{
          mt: 1,
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(255, 255, 255, 0.85)",
            opacity: 1,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        inputProps={{ "aria-label": searchPlaceholder }}
      />

      {isLoading || isSaving ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <List disablePadding>
            <ListItem disablePadding secondaryAction={<LocalPoliceOutlined />}>
              <ListItemText
                primary={t("invited", { ns: "dashboard" })}
                primaryTypographyProps={{ fontStyle: "italic" }}
              />
            </ListItem>

            {filteredInvitees.map((invite) => {
              const { profile } = invite;
              // Determine if we can promote this user
              const isRegistered =
                profile.kind === UserKind.Registered && isRegisteredUser(profile);

              // Calculate role for the UI
              let effectiveRole = UserRole.User;
              if (isRegistered) {
                effectiveRole = pendingRoleUpdates[profile.id] ?? profile.role;
              }

              return (
                <ParticipantListItem
                  key={isRegistered ? profile.id : profile.email}
                  invite={invite}
                  isLocked={isLocked}
                  effectiveRole={effectiveRole}
                  isPendingSync={pendingSyncEmails.has(normalizeEmail(profile.email))}
                  onToggleRole={handleToggleRole}
                />
              );
            })}

            {!filteredInvitees.length && (
              <ListItem disableGutters>
                <ListItemText primary={t("participants-empty", { ns: "dashboard" })} />
              </ListItem>
            )}
          </List>

          <Typography variant="body2" sx={{ fontStyle: "italic", textAlign: "center" }}>
            {t("participants-disclaimer", { ns: "dashboard" })}
          </Typography>
        </>
      )}
    </Stack>
  );
});

EventParticipantsPage.displayName = "EventParticipantsPage";
