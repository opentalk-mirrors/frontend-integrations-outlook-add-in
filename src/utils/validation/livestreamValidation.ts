import { TFunction } from "i18next";
import { minLength, object, pipe, safeParse, string, trim, url, flatten } from "valibot";
import { StreamingTargetPayload } from "../../api/types/streamingTarget";

export type LivestreamErrors = Record<string, string>;

type StreamingTargetFields = Pick<
  StreamingTargetPayload,
  "name" | "publicUrl" | "streamingEndpoint" | "streamingKey"
>;

// Define schema for validation
const createLivestreamSchema = (t: TFunction) =>
  object({
    name: pipe(string(), trim(), minLength(1, t("livestream-required", { ns: "dashboard" }))),
    publicUrl: pipe(
      string(),
      trim(),
      minLength(1, t("livestream-required", { ns: "dashboard" })),
      url(t("livestream-invalid-url", { ns: "dashboard" }))
    ),
    streamingEndpoint: pipe(
      string(),
      trim(),
      minLength(1, t("livestream-required", { ns: "dashboard" })),
      url(t("livestream-invalid-url", { ns: "dashboard" }))
    ),
    streamingKey: pipe(
      string(),
      trim(),
      minLength(1, t("livestream-required", { ns: "dashboard" }))
    ),
  });

export const validateLivestream = (
  livestreamEnabled: boolean,
  streamingTarget: StreamingTargetFields,
  t: TFunction
): { errors: LivestreamErrors; isValid: boolean } => {
  if (!livestreamEnabled) {
    return { errors: {}, isValid: true };
  }

  const schema = createLivestreamSchema(t);
  const result = safeParse(schema, streamingTarget);
  if (result.success) {
    return { errors: {}, isValid: true };
  }

  // flatten groups validation issues by field path
  const flat = flatten<typeof schema>(result.issues);

  const errors: LivestreamErrors = {};

  if (flat.nested) {
    Object.entries(flat.nested).forEach(([path, messages]) => {
      const field = path.split(".")[0];
      const message = messages?.[0];
      if (field && message && !errors[field]) {
        errors[field] = message;
      }
    });
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};
