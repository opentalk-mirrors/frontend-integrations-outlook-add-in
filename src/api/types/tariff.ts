export enum BackendModules {
  Automod = "automod",
  Breakout = "breakout",
  Chat = "chat",
  Core = "core",
  Echo = "echo",
  Integration = "integration",
  LegalVote = "legalVote",
  Media = "media",
  Moderation = "moderation",
  Polls = "polls",
  MeetingNotes = "meetingNotes",
  MeetingReport = "meetingReport",
  Recording = "recording",
  RecordingService = "recordingService",
  Timer = "timer",
  Whiteboard = "whiteboard",
  SharedFolder = "sharedFolder",
  SubroomAudio = "subroomAudio",
  TrainingParticipationReport = "trainingParticipationReport",
}

/**
 * Presence of a module (even with an empty features list) means it is enabled.
 */
export type Modules = { [value in BackendModules]?: { features: Array<string> } };

export interface Tariff {
  id: string;
  name: string;
  quotas: Record<string, number>;
  modules: Modules;
}
