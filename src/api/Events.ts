import { Client } from "./Client";
import { isRequestError, RequestError } from "./types/client";
import {
  Event,
  CreateEventInvitePayload,
  CreateEventPayload,
  CreateEventQueryParams,
  DeleteEventQueryParams,
  EventInvitesResponse,
  UpdateEventPayload,
  UpdateEventQueryParams,
  GetEventQueryParams,
  DeleteEventInvitePayload,
  CreateEventInviteQueryParams,
  DeleteEventInviteQueryParams,
  UpdateEventInvitePayload,
} from "./types/events";

export class EventsAPI {
  constructor(private client: Client) {}

  /**
   * Private Helper:
   * Wraps the client response. If it sees a RequestError, it throws it.
   * Otherwise, it returns the clean data.
   */
  private async request<T>(promise: Promise<T | RequestError>): Promise<T> {
    const response = await promise;
    if (isRequestError(response)) {
      throw response;
    }

    return response;
  }

  public create(payload: CreateEventPayload, queryParams?: CreateEventQueryParams) {
    return this.client.post<Event>({ endpoint: "events", payload, queryParams });
  }

  public get(eventId: string, queryParams?: GetEventQueryParams) {
    return this.request<Event>(this.client.get({ endpoint: `events/${eventId}`, queryParams }));
  }

  public update(
    eventId: string,
    payload: UpdateEventPayload,
    queryParams?: UpdateEventQueryParams
  ) {
    return this.client.patch<Event>({ endpoint: `events/${eventId}`, payload, queryParams });
  }

  public delete(eventId: string, queryParams?: DeleteEventQueryParams) {
    return this.client.delete({ endpoint: `events/${eventId}`, queryParams });
  }

  public createInvitation(
    eventId: string,
    payload: CreateEventInvitePayload,
    queryParams?: CreateEventInviteQueryParams
  ) {
    return this.client.post({
      endpoint: `events/${eventId}/invites`,
      payload,
      queryParams,
    });
  }

  public deleteInvitation(
    eventId: string,
    payload: DeleteEventInvitePayload,
    queryParams?: DeleteEventInviteQueryParams
  ) {
    return this.client.delete({
      endpoint: `events/${eventId}/invites/email`,
      payload,
      queryParams,
    });
  }

  public getInvites(eventId: string) {
    return this.request<EventInvitesResponse>(
      this.client.get({ endpoint: `events/${eventId}/invites` })
    );
  }

  public updateInviteRole(eventId: string, userId: string, payload: UpdateEventInvitePayload) {
    return this.request<EventInvitesResponse>(
      this.client.patch({
        endpoint: `events/${eventId}/invites/${userId}`,
        payload,
      })
    );
  }
}
