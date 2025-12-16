export enum TariffStatus {
  Default = "default",
  Paid = "paid",
  Downgraded = "downgraded",
}

export interface PrivateUserProfile {
  avatarUrl?: string;
  conferenceTheme?: string;
  dashboardTheme?: string;
  displayName: string;
  email: string;
  firstname: string;
  id: string;
  language: string;
  lastname: string;
  tariffStatus: TariffStatus;
  title: string;
  usedStorage: number;
}
