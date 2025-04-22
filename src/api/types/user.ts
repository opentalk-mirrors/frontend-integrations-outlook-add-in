enum UserKind {
  Registered = "registered",
  Unregistered = "unregistered",
}

export enum UserRole {
  User = "user",
  Moderator = "moderator",
}

/**
 * Public User information
 *
 * Part of other embedded responses that reference a user.
 * E.g. GET /events
 */
export type BaseUser = {
  id: string;
  displayName: string;
  email: string;
  title: string;
  firstname: string;
  lastname: string;
  avatarUrl?: string;
};

export type RegisteredUser = BaseUser & { kind: UserKind.Registered; role: UserRole };
export type UnregisteredUser = {
  email: string;
  title: string;
  firstname: string;
  lastname: string;
  avatarUrl?: string;
  kind: UserKind.Unregistered;
};

/**
 * Public User information
 *
 * Part of other embedded responses that reference a user.
 * GET /users/find?q=
 */
export type User = RegisteredUser | UnregisteredUser;

export type EmailUser = {
  email: string;
};

export type ParticipantOption = EmailUser | User;

export interface UsersFindQueryParams {
  q: string;
}
