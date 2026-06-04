// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GuestAccess } from "../../api/types/events";

/**
 * UI representation for the waiting-room toggle group. The underlying form
 * values remain `waitingRoom: boolean` and `guestAccess: GuestAccess`
 */
export enum WaitingRoomMode {
  Inactive = "inactive",
  AllParticipants = "all_participants",
  GuestsOnly = "guests_only",
}

export interface FormSlice {
  waitingRoom: boolean;
  guestAccess: GuestAccess;
}

export interface UiState {
  guestAccessEnabled: boolean;
  waitingRoomMode: WaitingRoomMode;
}

/**
 * Derive the UI state (switch + toggle group) from the form values
 *
 *   waitingRoom=true                                → mode "all-participants"
 *   waitingRoom=false, guestAccess=WaitingRoom      → mode "guests-only"
 *   otherwise                                       → mode "inactive"
 */
export const deriveUiState = ({ waitingRoom, guestAccess }: FormSlice): UiState => ({
  guestAccessEnabled: guestAccess !== GuestAccess.Disabled,
  waitingRoomMode: waitingRoom
    ? WaitingRoomMode.AllParticipants
    : guestAccess === GuestAccess.WaitingRoom
      ? WaitingRoomMode.GuestsOnly
      : WaitingRoomMode.Inactive,
});

// Map a UI state (toggle group + guest-access switch) back to the `(waitingRoom, guestAccess)` pair
export const computeFormValues = ({ waitingRoomMode, guestAccessEnabled }: UiState): FormSlice => {
  // If guest access is disabled, guestAccess is always Disabled
  // The waiting room is only active here if the mode was explicitly "all-participants"
  if (!guestAccessEnabled) {
    return {
      waitingRoom: waitingRoomMode === WaitingRoomMode.AllParticipants,
      guestAccess: GuestAccess.Disabled,
    };
  }

  const modeMappings: Record<WaitingRoomMode, FormSlice> = {
    [WaitingRoomMode.AllParticipants]: { waitingRoom: true, guestAccess: GuestAccess.WaitingRoom },
    [WaitingRoomMode.GuestsOnly]: { waitingRoom: false, guestAccess: GuestAccess.WaitingRoom },
    [WaitingRoomMode.Inactive]: { waitingRoom: false, guestAccess: GuestAccess.DirectAccess },
  };

  return modeMappings[waitingRoomMode];
};
