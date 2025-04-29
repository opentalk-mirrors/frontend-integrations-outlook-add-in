import { UserRole } from "./user";

export interface DateTime {
  datetime: string;
  timezone: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
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
}

type CreateEventInviteEmailPayload = {
  email: string;
};

type CreateEventInviteUserPayload = {
  invitee: string;
  role: UserRole;
};

export type CreateEventInvitePayload = CreateEventInviteUserPayload | CreateEventInviteEmailPayload;

/**
 * EventRoomInfo in an Event object
 */
type EventRoomInfo = {
  id: string;
  password?: string;
  waitingRoom: boolean;
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
  showMeetingDetails?: boolean;
  isTimeIndependent?: boolean;
  type: EventType;
  isFavorite: boolean;
  recurrenceId?: string;
  isAdhoc?: boolean;
}

/**
 * Objects implementing this interface have time information present
 */
export interface TimedEvent extends BaseEvent {
  isAllDay: boolean;
  startsAt: DateTime;
  endsAt: DateTime;
}

/**
 * A timeless event
 * An event that has no time associated with it.
 */
export interface TimelessEvent extends BaseEvent {
  type: EventType.Single;
  isTimeIndependent: true;
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

interface SuppressEmailNotification {
  suppressEmailNotification: boolean;
}

export type CreateEventQueryParams = SuppressEmailNotification;

export interface DeleteEventQueryParams extends SuppressEmailNotification {
  forceDeleteReferenceIfExternalServicesFail: boolean;
}
