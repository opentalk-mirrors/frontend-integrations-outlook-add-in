interface ControllerBody {
  baseUrl: string;
}

export interface ClientWellKnownResponseBody {
  opentalkController: ControllerBody;
}

interface Oidc {
  name: string;
  url: string;
}

export interface GetLoginResponseBody {
  oidc: Oidc;
}

export interface PostClientAuthentificationResponseBody {
  userCode: string;
  deviceCode: string;
  verificationUri: string;
  verificationUriComplete: string;
  expiresIn: number;
  interval: number;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export enum ErrorSeverity {
  Fatal = "fatal",
  Retry = "retry",
  Display = "display",
}

export interface ErrorContext {
  message: string;
  severity: ErrorSeverity;
}

const REQ_ERR = Symbol("REQ_ERR");
interface BaseRequestError {
  [REQ_ERR]: true;
  statusCode: number;
  statusText: string;
  inner?: unknown;
}

export interface ContextualizedRequestError extends BaseRequestError {
  context: ErrorContext;
}

export class RequestError implements BaseRequestError {
  [REQ_ERR]: true;
  statusCode: number;
  statusText: string;
  // Stores the response body of the error in case there is one
  inner?: unknown;

  constructor(statusCode: number, statusText: string, inner?: unknown) {
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.inner = inner;
  }

  public static async fromResponse(response: Response): Promise<RequestError> {
    const inner =
      response.headers.get("content-type") === "application/json" ? await response.json() : null;
    return new RequestError(response.status, response.statusText, inner);
  }

  public withContext(context: ErrorContext): ContextualizedRequestError {
    const error: ContextualizedRequestError = {
      [REQ_ERR]: true,
      statusCode: this.statusCode,
      statusText: this.statusText,
      inner: this.inner,
      context,
    };
    return error;
  }
}

export function isRequestError(x: unknown): x is RequestError {
  return x instanceof RequestError;
}

export function isErrorWithContext(x: unknown): x is ContextualizedRequestError {
  return typeof x === "object" && REQ_ERR in x && "context" in x;
}

export interface DeviceAccessTokenSuccess {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  scope: string;
}

export enum DeviceAccessTokenErrorType {
  AuthorizationPending = "authorization_pending",
  SlowDown = "slow_down",
  AccessDenied = "access_denied",
  ExpiredToken = "expired_token",
}

export interface DeviceAccessTokenError {
  error: DeviceAccessTokenErrorType;
  errorResponse: string;
}

export interface RequestParams {
  endpoint: string;
  queryParams?: unknown;
}

export interface RequestParamsWithPayload extends RequestParams {
  payload?: unknown;
}

export interface FetchRequestParams extends RequestParamsWithPayload {
  method: HttpMethod;
}
