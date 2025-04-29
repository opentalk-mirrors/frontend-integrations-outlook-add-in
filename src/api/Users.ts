import { Client } from "./Client";
import { Tariff } from "./types/tariff";
import { User, UsersFindQueryParams } from "./types/user";

export class UsersAPI {
  constructor(private client: Client) {}

  public getTariff() {
    return this.client.get<Tariff>({ endpoint: "users/me/tariff" });
  }

  public find(params: UsersFindQueryParams) {
    return this.client.get<Array<User>>({ endpoint: "users/find", queryParams: params });
  }
}
