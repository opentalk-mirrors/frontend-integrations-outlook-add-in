// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  FormControl,
  FormLabel,
  Stack,
  SwitchProps,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { GuestAccess } from "../../api/types/events";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import { computeFormValues, deriveUiState, WaitingRoomMode } from "./guestAccessMapping";

interface AccessSettingsProps {
  waitingRoomEnabled: boolean;
  guestAccess: GuestAccess;
  setWaitingRoomEnabled: (value: boolean) => void;
  setGuestAccess: (value: GuestAccess) => void;
  guestAccessAllowed: boolean;
  isLocked: boolean;
  switchProps: SwitchProps;
}

export const AccessSettings = ({
  waitingRoomEnabled,
  guestAccess,
  setWaitingRoomEnabled,
  setGuestAccess,
  guestAccessAllowed = true,
  isLocked = false,
  switchProps,
}: AccessSettingsProps) => {
  const { t } = useTranslation();

  const derived = deriveUiState({ waitingRoom: waitingRoomEnabled, guestAccess });
  const guestAccessEnabled = guestAccessAllowed && derived.guestAccessEnabled;
  const waitingRoomMode: WaitingRoomMode =
    !guestAccessAllowed && derived.waitingRoomMode === WaitingRoomMode.GuestsOnly
      ? WaitingRoomMode.Inactive
      : derived.waitingRoomMode;

  const applyState = (mode: WaitingRoomMode, gaEnabled: boolean) => {
    const next = computeFormValues({ waitingRoomMode: mode, guestAccessEnabled: gaEnabled });
    setWaitingRoomEnabled(next.waitingRoom);
    setGuestAccess(next.guestAccess);
  };

  const handleGuestAccessSwitchChange = (checked: boolean) => {
    const nextMode: WaitingRoomMode =
      !checked && waitingRoomMode === WaitingRoomMode.GuestsOnly
        ? WaitingRoomMode.Inactive
        : waitingRoomMode;
    applyState(nextMode, checked);
  };

  return (
    <Stack spacing={1}>
      {guestAccessAllowed && (
        <FormSwitch
          label={t("guest-access-switch", { ns: "dashboard" })}
          flag={guestAccessEnabled}
          setFlag={handleGuestAccessSwitchChange}
          switchProps={switchProps}
        />
      )}
      <FormControl component="fieldset" disabled={isLocked}>
        <FormLabel component="legend" sx={{ color: "text.primary" }}>
          {t("waiting-room-switch", { ns: "dashboard" })}
        </FormLabel>
        <ToggleButtonGroup
          value={waitingRoomMode}
          exclusive
          onChange={(_, value: WaitingRoomMode | null) => {
            if (value === null) {
              return;
            }
            applyState(value, guestAccessEnabled);
          }}
          aria-label={t("waiting-room-switch", { ns: "dashboard" })}
          size="small"
          sx={{ mt: 1 }}
        >
          <ToggleButton value={WaitingRoomMode.Inactive}>
            {t("waiting-room-option-disabled", { ns: "dashboard" })}
          </ToggleButton>
          <ToggleButton value={WaitingRoomMode.GuestsOnly} disabled={!guestAccessEnabled}>
            {t("waiting-room-option-guests-only", { ns: "dashboard" })}
          </ToggleButton>
          <ToggleButton value={WaitingRoomMode.AllParticipants}>
            {t("waiting-room-option-all-participants", { ns: "dashboard" })}
          </ToggleButton>
        </ToggleButtonGroup>
      </FormControl>
    </Stack>
  );
};
