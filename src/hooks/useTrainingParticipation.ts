import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { TrainingParticipationReportParameterSet } from "../api/types/events";
import {
  validateTrainingParticipation,
  TrainingParticipationErrors,
} from "../utils/validation/trainingParticipationValidation";

const DEFAULT_PARAMS: TrainingParticipationReportParameterSet = {
  initialCheckpointDelay: { after: 600, within: 1200 },
  checkpointInterval: { after: 2700, within: 900 },
};

export const useTrainingParticipation = (
  initial?: TrainingParticipationReportParameterSet | null
) => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<boolean>(!!initial);
  const [params, setParams] = useState<TrainingParticipationReportParameterSet | undefined>(
    initial ?? DEFAULT_PARAMS
  );
  const [errors, setErrors] = useState<TrainingParticipationErrors>({});

  const toggle = useCallback((flag: boolean) => {
    setEnabled(flag);
    if (!flag) {
      setErrors({});
    }
  }, []);

  const validate = useCallback(
    (
      flag: boolean = enabled,
      currentParams: TrainingParticipationReportParameterSet | undefined = params
    ) => {
      const result = validateTrainingParticipation(flag, currentParams, t);
      setErrors(result.errors);
      return result;
    },
    [enabled, params, t]
  );

  const updateParams = useCallback((next: TrainingParticipationReportParameterSet) => {
    setParams(next);
  }, []);

  return {
    enabled,
    params,
    errors,
    toggle,
    setParams: updateParams,
    validate,
  };
};
