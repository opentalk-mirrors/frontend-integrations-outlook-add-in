import { StreamingTarget, StreamingTargetPayload } from "./streamingTarget";
import { BaseUser, User, UserRole } from "./user";

export interface DateTime {
  datetime: string;
  timezone: string;
}

interface SharedFolderCredentials {
  url: string;
  password: string;
}

export interface SharedFolderData {
  read: SharedFolderCredentials;
  readWrite?: SharedFolderCredentials;
}

export enum InviteStatus {
  Accepted = "accepted",
  Tentative = "tentative",
  Pending = "pending",
  Declined = "declined",
  Added = "added",
}

export interface EventInvite {
  profile: User;
  status: InviteStatus;
}

export interface EventInvitesResponse {
  id: string;
  invitees?: Array<EventInvite>;
  inviteesTruncated?: boolean;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  e2eEncryption: boolean;
  startsAt: DateTime;
  endsAt: DateTime;
  isAdhoc?: boolean;
  isAllDay?: boolean;
  isTimeIndependent: boolean;
  password?: string;
  recurrencePattern?: string[];
  showMeetingDetails?: boolean;
  waitingRoom?: boolean;
  hasSharedFolder?: boolean;
  streamingTargets?: StreamingTargetPayload[];
  trainingParticipationReport?: TrainingParticipationReportParameterSet | null;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

type EventInviteEmailPayload = {
  email: string;
};

type CreateEventInviteUserPayload = {
  invitee: string;
  role: UserRole;
};

export type CreateEventInvitePayload = CreateEventInviteUserPayload | EventInviteEmailPayload;

export type DeleteEventInvitePayload = EventInviteEmailPayload;

export type UpdateEventInvitePayload = {
  role: UserRole;
};
/**
 * EventRoomInfo in an Event object
 */
type EventRoomInfo = {
  id: string;
  password?: string;
  waitingRoom: boolean;
  e2eEncryption: boolean;
  callIn?: CallInInfo;
};

export type CallInInfo = {
  id: string;
  password: string;
  tel: string;
};

/**
 * The type of an event. This might actually have to be 2 types.
 * See issue #1784
 */
export enum EventType {
  Single = "single",
  Recurring = "recurring",
  Instance = "instance",
  Exception = "exception",
}

interface BaseEvent {
  id: string;
  title: string;
  description: string;
  room: EventRoomInfo;
  inviteesTruncated?: boolean;
  invitees?: Array<EventInvite>;
  showMeetingDetails: boolean;
  trainingParticipationReport?: TrainingParticipationReportParameterSet;
  isTimeIndependent?: boolean;
  sharedFolder?: SharedFolderData;
  streamingTargets?: StreamingTarget[];
  type: EventType;
  isFavorite: boolean;
  recurrenceId?: string;
  isAdhoc?: boolean;
  createdBy?: BaseUser;
  canEdit?: boolean;
}

/**
 * Objects implementing this interface have time information present
 */
export interface TimedEvent extends BaseEvent {
  isAllDay: boolean;
  startsAt: DateTime;
  endsAt: DateTime;
}

export function isTimedEvent(event: BaseEvent): event is TimedEvent {
  return "startsAt" in event && "endsAt" in event && "isAllDay" in event;
}

/**
 * A timeless event
 * An event that has no time associated with it.
 */
export interface TimelessEvent extends BaseEvent {
  type: EventType.Single;
  isTimeIndependent: true;
}

export interface TimeRange {
  /**
   * The earliest number of seconds after which the checkpoint can be created. Must be 0 or greater.
   */
  after: number;
  /**
   * The number of seconds within which the checkpoint can be created after the after value. Must be 0 or greater.
   */
  within: number;
}

export interface TrainingParticipationReportParameterSet {
  /**
   * default: { "after": 600, "within": 1200 }
   */
  initialCheckpointDelay: TimeRange;
  /**
   * default: { "after": 6300, "within": 1800 }
   */
  checkpointInterval: TimeRange;
}

/**
 * A recurring event
 * An event with a time it takes place as well as a recurrencePattern
 * Based on this you can compute an EventInstance using the rrule contained in the recurrencePattern.
 */
export interface RecurringEvent extends BaseEvent, TimedEvent {
  type: EventType.Recurring;
  isTimeIndependent: false;
}

/**
 * A single event
 * An event with a time it takes place.
 */
export interface SingleEvent extends BaseEvent, TimedEvent {
  type: EventType.Single;
  isTimeIndependent: false;
}

export type Event = SingleEvent | RecurringEvent | TimelessEvent | TimedEvent;

interface SuppressEmailNotificationQueryParam {
  suppressEmailNotification: boolean;
}

interface InviteesMaxQueryParam {
  inviteesMax?: number;
}

export type CreateEventQueryParams = SuppressEmailNotificationQueryParam;

export type GetEventQueryParams = InviteesMaxQueryParam;

export type UpdateEventQueryParams = SuppressEmailNotificationQueryParam & InviteesMaxQueryParam;

export interface DeleteEventQueryParams extends SuppressEmailNotificationQueryParam {
  forceDeleteReferenceIfExternalServicesFail: boolean;
}

export type CreateEventInviteQueryParams = SuppressEmailNotificationQueryParam;

export type DeleteEventInviteQueryParams = SuppressEmailNotificationQueryParam;
