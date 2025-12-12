import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { StreamingTargetAPI } from "../api/StreamingTarget";
import { StreamingTargetPayload } from "../api/types/streamingTarget";
import { LivestreamErrors, validateLivestream } from "../utils/validation/livestreamValidation";

export type StreamingTargetFormState = StreamingTargetPayload & { id?: string };

const DEFAULT_STREAMING_TARGET: StreamingTargetFormState = {
  id: undefined,
  kind: "custom",
  name: "",
  publicUrl: "",
  streamingEndpoint: "",
  streamingKey: "",
};

type StreamingClient = { streamingTargets?: StreamingTargetAPI } | null;

export const useStreamingTarget = () => {
  const { t } = useTranslation();
  const [livestreamEnabled, setLivestreamEnabled] = useState(false);
  const [streamingTarget, setStreamingTarget] = useState<StreamingTargetFormState | null>(
    DEFAULT_STREAMING_TARGET
  );
  const [streamingErrors, setStreamingErrors] = useState<LivestreamErrors>({});

  const toggleLivestream = useCallback((flag: boolean) => {
    setLivestreamEnabled(flag);
    if (!flag) {
      setStreamingErrors({});
    }
  }, []);

  const buildStreamingPayload = useCallback(
    (
      enabled: boolean = livestreamEnabled,
      target: StreamingTargetFormState | null = streamingTarget
    ): StreamingTargetPayload | undefined => {
      if (!enabled || !target) {
        return undefined;
      }

      return {
        kind: target.kind || "custom",
        name: target.name.trim(),
        publicUrl: target.publicUrl.trim(),
        streamingEndpoint: target.streamingEndpoint.trim(),
        streamingKey: target.streamingKey.trim(),
      };
    },
    [livestreamEnabled, streamingTarget]
  );

  const validateStreaming = useCallback(
    (
      enabled: boolean = livestreamEnabled,
      target: StreamingTargetFormState | null = streamingTarget
    ) => {
      const { errors, isValid } = validateLivestream(enabled, target, t);
      setStreamingErrors(errors);
      return { errors, isValid };
    },
    [livestreamEnabled, streamingTarget, t]
  );

  const syncStreamingTarget = useCallback(
    async (roomId: string, client: StreamingClient) => {
      if (!client?.streamingTargets) {
        return;
      }

      if (!livestreamEnabled) {
        if (streamingTarget?.id) {
          await client.streamingTargets.deleteStreamingTarget(roomId, streamingTarget.id, {
            suppressEmailNotification: true,
          });
          setStreamingTarget((prev) => (prev ? { ...prev, id: undefined } : prev));
        }
        return;
      }

      const payload = buildStreamingPayload(true, streamingTarget);
      if (!payload) {
        return;
      }

      if (streamingTarget?.id) {
        const updatedTarget = await client.streamingTargets.patchStreamingTargetById(
          roomId,
          streamingTarget.id,
          payload
        );
        setStreamingTarget((prev) => ({ ...prev, id: updatedTarget?.id ?? prev?.id }));
      } else {
        const createdTarget = await client.streamingTargets.createStreamingTarget(roomId, payload, {
          suppressEmailNotification: true,
        });
        setStreamingTarget((prev) => ({ ...prev, id: createdTarget?.id }));
      }
    },
    [buildStreamingPayload, livestreamEnabled, streamingTarget]
  );

  return {
    livestreamEnabled,
    streamingTarget,
    streamingErrors,
    setStreamingTarget,
    toggleLivestream,
    validateStreaming,
    buildStreamingPayload,
    syncStreamingTarget,
  };
};
