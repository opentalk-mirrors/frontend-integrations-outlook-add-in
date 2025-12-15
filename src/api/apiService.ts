import { Client } from "./Client";
import { AuthAPI } from "./Auth";
import { EventsAPI } from "./Events";
import { RoomsAPI } from "./Rooms";
import { UsersAPI } from "./Users";
import { StreamingTargetAPI } from "./StreamingTarget";
import { Config } from "./types/client";

export interface APIClient {
  auth: AuthAPI;
  events: EventsAPI;
  rooms: RoomsAPI;
  users: UsersAPI;
  streamingTargets: StreamingTargetAPI;
  config: Config;
}

/**
 * Loads the base client and initializes all API wrappers
 */
export async function initializeApiClient(): Promise<APIClient> {
  const baseClient = await Client.load();

  return {
    auth: new AuthAPI(baseClient),
    events: new EventsAPI(baseClient),
    rooms: new RoomsAPI(baseClient),
    users: new UsersAPI(baseClient),
    streamingTargets: new StreamingTargetAPI(baseClient),
    config: baseClient.config,
  };
}
