import { Client } from "./Client";

export class AuthAPI {
  constructor(private client: Client) {}

  public isAuthenticated() {
    return this.client.isAuthenticated();
  }
}
