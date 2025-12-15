import { FC, useCallback, useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
import { Stack, MenuItem, TextField, Typography, FormHelperText } from "@mui/material";
import { useTranslation } from "react-i18next";
import { isEqual } from "lodash";

import { TrainingParticipationReportParameterSet } from "../../api/types/events";
import { FormSwitch } from "../FormSwitch/FormSwitch";
import {
  TrainingParticipationErrors,
  validateTrainingParticipation,
} from "../../utils/validation/trainingParticipationValidation";

enum TrainingParticipationReportConfigOptions {
  EveryThirtyMin = "every-thirty-min",
  EverySixtyMin = "every-sixty-min",
  ThirtyToSixtyMin = "thirty-to-sixty-min",
  NinetyToOneHundredTwentyMin = "ninety-to-hundred-twenty-min",
  Custom = "custom",
}

const DEFAULT_CUSTOM_OPTION: TrainingParticipationReportParameterSet = {
  initialCheckpointDelay: { after: 600, within: 1200 },
  checkpointInterval: { after: 2700, within: 900 },
};

const PRESET_OPTIONS: Record<
  Exclude<
    TrainingParticipationReportConfigOptions,
    TrainingParticipationReportConfigOptions.Custom
  >,
  TrainingParticipationReportParameterSet
> = {
  [TrainingParticipationReportConfigOptions.EveryThirtyMin]: {
    initialCheckpointDelay: { after: 1800, within: 0 },
    checkpointInterval: { after: 1800, within: 0 },
  },
  [TrainingParticipationReportConfigOptions.EverySixtyMin]: {
    initialCheckpointDelay: { after: 3600, within: 0 },
    checkpointInterval: { after: 3600, within: 0 },
  },
  [TrainingParticipationReportConfigOptions.ThirtyToSixtyMin]: {
    initialCheckpointDelay: { after: 1800, within: 1800 },
    checkpointInterval: { after: 1800, within: 1800 },
  },
  [TrainingParticipationReportConfigOptions.NinetyToOneHundredTwentyMin]: {
    initialCheckpointDelay: { after: 5400, within: 1800 },
    checkpointInterval: { after: 5400, within: 1800 },
  },
};

const OPTION_KEYS: TrainingParticipationReportConfigOptions[] = [
  TrainingParticipationReportConfigOptions.EveryThirtyMin,
  TrainingParticipationReportConfigOptions.EverySixtyMin,
  TrainingParticipationReportConfigOptions.ThirtyToSixtyMin,
  TrainingParticipationReportConfigOptions.NinetyToOneHundredTwentyMin,
  TrainingParticipationReportConfigOptions.Custom,
];

const defaultPreset = PRESET_OPTIONS[TrainingParticipationReportConfigOptions.EveryThirtyMin];

const findPresetOption = (
  parameter?: TrainingParticipationReportParameterSet
):
  | Exclude<
      TrainingParticipationReportConfigOptions,
      TrainingParticipationReportConfigOptions.Custom
    >
  | undefined => {
  if (!parameter) {
    return undefined;
  }

  return (
    Object.entries(PRESET_OPTIONS) as Array<
      [
        Exclude<
          TrainingParticipationReportConfigOptions,
          TrainingParticipationReportConfigOptions.Custom
        >,
        TrainingParticipationReportParameterSet,
      ]
    >
  ).find(([, option]) => isEqual(parameter, option))?.[0];
};

const resolveCustomOption = (parameter?: TrainingParticipationReportParameterSet) => {
  const presetOption = findPresetOption(parameter);

  if (!parameter || presetOption) {
    return DEFAULT_CUSTOM_OPTION;
  }

  return parameter;
};

interface TrainingParticipationReportSelectProps {
  enabled?: boolean;
  parameter?: TrainingParticipationReportParameterSet;
  onChange?: (enabled: boolean, parameter?: TrainingParticipationReportParameterSet) => void;
}

export const TrainingParticipationReportSelect: FC<TrainingParticipationReportSelectProps> = ({
  enabled = false,
  parameter: initialParameter,
  onChange,
}) => {
  const { t } = useTranslation();
  const [participationReportEnabled, setParticipationReportEnabled] = useState(enabled);
  const [parameter, setParameter] = useState<TrainingParticipationReportParameterSet | undefined>(
    initialParameter ?? defaultPreset
  );
  const [customParameter, setCustomParameter] = useState<TrainingParticipationReportParameterSet>(
    resolveCustomOption(initialParameter)
  );
  const [customErrors, setCustomErrors] = useState<TrainingParticipationErrors>({});
  const previousChangeRef = useRef<
    { enabled: boolean; parameter?: TrainingParticipationReportParameterSet } | undefined
  >(undefined);

  useEffect(() => {
    setParticipationReportEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    if (!initialParameter) return;
    setParameter(initialParameter);

    if (!findPresetOption(initialParameter)) {
      setCustomParameter(initialParameter);
    }
  }, [initialParameter]);

  useEffect(() => {
    if (participationReportEnabled && !parameter) {
      setParameter(defaultPreset);
    }
  }, [participationReportEnabled, parameter]);

  // To save resources, we only call onChange when defined and the payloads values actually change
  useEffect(() => {
    if (!onChange) return;

    const nextParameter = participationReportEnabled ? (parameter ?? customParameter) : undefined;
    const nextChange = { enabled: participationReportEnabled, parameter: nextParameter };

    if (
      previousChangeRef.current?.enabled === nextChange.enabled &&
      isEqual(previousChangeRef.current?.parameter, nextChange.parameter)
    ) {
      return;
    }

    previousChangeRef.current = nextChange;
    onChange(nextChange.enabled, nextChange.parameter);
  }, [participationReportEnabled, parameter, customParameter, onChange]);
  const selectedOption = useMemo(() => {
    const presetOption = findPresetOption(parameter);

    return presetOption ?? TrainingParticipationReportConfigOptions.Custom;
  }, [parameter]);

  const handleSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const option = event.target.value as TrainingParticipationReportConfigOptions;

      if (option === TrainingParticipationReportConfigOptions.Custom) {
        setParameter(customParameter);
        return;
      }

      setParameter(PRESET_OPTIONS[option]);
    },
    [customParameter]
  );

  const handleCustomChange = useCallback(
    (range: "initialCheckpointDelay" | "checkpointInterval", field: "after" | "within") =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const minutes = Number(event.target.value);

        setCustomParameter((previousValue) => {
          const sanitizedMinutes = Number.isNaN(minutes) ? 0 : minutes;
          const currentAfter = previousValue[range].after;
          const currentWithin = previousValue[range].within;

          let nextAfter = currentAfter;
          let nextWithin = currentWithin;

          if (field === "after") {
            nextAfter = sanitizedMinutes * 60;
            const currentTotal = currentAfter + currentWithin;
            nextWithin = Math.max(0, currentTotal - nextAfter);
          } else {
            const totalSeconds = Math.max(0, sanitizedMinutes * 60);
            nextWithin = Math.max(totalSeconds - currentAfter);
          }

          const nextParameter = {
            ...previousValue,
            [range]: {
              after: nextAfter,
              within: nextWithin,
            },
          } as TrainingParticipationReportParameterSet;

          setParameter(nextParameter);
          return nextParameter;
        });
      },
    []
  );

  const showCustomFields =
    participationReportEnabled &&
    selectedOption === TrainingParticipationReportConfigOptions.Custom;

  const initialRangeError =
    customErrors["initialCheckpointDelay.after"] || customErrors["initialCheckpointDelay.within"];
  const intervalRangeError =
    customErrors["checkpointInterval.after"] || customErrors["checkpointInterval.within"];

  useEffect(() => {
    if (!showCustomFields) {
      setCustomErrors({});
      return;
    }

    const { errors } = validateTrainingParticipation(true, customParameter, t);
    setCustomErrors(errors);
  }, [showCustomFields, customParameter, t]);

  return (
    <>
      <FormSwitch
        label={t("dashboard-meeting-training-participation-report-switch", { ns: "dashboard" })}
        flag={participationReportEnabled}
        setFlag={setParticipationReportEnabled}
      />
      {participationReportEnabled && (
        <Stack spacing={2}>
          <TextField
            select
            // label={t("participation.report", { ns: "dashboard" })}
            value={selectedOption}
            onChange={handleSelect}
            size="small"
            fullWidth
          >
            {OPTION_KEYS.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`dashboard-meeting-training-participation-report-option-${option}`, {
                  ns: "dashboard",
                })}
              </MenuItem>
            ))}
          </TextField>

          {showCustomFields && (
            <>
              <Stack marginBottom={2}>
                <Typography mb={1}>
                  {t("dashboard-custom-training-participation-report-dialog-initial-timeout", {
                    ns: "dashboard",
                  })}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    type="number"
                    size="small"
                    value={customParameter.initialCheckpointDelay.after / 60}
                    onChange={handleCustomChange("initialCheckpointDelay", "after")}
                    inputProps={{ min: 0 }}
                    error={!!initialRangeError}
                  />
                  <Typography>
                    {t("dashboard-custom-training-participation-report-dialog-to", {
                      ns: "dashboard",
                    })}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={
                      (customParameter.initialCheckpointDelay.after +
                        customParameter.initialCheckpointDelay.within) /
                      60
                    }
                    onChange={handleCustomChange("initialCheckpointDelay", "within")}
                    inputProps={{ min: 0 }}
                    error={!!initialRangeError}
                  />
                  <Typography>
                    {t("dashboard-custom-training-participation-report-dialog-minutes", {
                      ns: "dashboard",
                    })}
                  </Typography>
                </Stack>
                {!!initialRangeError && (
                  <FormHelperText error sx={{ ml: 0 }}>
                    {initialRangeError}
                  </FormHelperText>
                )}
              </Stack>

              <Stack>
                <Typography mb={1}>
                  {t("dashboard-custom-training-participation-report-dialog-interval-duration", {
                    ns: "dashboard",
                  })}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    type="number"
                    size="small"
                    value={customParameter.checkpointInterval.after / 60}
                    onChange={handleCustomChange("checkpointInterval", "after")}
                    inputProps={{ min: 0 }}
                    error={!!intervalRangeError}
                  />
                  <Typography>
                    {t("dashboard-custom-training-participation-report-dialog-to", {
                      ns: "dashboard",
                    })}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={
                      (customParameter.checkpointInterval.after +
                        customParameter.checkpointInterval.within) /
                      60
                    }
                    onChange={handleCustomChange("checkpointInterval", "within")}
                    inputProps={{ min: 0 }}
                    error={!!intervalRangeError}
                  />
                  <Typography>
                    {t("dashboard-custom-training-participation-report-dialog-minutes", {
                      ns: "dashboard",
                    })}
                  </Typography>
                </Stack>
                {!!intervalRangeError && (
                  <FormHelperText error sx={{ ml: 0 }}>
                    {intervalRangeError}
                  </FormHelperText>
                )}
              </Stack>
            </>
          )}
        </Stack>
      )}
    </>
  );
};
