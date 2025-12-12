import { Dispatch, FC, SetStateAction } from "react";
import { MenuItem, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import { LivestreamErrors } from "../utils/validation/livestreamValidation";
import { FormSwitch } from "./FormSwitch/FormSwitch";
import { StreamingTargetFormState } from "../hooks/useStreamingTarget";

type StreamingTargetFieldsProps = {
  livestreamEnabled: boolean;
  onToggleLivestream: (flag: boolean) => void;
  streamingTarget: StreamingTargetFormState | null;
  streamingErrors: LivestreamErrors;
  setStreamingTarget: Dispatch<SetStateAction<StreamingTargetFormState | null>>;
};

export const StreamingTargetFields: FC<StreamingTargetFieldsProps> = ({
  livestreamEnabled,
  onToggleLivestream,
  streamingTarget,
  streamingErrors,
  setStreamingTarget,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FormSwitch
        label={t("livestream-switch", { ns: "dashboard" })}
        flag={livestreamEnabled}
        setFlag={(flag) => {
          onToggleLivestream(flag);
        }}
      />
      {livestreamEnabled && streamingTarget && (
        <Stack spacing={1} sx={{ mt: 1 }}>
          <TextField
            select
            label={t("livestream-platform", { ns: "dashboard" })}
            value={streamingTarget.kind}
            onChange={(event) => {
              setStreamingTarget((prev) => ({
                ...prev,
                kind: event.target.value,
              }));
            }}
            size="small"
            fullWidth
          >
            <MenuItem value="custom">
              {t("livestream-platform-custom", { ns: "dashboard" })}
            </MenuItem>
          </TextField>
          <TextField
            label={t("livestream-name", { ns: "dashboard" })}
            value={streamingTarget.name}
            onChange={(event) =>
              setStreamingTarget((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            error={!!streamingErrors.name}
            helperText={streamingErrors.name}
            size="small"
            fullWidth
          />
          <TextField
            label={t("livestream-public-url", { ns: "dashboard" })}
            value={streamingTarget.publicUrl}
            onChange={(event) =>
              setStreamingTarget((prev) => ({
                ...prev,
                publicUrl: event.target.value,
              }))
            }
            error={!!streamingErrors.publicUrl}
            helperText={streamingErrors.publicUrl}
            size="small"
            fullWidth
          />
          <TextField
            label={t("livestream-endpoint", { ns: "dashboard" })}
            value={streamingTarget.streamingEndpoint}
            onChange={(event) =>
              setStreamingTarget((prev) => ({
                ...prev,
                streamingEndpoint: event.target.value,
              }))
            }
            error={!!streamingErrors.streamingEndpoint}
            helperText={streamingErrors.streamingEndpoint}
            size="small"
            fullWidth
          />
          <TextField
            label={t("livestream-key", { ns: "dashboard" })}
            value={streamingTarget.streamingKey}
            onChange={(event) =>
              setStreamingTarget((prev) => ({
                ...prev,
                streamingKey: event.target.value,
              }))
            }
            error={!!streamingErrors.streamingKey}
            helperText={streamingErrors.streamingKey}
            size="small"
            fullWidth
          />
        </Stack>
      )}
    </>
  );
};
