import { Client } from "./Client";
import { CreateEventQueryParams } from "./types/events";
import { StreamingTarget, StreamingTargetPayload } from "./types/streamingTarget";

export class StreamingTargetAPI {
  constructor(private client: Client) {}

  public createStreamingTarget(
    roomId: string,
    payload: StreamingTargetPayload,
    queryParams?: CreateEventQueryParams
  ) {
    return this.client.post<StreamingTarget>({
      endpoint: `rooms/${roomId}/streaming_targets`,
      payload,
      queryParams,
    });
  }

  public patchStreamingTargetById(
    roomId: string,
    streamingTargetId: string,
    payload: StreamingTargetPayload
  ) {
    return this.client.patch<StreamingTarget>({
      endpoint: `rooms/${roomId}/streaming_targets/${streamingTargetId}`,
      payload,
    });
  }

  public deleteStreamingTarget(
    roomId: string,
    streamingTargetId: string,
    queryParams?: CreateEventQueryParams
  ) {
    return this.client.delete({
      endpoint: `rooms/${roomId}/streaming_targets/${streamingTargetId}`,
      queryParams,
    });
  }
}
