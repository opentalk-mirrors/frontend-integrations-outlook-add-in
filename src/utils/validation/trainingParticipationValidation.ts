import { TFunction } from "i18next";
import { flatten, number, object, pipe, safeParse } from "valibot";
import { TrainingParticipationReportParameterSet } from "../../api/types/events";

type TrainingParticipationFieldKey =
  | "initialCheckpointDelay.after"
  | "initialCheckpointDelay.within"
  | "checkpointInterval.after"
  | "checkpointInterval.within";

export type TrainingParticipationErrors = Partial<Record<TrainingParticipationFieldKey, string>>;

const timeRangeSchema = object({
  after: pipe(number()),
  within: pipe(number()),
});

const createTrainingParticipationSchema = () =>
  object({
    initialCheckpointDelay: timeRangeSchema,
    checkpointInterval: timeRangeSchema,
  });

export const validateTrainingParticipation = (
  enabled: boolean,
  parameter: TrainingParticipationReportParameterSet | undefined,
  t: TFunction
): { errors: TrainingParticipationErrors; isValid: boolean } => {
  if (!enabled || !parameter) {
    return { errors: {}, isValid: true };
  }

  const schema = createTrainingParticipationSchema();
  const result = safeParse(schema, parameter);
  const errors: TrainingParticipationErrors = {};

  if (!result.success) {
    const flat = flatten<typeof schema>(result.issues);

    if (flat.nested) {
      Object.entries(flat.nested).forEach(([path, messages]) => {
        const message = messages?.[0];
        if (path && message && !errors[path as TrainingParticipationFieldKey]) {
          errors[path as TrainingParticipationFieldKey] = message;
        }
      });
    }
  } else {
    const pairs: Array<{
      path: TrainingParticipationFieldKey;
      after: number;
      within: number;
    }> = [
      {
        path: "initialCheckpointDelay.within",
        after: result.output.initialCheckpointDelay.after,
        within: result.output.initialCheckpointDelay.within,
      },
      {
        path: "checkpointInterval.within",
        after: result.output.checkpointInterval.after,
        within: result.output.checkpointInterval.within,
      },
    ];

    pairs.forEach(({ path, after, within }) => {
      if (within < 0) {
        const message = t("dashboard-custom-training-participation-report-dialog-error", {
          ns: "errors",
          after: after / 60,
        });
        errors[path] = message;
        const beforePath = path.replace(".within", ".after") as TrainingParticipationFieldKey;
        errors[beforePath] = message;
      }
    });
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};
