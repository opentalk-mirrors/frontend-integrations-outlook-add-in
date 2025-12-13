import { Client } from "./Client";
import { Tariff } from "./types/tariff";
import { User, UsersFindQueryParams } from "./types/user";
import { PrivateUserProfile } from "./types/privateUserProfile";

export class UsersAPI {
  constructor(private client: Client) {}

  public getTariff() {
    return this.client.get<Tariff>({ endpoint: "users/me/tariff" });
  }

  public find(params: UsersFindQueryParams) {
    return this.client.get<Array<User>>({ endpoint: "users/find", queryParams: params });
  }

  public me() {
    return this.client.get<PrivateUserProfile>({ endpoint: "users/me" });
  }
}
