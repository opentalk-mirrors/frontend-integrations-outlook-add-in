import { Client } from "./Client";
import {
  Event,
  CreateEventInvitePayload,
  CreateEventPayload,
  CreateEventQueryParams,
  DeleteEventQueryParams,
} from "./types/events";

export class EventsAPI {
  constructor(private client: Client) {}

  public create(payload: CreateEventPayload, params?: CreateEventQueryParams) {
    return this.client.post<Event>({ endpoint: "events", payload, queryParams: params });
  }

  public delete(eventId: string, params?: DeleteEventQueryParams) {
    return this.client.delete({ endpoint: `events/${eventId}`, queryParams: params });
  }

  public createInvitation(
    eventId: string,
    payload: CreateEventInvitePayload,
    params?: CreateEventQueryParams
  ) {
    return this.client.post({
      endpoint: `events/${eventId}/invites`,
      payload,
      queryParams: params,
    });
  }
}
