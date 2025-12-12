export interface StreamingTarget {
  id: string;
  kind: string;
  name: string;
  publicUrl: string;
  streamingEndpoint: string;
  streamingKey: string;
}

export interface StreamingTargetPayload {
  kind: string;
  name: string;
  publicUrl: string;
  streamingEndpoint: string;
  streamingKey: string;
}
