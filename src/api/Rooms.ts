import { Client } from "./Client";
import { CreateRoomInvitePayload, Invite, UpdateRoomPayload } from "./types/room";

export class RoomsAPI {
  constructor(private client: Client) {}

  /** Creates a guest invitation for a room. */
  public createInvitation(roomId: string, payload: CreateRoomInvitePayload) {
    return this.client.post<Invite>({
      endpoint: `rooms/${roomId}/invites`,
      payload,
    });
  }

  /** Updates a room (e.g. toggle E2E encryption, waiting room, password). */
  public update(roomId: string, payload: UpdateRoomPayload) {
    return this.client.patch<Invite>({
      endpoint: `rooms/${roomId}`,
      payload,
    });
  }
}
