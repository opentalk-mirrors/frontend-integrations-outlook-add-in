import { ListItem, ListItemText, Switch, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { EventInvite } from "../api/types/events";
import { RegisteredUser, UserKind, UserRole } from "../api/types/user";
import { useMemo } from "react";

type ParticipantListItemProps = {
  invite: EventInvite;
  isLocked: boolean;
  effectiveRole: UserRole; // Passed in already calculated
  isPendingSync: boolean;
  onToggleRole: (invite: EventInvite) => void;
};

const isRegisteredUser = (profile: EventInvite["profile"]): profile is RegisteredUser =>
  "id" in profile;

export const ParticipantListItem = ({
  invite,
  isLocked,
  effectiveRole,
  isPendingSync,
  onToggleRole,
}: ParticipantListItemProps) => {
  const { t } = useTranslation();
  const { profile } = invite;

  const isRegistered = profile.kind === UserKind.Registered && isRegisteredUser(profile);
  const isModerator = effectiveRole === UserRole.Moderator;

  const switchControl = (
    <Switch
      edge="end"
      checked={isModerator}
      onChange={() => onToggleRole(invite)}
      disabled={isLocked || !isRegistered}
      inputProps={{ "aria-label": profile.email }}
    />
  );

  // Determine Tooltip content
  const tooltipText = useMemo(() => {
    if (isRegistered) {
      return t("participants-promote-to-moderator", { ns: "dashboard" });
    }
    if (isPendingSync) {
      return t("participants-pending-tooltip", { ns: "dashboard" });
    }
    return t("participants-unregistered-tooltip", { ns: "dashboard" });
  }, [isRegistered, isPendingSync, t]);

  return (
    <ListItem
      key={isRegistered ? profile.id : profile.email}
      disableGutters
      secondaryAction={
        <Tooltip title={tooltipText} placement={isRegistered ? "left" : "top"}>
          <span>{switchControl}</span>
        </Tooltip>
      }
    >
      <ListItemText primary={profile.email} />
    </ListItem>
  );
};
