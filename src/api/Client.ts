import { REDIRECT_QUERY } from "../constants";
import {
  ClientWellKnownResponseBody,
  GetLoginResponseBody,
  HttpMethod,
  PostClientAuthentificationResponseBody,
  DeviceAccessTokenSuccess,
  DeviceAccessTokenErrorType,
  DeviceAccessTokenError,
  RequestError,
  isRequestError,
  ErrorSeverity,
  ContextualizedRequestError,
  isErrorWithContext,
  FetchRequestParams,
  RequestParams,
  RequestParamsWithPayload,
  Config,
} from "./types/client";
import convertToSnakeCase from "snakecase-keys";
import convertToCamelCase from "camelcase-keys";
import { callbackAsPromise } from "../utils/OfficeHelpers";

// This is a global variable defined in webpack.config.mjs.
// It is declared here to satisfy the TypeScript compiler.
declare const PRODUCTION: boolean;

const OT_CLIENT = "ot-client";

export class Client {
  private otHost: string;
  private oidcDeviceAuthorizationEndpoint: string;
  private oidcTokenEndpoint: string;
  private otControllerHost: string;
  private otOidcHost: string;
  private accessToken: string;
  private accessTokenExpires: number;
  private refreshToken: string;
  private refreshTokenExpires: number;
  private config: Config;

  private constructor(otHost: string, config: Config) {
    // Prevents trailing slashes at the end of the host URL since the configuration does not allow them
    this.otHost = otHost.replace(/\/$/, "");
    this.config = config;
  }

  private static fromJSON(json: string, config: Config): Client {
    const obj: Client = JSON.parse(json);
    const client = new Client(obj.otHost, config);
    client.oidcDeviceAuthorizationEndpoint = obj.oidcDeviceAuthorizationEndpoint;
    client.oidcTokenEndpoint = obj.oidcTokenEndpoint;
    client.otControllerHost = obj.otControllerHost;
    client.accessToken = obj.accessToken;
    client.accessTokenExpires = obj.accessTokenExpires;
    client.refreshToken = obj.refreshToken;
    client.refreshTokenExpires = obj.refreshTokenExpires;
    return client;
  }

  private static async loadConfig(): Promise<Config> {
    if (!PRODUCTION) {
      return {
        opentalkOutlookHostUrl: process.env.OPENTALK_OUTLOOK_HOST_URL,
        opentalkOutlookOidcClientId: process.env.OPENTALK_OUTLOOK_OIDC_CLIENT_ID,
      };
    }
    const response = await Client.typedRequest<Config>(
      `https://${location.host}`,
      "/config.json",
      "GET"
    );
    if (isRequestError(response)) {
      const message = "Failed to fetch config";
      console.error(message, response);
      throw response.withContext({
        message: message,
        severity: ErrorSeverity.Fatal,
      });
    }
    return response;
  }

  // Load from localStorage or authenticate fresh
  public static async load(): Promise<Client> {
    const config = await this.loadConfig();
    const clientValueStr = localStorage.getItem(OT_CLIENT);

    if (clientValueStr) {
      const client = Client.fromJSON(clientValueStr, config);
      // Return the client when the refresh token is not expired,
      // otherwise reauthenticate
      if (client.isAuthenticated()) {
        return client;
      }
    }

    const authenticateResponse = await this.authenticate(config);
    if (isErrorWithContext(authenticateResponse)) {
      throw authenticateResponse;
    }
    return authenticateResponse;
  }

  // API access methods
  public async get<T>({ endpoint, queryParams }: RequestParams): Promise<T> {
    return this.fetchWithAuth<T>({ endpoint, method: "GET", queryParams });
  }

  public async post<T>(props: RequestParamsWithPayload): Promise<T> {
    return this.fetchWithAuth<T>({ method: "POST", ...props });
  }

  public async patch<T>(props: RequestParamsWithPayload): Promise<T> {
    return this.fetchWithAuth<T>({ method: "PATCH", ...props });
  }

  public async delete<T>(props: RequestParamsWithPayload): Promise<T> {
    return this.fetchWithAuth<T>({ method: "DELETE", ...props });
  }

  public static clearSession(): void {
    localStorage.removeItem(OT_CLIENT);
  }

  // Internal OIDC flow
  public static async authenticate(config: Config): Promise<Client | ContextualizedRequestError> {
    const client = new Client(config.opentalkOutlookHostUrl, config);

    const wellKnownResponse = await this.typedRequest<ClientWellKnownResponseBody>(
      client.otHost,
      "/.well-known/opentalk/client",
      "GET"
    );
    if (isRequestError(wellKnownResponse)) {
      return wellKnownResponse.withContext({
        message: `Failed to fetch well-known OIDC config from '${client.otHost}'. Is the host configured correctly?`,
        severity: ErrorSeverity.Fatal,
      });
    }
    client.otControllerHost = wellKnownResponse.opentalkController.baseUrl;

    const getLoginResponse = await this.typedRequest<GetLoginResponseBody>(
      client.otControllerHost,
      "/v1/auth/login",
      "GET"
    );
    if (isRequestError(getLoginResponse)) {
      return getLoginResponse.withContext({
        message: "Failed to fetch login endpoint",
        severity: ErrorSeverity.Fatal,
      });
    }

    client.otOidcHost = getLoginResponse.oidc.url;

    const oidcConfiguration = await fetch(
      `${client.otOidcHost}/.well-known/openid-configuration`
    ).then((resp) => resp.json());

    client.oidcDeviceAuthorizationEndpoint = oidcConfiguration["device_authorization_endpoint"];
    client.oidcTokenEndpoint = oidcConfiguration["token_endpoint"];

    const authResponse = await this.typedRequest<PostClientAuthentificationResponseBody>(
      client.oidcDeviceAuthorizationEndpoint,
      "",
      "POST",
      // Not sending audience as we do not use external providers, but can be possible in the future
      new URLSearchParams({
        client_id: config.opentalkOutlookOidcClientId,
        scope: "profile email openid",
      })
    );
    if (isRequestError(authResponse)) {
      return authResponse.withContext({
        message: "Failed to post auth request",
        severity: ErrorSeverity.Fatal,
      });
    }

    const options: Office.DialogOptions = {
      promptBeforeOpen: false,
      // The iFrame provided by Office.js is limited and not able to display
      // the confirmation page.
      displayInIframe: false,
    };
    // Office.js enforces the target domain of the dialog to be the same as the
    // host page, so we can not open the login page directly. Instead we open
    // a page on the same host that redirects to the actual login page (which
    // is encouraged by Microsoft). We pass the URI of the login page as a
    // query parameter.
    const searchParams = new URLSearchParams({
      [REDIRECT_QUERY]: encodeURI(authResponse.verificationUriComplete),
    });
    const uri = `https://${window.location.host}/login.html?${searchParams.toString()}`;
    let dialog = await callbackAsPromise(
      (callback: (result: Office.AsyncResult<Office.Dialog>) => void) =>
        Office.context.ui.displayDialogAsync(uri, options, callback)
    );
    // Office.js does not provide a way to determine wether or not a dialog has
    // already been closed (e.g. by user interaction) but throws an error when
    // trying to close one that has. To work around this, we subscribe to the
    // event that is invoked when the dialog is closed and set it to null.
    dialog.addEventHandler(Office.EventType.DialogEventReceived, (_) => (dialog = null));

    const pollTokens = async (interval: number) => {
      const tokenResponse = await this.typedRequest<DeviceAccessTokenSuccess>(
        client.oidcTokenEndpoint,
        "",
        "POST",
        new URLSearchParams({
          device_code: authResponse.deviceCode,
          client_id: config.opentalkOutlookOidcClientId,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        })
      );

      if (!isRequestError(tokenResponse)) {
        client.accessToken = tokenResponse.accessToken;
        client.refreshToken = tokenResponse.refreshToken;
        const now = Date.now() / 1000;
        client.accessTokenExpires = Math.floor(now + Number(tokenResponse.expiresIn));
        client.refreshTokenExpires = Math.floor(now + Number(tokenResponse.refreshExpiresIn));
        localStorage.setItem(OT_CLIENT, JSON.stringify(client));
        dialog?.close();

        return client;
      }

      if (isDeviceAccessTokenError(tokenResponse.inner)) {
        switch (tokenResponse.inner.error) {
          case DeviceAccessTokenErrorType.AuthorizationPending:
            await sleep(interval);
            return await pollTokens(interval);
          case DeviceAccessTokenErrorType.SlowDown: {
            interval += 5000;
            await sleep(interval);
            return await pollTokens(interval);
          }
          case DeviceAccessTokenErrorType.AccessDenied:
          case DeviceAccessTokenErrorType.ExpiredToken:
            return new RequestError(
              tokenResponse.statusCode,
              tokenResponse.statusText,
              tokenResponse.inner
            ).withContext({
              message: `Device authorization failed: ${tokenResponse.inner.errorResponse}`,
              severity: ErrorSeverity.Fatal,
            });
          default:
            break;
        }
      }

      return new RequestError(
        tokenResponse.statusCode,
        tokenResponse.statusText,
        tokenResponse.inner
      ).withContext({
        message: `Unknown token response error:\n${tokenResponse.inner}`,
        severity: ErrorSeverity.Fatal,
      });
    };

    return await pollTokens(authResponse.interval);
  }

  // Shared request helper
  private static async typedRequest<T>(
    host: string,
    endPoint: string,
    method: HttpMethod,
    payload: BodyInit = undefined,
    headers: HeadersInit = undefined
  ): Promise<T | null | RequestError> {
    const resp = await fetch(`${host}${endPoint}`, {
      method,
      body: payload,
      headers,
    });

    if (resp.status === 401) {
      this.clearSession();
    }

    if (!resp.ok) return await RequestError.fromResponse(resp);

    const jsonResponse = await safeJson(resp);
    if (!jsonResponse) {
      return null;
    }

    const convertedResponse = convertToCamelCase(jsonResponse, { deep: true });

    return convertedResponse;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessTokenExpires - 30 > Date.now() / 1000) {
      return this.accessToken;
    }

    const response = await Client.typedRequest<DeviceAccessTokenSuccess>(
      this.oidcTokenEndpoint,
      "",
      "POST",
      new URLSearchParams({
        refresh_token: this.refreshToken,
        client_id: this.config.opentalkOutlookOidcClientId,
        grant_type: "refresh_token",
      })
    );
    if (isRequestError(response)) {
      console.error("Failed to fetch access token", response);
      throw Error("Failed to fetch access token");
    }

    this.accessToken = response.accessToken;
    const now = Date.now() / 1000;
    this.accessTokenExpires = Math.floor(now + response.expiresIn);
    this.refreshToken = response.refreshToken;
    this.refreshTokenExpires = Math.floor(now + response.refreshExpiresIn);

    if (this.accessToken) {
      localStorage.setItem(OT_CLIENT, JSON.stringify(this));
    } else {
      Client.clearSession();
    }

    return this.accessToken;
  }

  public isAuthenticated(): boolean {
    return !!this.refreshToken && this.refreshTokenExpires * 1000 > Date.now();
  }

  private async fetchWithAuth<T>({
    endpoint,
    method,
    payload,
    queryParams,
  }: FetchRequestParams): Promise<T> {
    const token = await this.getAccessToken();
    const headers = createHeaders({ "Content-Type": "application/json" });

    headers.set("Accept", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const verifiedPayload = convertToValidPayload(payload);
    const params = convertToQueryParams(queryParams);

    const response = await Client.typedRequest(
      this.otControllerHost,
      `/v1/${endpoint}${params}`,
      method,
      verifiedPayload ? JSON.stringify(verifiedPayload) : undefined,
      headers
    );
    return response as T;
  }
}

const createHeaders = (headers?: HeadersInit) => {
  if (headers) {
    return !(headers instanceof Headers) ? new Headers(headers) : headers;
  } else {
    return new Headers();
  }
};

const convertToValidPayload = (payload: unknown) => {
  if (!payload) {
    return undefined;
  }

  // Check if payload is an object, which can be safely passed to convertToSnakeCase
  if (typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Payload invalid");
  }

  const cased = convertToSnakeCase(payload as Record<string, unknown>);
  return cased;
};

const convertToQueryParams = (params: unknown) => {
  if (!params) {
    return "";
  }

  // Check if params is an object, which can be safely passed to convertToSnakeCase
  if (typeof params !== "object" || Array.isArray(params)) {
    throw new Error("Query params invalid");
  }

  const cased = convertToSnakeCase(params as Record<string, string>);
  return "?" + new URLSearchParams(cased).toString();
};

const isDeviceAccessTokenError = (response: unknown): response is DeviceAccessTokenError => {
  return (
    typeof response === "object" &&
    "error" in response &&
    typeof response.error === "string" &&
    Object.values(DeviceAccessTokenErrorType).includes(response.error as DeviceAccessTokenErrorType)
  );
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function safeJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
