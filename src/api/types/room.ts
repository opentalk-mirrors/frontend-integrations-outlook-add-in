import { DateTime } from "./events";
import { RegisteredUser } from "./user";

export interface CreateRoomInvitePayload {
  expiration?: DateTime;
}

export interface Invite {
  active: boolean;
  created: DateTime;
  createdBy: RegisteredUser;
  expiration: DateTime | null;
  inviteCode?: string;
  roomId: string;
  updated: DateTime;
  updatedBy: RegisteredUser;
}
