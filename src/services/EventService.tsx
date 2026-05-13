import ReactDOMServer from "react-dom/server";
import differenceBy from "lodash/differenceBy";
import {
  CreateEventPayload,
  Event,
  UpdateEventPayload,
  UpdateEventQueryParams,
  TrainingParticipationReportParameterSet,
  GuestAccess,
} from "../api/types/events";
import { EmailUser } from "../api/types/user";
import { APIClient } from "../api/apiService";
import { EventBody } from "../components/pages/EventBody/EventBody";
import { OPENTALK_EVENT_ID, OPENTALK_INVITE_CODE, OPENTALK_OWNER_ID } from "../constants";
import { callbackAsPromise, setAsyncAsPromise } from "../utils/OfficeHelpers";
import {
  MEETING_BODY_ID,
  getUpdatedMeetingBody,
  htmlToText,
  isEmptyHtmlContent,
  removeOldMeetingBody,
} from "../utils/meetingBody";
import { StreamingTargetPayload } from "../api/types/streamingTarget";
import {
  appendMeetingLinkToLocation,
  buildMeetingLink,
  normalizeLocationString,
  removeMeetingLinkFromLocation,
} from "../utils/meetingLocation";

export interface MeetingOptions {
  waitingRoom: boolean;
  sharedFolder: boolean;
  showMeetingDetails: boolean;
  e2eEncryption?: boolean;
  password?: string | null;
  streamingTargets?: StreamingTargetPayload[];
  trainingParticipationReport?: TrainingParticipationReportParameterSet | null;
  guestAccess: GuestAccess;
}

type TranslationOptions = Record<string, string | number | boolean>;

export class EventService {
  constructor(
    private client: APIClient,
    _t?: (key: string, options?: TranslationOptions) => string
  ) {}

  private async updateLocationWithMeetingLink(meetingLink: string, previousMeetingLink?: string) {
    const item = Office.context.mailbox.item;
    const rawLocation = await callbackAsPromise<unknown>((cb) => item.location.getAsync(cb));
    const currentLocation = normalizeLocationString(rawLocation);
    const locationWithoutOldLink =
      previousMeetingLink && currentLocation
        ? removeMeetingLinkFromLocation(currentLocation, previousMeetingLink)
        : (currentLocation ?? "");
    const nextLocation = appendMeetingLinkToLocation(locationWithoutOldLink, meetingLink);
    await setAsyncAsPromise(item.location.setAsync, nextLocation);
  }

  private async getEventPayload(
    options: MeetingOptions,
    currentRoomId?: string
  ): Promise<CreateEventPayload | UpdateEventPayload> {
    const item = Office.context.mailbox.item;

    const title = await callbackAsPromise<string>(item.subject.getAsync);
    const start = await callbackAsPromise<Date>(item.start.getAsync);
    const end = await callbackAsPromise<Date>(item.end.getAsync);
    const fullBodyHtml = await callbackAsPromise<string>((cb) =>
      item.body.getAsync(Office.CoercionType.Html, cb)
    );
    const cleanBodyHtml = removeOldMeetingBody(fullBodyHtml, currentRoomId);
    const descriptionSource = isEmptyHtmlContent(cleanBodyHtml) ? "" : cleanBodyHtml;
    const description = htmlToText(descriptionSource).trim();

    return {
      title,
      startsAt: {
        datetime: new Date(start).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      endsAt: {
        datetime: new Date(end).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      description,
      isTimeIndependent: false,
      isAllDay: false,
      waitingRoom: options.waitingRoom,
      hasSharedFolder: options.sharedFolder,
      showMeetingDetails: options.showMeetingDetails,
      e2eEncryption: options.e2eEncryption ?? false,
      password: options.password ?? undefined,
      streamingTargets: options.streamingTargets,
      trainingParticipationReport:
        options.trainingParticipationReport === undefined
          ? null
          : options.trainingParticipationReport,
      guestAccess: options.guestAccess,
    } as CreateEventPayload;
  }

  private async getInvitees(): Promise<Array<EmailUser>> {
    const item = Office.context.mailbox.item;
    const requiredAttendees = await callbackAsPromise<Office.EmailAddressDetails[]>(
      item.requiredAttendees.getAsync
    );
    const invitees: Array<EmailUser> = requiredAttendees.map((requiredAttendee) => ({
      email: requiredAttendee.emailAddress,
    }));
    return invitees;
  }

  private createEventBody(
    event: Event,
    e2eEncryptionEnabled: boolean,
    inviteCode?: string
  ): string {
    const roomLink = new URL(
      `/room/${event.room.id}`,
      this.client.config.opentalkOutlookWebAppUrl
    ).toString();

    const guestLink = inviteCode
      ? new URL(
          `/room/${event.room.id}?invite=${inviteCode}`,
          this.client.config.opentalkOutlookWebAppUrl
        ).toString()
      : null;

    const markup = ReactDOMServer.renderToStaticMarkup(
      <EventBody
        event={event}
        roomLink={roomLink}
        guestLink={guestLink}
        e2eEncryptionEnabled={e2eEncryptionEnabled}
        senderName={Office.context.mailbox.userProfile.displayName}
      />
    );

    return `<div id="${MEETING_BODY_ID}">${markup}</div>`;
  }

  private async sendInvites(userList: Array<EmailUser>, eventId: string) {
    const invitePromises = userList.map(async (user) => {
      const invitee = { email: user.email };
      return this.client.events.createInvitation(eventId, invitee, {
        suppressEmailNotification: true,
      });
    });

    await Promise.all(invitePromises);
  }

  // Create Meeting
  public async createMeeting(
    options: MeetingOptions
  ): Promise<{ event: Event; inviteCode?: string }> {
    const item = Office.context.mailbox.item;

    // 1. Prepare Payload
    const payload = (await this.getEventPayload(options)) as CreateEventPayload;

    // 2. Call API
    const event = await this.client.events.create(payload, { suppressEmailNotification: true });
    const meetingLink = buildMeetingLink(
      this.client.config.opentalkOutlookWebAppUrl,
      event.room.id
    );
    await this.updateLocationWithMeetingLink(meetingLink);

    // 3. Invite Guests
    const invitees = await this.getInvitees();
    await this.sendInvites(invitees, event.id);

    // 4. Create Guest Link
    const guestInvite = await this.client.rooms.createInvitation(event.room.id, {});

    // 5. Update Outlook Body
    const currentBody = await callbackAsPromise<string>((cb) =>
      item.body.getAsync(Office.CoercionType.Html, cb)
    );
    const cleanBody = removeOldMeetingBody(currentBody);
    const newBodyContent =
      cleanBody + this.createEventBody(event, payload.e2eEncryption, guestInvite?.inviteCode);

    await setAsyncAsPromise(item.body.setAsync, newBodyContent, {
      coercionType: Office.CoercionType.Html,
    });

    // 6. Save Metadata to Custom Properties
    const customProps = await callbackAsPromise<Office.CustomProperties>(
      item.loadCustomPropertiesAsync
    );
    customProps.set(OPENTALK_EVENT_ID, event.id);
    customProps.set(OPENTALK_OWNER_ID, event.createdBy?.id);
    if (guestInvite?.inviteCode) {
      customProps.set(OPENTALK_INVITE_CODE, guestInvite.inviteCode);
    }

    await new Promise<void>((resolve, reject) => {
      customProps.saveAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          console.error("CustomProps save failed", result.error);
          reject(result.error);
        } else {
          resolve();
        }
      });
    });

    return { event, inviteCode: guestInvite?.inviteCode };
  }

  public async updateMeeting(
    existingEventId: string,
    options: MeetingOptions,
    existingEventData: Event,
    inviteCode?: string
  ): Promise<Event> {
    const item = Office.context.mailbox.item;

    const payload = (await this.getEventPayload(
      options,
      existingEventData?.room?.id
    )) as UpdateEventPayload;
    const queryParams = { suppressEmailNotification: true } as UpdateEventQueryParams;

    const event = await this.client.events.update(existingEventId, payload, queryParams);
    const meetingLink = buildMeetingLink(
      this.client.config.opentalkOutlookWebAppUrl,
      event.room.id
    );
    const previousMeetingLink = existingEventData?.room?.id
      ? buildMeetingLink(this.client.config.opentalkOutlookWebAppUrl, existingEventData.room.id)
      : undefined;
    await this.updateLocationWithMeetingLink(meetingLink, previousMeetingLink);

    // Sync Invites
    const originalInvitees = existingEventData.invitees?.map((invite) => invite.profile) ?? [];
    const updatedInvitees = await this.getInvitees();
    const addedInvitees = differenceBy(updatedInvitees, originalInvitees, "email");
    const removedInvitees = differenceBy(originalInvitees, updatedInvitees, "email");

    for (const invitee of removedInvitees) {
      await this.client.events.deleteInvitation(
        existingEventId,
        { email: invitee.email },
        { suppressEmailNotification: true }
      );
    }

    await this.sendInvites(addedInvitees, event.id);

    // Refresh Body
    const currentBody = await callbackAsPromise<string>((cb) =>
      item.body.getAsync(Office.CoercionType.Html, cb)
    );
    const newMeetingMarkup = this.createEventBody(event, payload.e2eEncryption, inviteCode);
    const finalHtmlBody = getUpdatedMeetingBody(
      currentBody,
      newMeetingMarkup,
      existingEventData?.room?.id
    );
    await setAsyncAsPromise(item.body.setAsync, finalHtmlBody, {
      coercionType: Office.CoercionType.Html,
    });

    return event;
  }
}
