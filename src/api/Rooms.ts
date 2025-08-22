import { Client } from "./Client";
import { CreateRoomInvitePayload, Invite } from "./types/room";

export class RoomsAPI {
  constructor(private client: Client) {}

  /** Creates a guest invitation for a room. */
  public createInvitation(roomId: string, payload: CreateRoomInvitePayload) {
    return this.client.post<Invite>({
      endpoint: `rooms/${roomId}/invites`,
      payload,
    });
  }
}
