import {
  FormControlLabel as MuiFormControlLabel,
  styled,
  Switch,
  SwitchProps,
} from "@mui/material";
import { FunctionComponent } from "react";

interface FormSwitchProps {
  label: string;
  flag: boolean;
  setFlag: (value: boolean | ((prevState: boolean) => boolean)) => void;
  switchProps?: SwitchProps;
}

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  margin: 0,
  gap: theme.spacing(1),
  verticalAlign: "baseline",
  width: "max-content",
}));

export const FormSwitch: FunctionComponent<FormSwitchProps> = ({
  label,
  flag,
  setFlag,
  switchProps,
}) => {
  return (
    <FormControlLabel
      label={label}
      control={
        <Switch
          {...switchProps}
          onChange={(event) => setFlag(event.target.checked)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              setFlag((value) => !value);
            }
          }}
          checked={flag}
        />
      }
    />
  );
};
