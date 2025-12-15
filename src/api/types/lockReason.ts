export enum LockReason {
  NotOwnerForbidden = "notOwnerForbidden",
  Invitee = "invitee",
  Deleted = "deleted",
}

export const lockMessageKey: Record<LockReason, string> = {
  [LockReason.NotOwnerForbidden]: "outlook-meeting-not-owner",
  [LockReason.Invitee]: "outlook-meeting-invitee-options",
  [LockReason.Deleted]: "outlook-meeting-no-longer-available",
};
