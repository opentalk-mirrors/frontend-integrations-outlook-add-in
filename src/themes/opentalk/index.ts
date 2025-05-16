import { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/material/styles";

import { getPalette } from "./palette";

export function createOpenTalkTheme(mode: PaletteMode = "light") {
  const palette = getPalette(mode);
  const theme = createTheme({
    zIndex: {
      jumpLink: 1501,
    },
    borderRadius: {
      small: 2,
      medium: 8,
      large: 40,
      circle: "50%",
      card: 16,
    },
    palette: {
      ...palette,
      mode,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            height: "100%",
            margin: 0,
            padding: 0,
          },
          body: {
            height: "100%",
            margin: 0,
            padding: 0,
            backgroundSize: "cover",
          },
          "#root": {
            height: "100%",
            display: "flex",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          color: "primary",
          variant: "contained",
          disableElevation: true,
        },

        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.borderRadius.large,
            textTransform: "none",
            ":disabled": {
              opacity: 0.5,
            },
            "&.Mui-focusVisible": {
              outline: theme.palette.focus.outline,
              outlineOffset: theme.palette.focus.outlineOffset,
            },
            variants: [
              {
                props: { variant: "conference-inactive", disabled: true },
                style: {
                  "&.Mui-disabled": {
                    color: "#c8c8c8", // TODO: As this color was only declared for the dark theme, we don't have a counterpart for the light theme so we have to hard code it here for now.
                    border: "2px solid currentColor",
                    opacity: 1,
                  },
                },
              },
            ],
          }),
          sizeSmall: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(12),
            padding: theme.spacing(1, 2.5),
          }),
          sizeMedium: ({ theme }) => ({
            padding: theme.spacing(1.25, 2.25),
            "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)": {
              fontSize: theme.typography.pxToRem(14),
            },
            [theme.breakpoints.down("md")]: {
              padding: theme.spacing(1, 1.75),
              fontSize: theme.typography.pxToRem(12),
            },
          }),
          sizeLarge: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(16),
            padding: theme.spacing(1.5, 2.25),
            "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)": {
              fontSize: theme.typography.pxToRem(20),
            },
            [theme.breakpoints.down("md")]: {
              fontSize: theme.typography.pxToRem(14),
              padding: theme.spacing(1.25, 2),
              "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)":
                {
                  fontSize: theme.typography.pxToRem(16),
                },
            },
            [theme.breakpoints.down("sm")]: {
              fontSize: theme.typography.pxToRem(12),
              padding: theme.spacing(1, 1.5),
              "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)":
                {
                  fontSize: theme.typography.pxToRem(14),
                },
            },
          }),
          containedPrimary: ({ theme }) => ({
            color:
              mode === "light"
                ? theme.palette.primary.contrastText
                : theme.palette.secondary.contrastText,
            ":hover": {
              backgroundColor: theme.palette.primary.light,
            },
            ":disabled": {
              backgroundColor: theme.palette.primary.main,
              color:
                mode === "light"
                  ? theme.palette.primary.contrastText
                  : theme.palette.secondary.contrastText,
            },
            "&.MuiButtonBase-root.Mui-disabled": {
              backgroundColor: theme.palette.primary.main,
            },
          }),
          containedSecondary: ({ theme }) => ({
            ":hover": {
              backgroundColor: theme.palette.secondary.light,
            },
            ":disabled": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
            },
          }),
          outlinedSecondary: ({ theme }) => ({
            borderColor: theme.palette.outline,
            ":disabled": {
              color: theme.palette.secondary.main,
            },
            ":hover": {
              backgroundColor: "transparent",
            },
          }),
          containedError: ({ theme }) => ({
            ":hover": {
              backgroundColor: theme.palette.error.light,
            },
            ":disabled": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
            },
          }),
          containedInherit: ({ theme }) => ({
            color:
              mode === "light"
                ? theme.palette.primary.contrastText
                : theme.palette.secondary.contrastText,
          }),
          textSecondary: {
            ":hover": {
              backgroundColor: "unset",
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& .mic-off-line": {
              fill: theme.palette.warning.main,
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          sizeMedium: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(20),
          }),
          sizeLarge: ({ theme }) => ({
            "& > .MuiSvgIcon-root": {
              fontSize: theme.typography.pxToRem(20),
              [theme.breakpoints.down("md")]: {
                fontSize: theme.typography.pxToRem(16),
              },
            },
          }),
          root: ({ theme }) => ({
            borderRadius: theme.borderRadius.large,
            padding: theme.spacing(1.5, 2),
            [theme.breakpoints.down("md")]: {
              padding: theme.spacing(1.25, 1.75),
            },
            "& > .MuiSvgIcon-root": {
              fontSize: theme.typography.pxToRem(16),
              [theme.breakpoints.down("md")]: {
                fontSize: theme.typography.pxToRem(12),
              },
            },
          }),
          colorPrimary: ({ theme }) => ({
            background: theme.palette.primary.main,
            color:
              mode === "light"
                ? theme.palette.primary.contrastText
                : theme.palette.secondary.contrastText,
            ":hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
            },
            ":disabled": {
              opacity: 0.5,
              backgroundColor: theme.palette.primary.main,
              color:
                mode === "light"
                  ? theme.palette.primary.contrastText
                  : theme.palette.secondary.contrastText,
            },
          }),
          colorSecondary: ({ theme }) => ({
            backgroundColor: theme.palette.secondary.lighter,
            ":hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
            },
            ":disabled": {
              opacity: 0.5,
              backgroundColor: theme.palette.secondary.lighter,
            },
          }),
        },
      },
      MuiSwitch: {
        defaultProps: {
          color: "secondary",
        },
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(0, 0, 0, 0.25),
            width: theme.typography.pxToRem(46),
            height: theme.typography.pxToRem(24),
            marginRight: 0,
            [theme.breakpoints.down("sm")]: {
              width: theme.typography.pxToRem(40),
              height: theme.typography.pxToRem(20),
            },
          }),
          switchBase: ({ theme }) => ({
            padding: theme.spacing(0.25),
            "&.Mui-checked": {
              color: theme.palette.common.white,
              "& + .MuiSwitch-track": {
                opacity: 1,
              },
            },
            "&.Mui-focusVisible": {
              backgroundColor: theme.palette.focus.contrastColor,
              transitionDuration: "100ms",
            },
            "&.Mui-disabled": {
              "& + .MuiSwitch-track": {
                opacity: 0.4,
              },
            },
          }),
          track: {
            opacity: 1,
            borderRadius: 16,
          },
          thumb: ({ theme }) => ({
            width: theme.typography.pxToRem(20),
            height: theme.typography.pxToRem(20),
            "&:before": {
              content: "''",
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: 8,
            },
            [theme.breakpoints.down("sm")]: {
              width: theme.typography.pxToRem(16),
              height: theme.typography.pxToRem(16),
            },
          }),
          colorSecondary: ({ theme }) => ({
            "& + .MuiSwitch-track": {
              backgroundColor: theme.palette.secondary.lighter,
            },
          }),
        },
      },
      MuiSlider: {
        styleOverrides: {
          thumb: ({ theme }) => ({
            color: theme.palette.secondary.main,
            boxShadow: "0 0 0 0px !important",
            "&.Mui-focusVisible": {
              backgroundColor: theme.palette.primary.main,
              transitionDuration: "100ms",
            },
          }),
          markLabel: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
          mark: {
            width: 0,
            height: 0,
            opacity: 0,
          },
          track: ({ theme }) => ({
            color: theme.palette.secondary.main,
          }),
          rail: ({ theme }) => ({
            color: theme.palette.secondary.lighter,
          }),
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(14),
            [theme.breakpoints.down("md")]: {
              fontSize: theme.typography.pxToRem(12),
            },
            textTransform: "none",
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontWeight: 600,
            lineHeight: "unset",
            color: theme.palette.text.secondary,
            backgroundColor: "inherit",
            "&.Mui-error": {
              color: theme.palette.primary.contrastText,
            },
            "&.Mui-focused": {
              color: theme.palette.primary.contrastText,
            },
          }),
          shrink: ({ theme }) => ({
            "&:not(&.Mui-focused)": {
              backgroundColor:
                mode === "light" ? theme.palette.background.paper : theme.palette.secondary.lighter,
              color: theme.palette.primary.contrastText,
              padding: theme.spacing(0.2, 1),
              borderRadius: theme.borderRadius.small,
            },
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            // https://stackoverflow.com/questions/76228510/mui-textfield-outline-overlaps-label
            "& > fieldset > legend": {
              fontSize: `calc(0.7 * ${theme.typography.pxToRem(18)})`,
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.focus.color,
              },
            },
          }),
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: ({ theme }) => ({
            display: "flex",
            borderRadius: 2,
            fontSize: theme.typography.pxToRem(16),
            fontWeight: 400,
            lineHeight: 1.25,
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            border: `1px ${theme.palette.secondary.main}`,
            "& .MuiSvgIcon-root": {
              color: theme.palette.primary.contrastText,
            },
            ":hover": {
              border: `1px ${theme.palette.primary.main}`,
            },
            "&.Mui-focused": {
              backgroundColor:
                mode === "light" ? theme.palette.common.white : theme.palette.text.secondary,
              color: theme.palette.primary.contrastText,
              "& .MuiSvgIcon-root": {
                color: theme.palette.primary.contrastText,
              },
            },
            "&.Mui-disabled": {
              backgroundColor: "transparent",
              color: theme.palette.primary.contrastText,
              borderColor: theme.palette.secondary.main,
              "& .MuiSvgIcon-root": {
                color: theme.palette.primary.contrastText,
              },
            },
            "&.Mui-error": {
              backgroundColor:
                mode === "light" ? theme.palette.common.white : theme.palette.text.secondary,
              color: theme.palette.primary.contrastText,
              borderColor: theme.palette.error.main,
            },
            [theme.breakpoints.down("md")]: {
              lineHeight: "unset",
            },
            "& .MuiButtonBase-root.MuiIconButton-root.Mui-focusVisible": {
              outline: theme.palette.focus.contrastOutline,
              outlineOffset: "-2px",
            },
            variants: [
              {
                props: {
                  color: "primary",
                },
                style: {
                  "& .MuiSvgIcon-root": {
                    color: theme.palette.secondary.contrastText,
                  },
                },
              },
              {
                props: ({ ownerState }) => ownerState.checked,
                style: {
                  "&:not(&.Mui-focused):not(:hover)": {
                    backgroundColor: "#C1E9D2",
                    color:
                      mode === "light"
                        ? theme.palette.primary.contrastText
                        : theme.palette.secondary.contrastText,
                    border: "1px solid #24A037",
                    "&::after": {
                      position: "absolute",
                      backgroundColor: "#C1E9D2",
                      paddingLeft: theme.spacing(1),
                      right: theme.spacing(2),
                      width: theme.typography.pxToRem(24),
                      height: theme.typography.pxToRem(16),
                      [theme.breakpoints.down("md")]: {
                        width: theme.typography.pxToRem(20),
                        height: theme.typography.pxToRem(12),
                        transform: "translateY(-1px)",
                      },
                    },
                  },
                },
              },
            ],
          }),
          input: ({ theme }) => ({
            padding: theme.spacing(1.5, 2),
            height: "inherit",
            "&.Mui-disabled": {
              color: theme.palette.primary.contrastText,
              WebkitTextFillColor: theme.palette.primary.contrastText,
            },
            "&::placeholder": {
              color: theme.palette.text.placeholder,
            },
          }),
          multiline: {
            padding: 0,
          },
          colorSecondary: ({ theme }) => ({
            backgroundColor: theme.palette.secondary.lighter,
            color: theme.palette.secondary.main,
          }),
          inputAdornedStart: {
            "&&": {
              paddingLeft: 0,
            },
          },
          inputAdornedEnd: ({ theme }) => ({
            "&.MuiInputBase-input": {
              paddingRight: theme.spacing(4),
            },
          }),
          inputSizeSmall: ({ theme }) => ({
            padding: theme.spacing(1, 4, 1, 1.5),
            fontSize: theme.typography.pxToRem(14),
          }),
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: "inherit",
            "& .MuiSvgIcon-root": {
              fontSize: theme.typography.pxToRem(16),
              [theme.breakpoints.down("md")]: {
                fontSize: theme.typography.pxToRem(12),
              },
            },
          }),
          positionEnd: ({ theme }) => ({
            position: "absolute",
            right: theme.spacing(2),
          }),
          positionStart: ({ theme }) => ({
            height: 0,
            padding: theme.spacing(1.5, 0.5),
            marginRight: 0,
          }),
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: ({ theme }) => ({
            marginLeft: 0,
            color: theme.palette.text.primary,
            variants: [
              {
                props: ({ ownerState }) => ownerState.error,
                style: {
                  color: theme.palette.error.main,
                  "&::before": {
                    content: "'!'",
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "1.25rem",
                    height: "1.25rem",
                    borderRadius: "50%",
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    marginRight: theme.spacing(0.5),
                  },
                },
              },
            ],
          }),
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            width: theme.typography.pxToRem(40),
            height: theme.typography.pxToRem(40),
            fontWeight: 500,
            [theme.breakpoints.down("md")]: {
              width: theme.typography.pxToRem(32),
              height: theme.typography.pxToRem(32),
            },
          }),
          text: ({ theme }) => ({
            fill: theme.palette.secondary.contrastText,
          }),
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& > * :first-of-type": {
              color: theme.palette.secondary.light,
            },
            "& > * .Mui-active": {
              color: theme.palette.secondary.main,
            },
            "& > * .Mui-completed": {
              color: theme.palette.secondary.main,
            },
          }),
          label: ({ theme }) => ({
            fontWeight: 500,
            fontFamily: "Opentalk",
            fontSize: theme.typography.pxToRem(22),
            [theme.breakpoints.down("md")]: {
              fontSize: theme.typography.pxToRem(18),
            },
          }),
          labelContainer: ({ theme }) => ({
            color: theme.palette.secondary.main,
          }),
        },
      },
      MuiStepConnector: {
        styleOverrides: {
          line: ({ theme }) => ({
            borderTopWidth: 2,
            borderColor: theme.palette.secondary.main,
          }),
        },
      },
      MuiStepButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& .MuiSvgIcon-root:not(.Mui-active)": {
              fontSize: theme.typography.pxToRem(20),
              padding: 10,
              background: theme.palette.secondary.lighter,
              fill: theme.palette.primary.contrastText,
              borderRadius: "50%",
              [theme.breakpoints.down("md")]: {
                fontSize: theme.typography.pxToRem(16),
                padding: 8,
              },
            },
          }),
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: ({ theme }) => ({
            color: "inherit",
            padding: theme.spacing(0.75),
            right: theme.spacing(1.25),
            [theme.breakpoints.down("md")]: {
              padding: theme.spacing(1),
            },
          }),
          select: ({ theme }) => ({
            "&&": {
              minHeight: "unset",
              paddingRight: theme.spacing(6),
              [theme.breakpoints.down("md")]: {
                paddingRight: theme.spacing(5),
              },
            },
          }),
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontWeight: 400,
            padding: theme.spacing(1.5, 2),
            "&: hover": {
              background: theme.palette.secondary.lighter,
            },
            "&.Mui-selected, &.Mui-selected:hover": {
              background: theme.palette.secondary.lightest,
            },
            "&.Mui-focusVisible": {
              outline: theme.palette.focus.outline,
              // Prevents outline from being covered if selected option is below focused option
              zIndex: 1,
            },
          }),
        },
      },
      MuiList: {
        styleOverrides: {
          root: ({ theme }) => ({
            // Added so the focus outline is visible, otherwise it gets cut out
            padding: theme.spacing(0.3),
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            paddingRight: theme.spacing(1.5),
            fontSize: theme.typography.pxToRem(14),
            border: `1px solid ${theme.palette.secondary.main}`,
            borderRadius: theme.borderRadius.large,
            height: "unset",
            [theme.breakpoints.down("md")]: {
              fontSize: theme.typography.pxToRem(10),
            },
            ":hover": {
              background:
                mode === "light"
                  ? theme.palette.common.white
                  : theme.palette.secondary.contrastText,
            },
            "&.Mui-focusVisible": {
              outline: theme.palette.focus.outline,
              outlineOffset: theme.palette.focus.outlineOffset,
            },
          }),
          label: ({ theme }) => ({
            paddingRight: theme.spacing(2.5),
          }),
          deleteIcon: ({ theme }) => ({
            color: theme.palette.text.primary,
            marginRight: 0,
            ":hover": {
              color: theme.palette.secondary.light,
            },
            ":focus": {
              color: theme.palette.secondary.light,
            },
          }),
          avatar: ({ theme }) => ({
            width: "calc(2.5rem - 2px)",
            height: "calc(2.5rem - 2px)",
            marginLeft: 0,
            [theme.breakpoints.down("md")]: {
              width: "calc(2rem - 2px)",
              height: "calc(2rem - 2px)",
            },
          }),
        },
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.common.white,
            "&.Mui-focusVisible": {
              outline: theme.palette.focus.outline,
            },
          }),
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontWeight: 400,
          },
          secondary: ({ theme }) => ({
            color: theme.palette.primary.contrastText,
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.Mui-focusVisible ": {
              outline: theme.palette.focus.outline,
              backgroundColor: theme.palette.background.light,
              "& .MuiTypography-root": {
                color: theme.palette.text.primary,
              },
            },
          }),
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.contrastText,
            marginRight: theme.spacing(0.5),
            "&.Mui-focusVisible": {
              outline: theme.palette.focus.outline,
            },
          }),
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            marginTop: 16,
            marginBottom: 16,
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: ({ theme }) => ({
            marginLeft: theme.typography.pxToRem(9),
            "&.MuiRadio-colorPrimary": {
              color: theme.palette.primary.main,
              "&.Mui-checked": {
                color: theme.palette.primary.main,
              },
            },
            "&.MuiRadio-colorSecondary": {
              color: theme.palette.secondary.main,
              "&.Mui-checked": {
                color: theme.palette.secondary.main,
              },
            },
            "&.MuiButtonBase-root.MuiRadio-root": {
              marginRight: theme.spacing(0.5),
              "&.Mui-focusVisible": {
                outline: theme.palette.focus.outline,
                outlineOffset: theme.palette.focus.outlineOffset,
              },
            },
          }),
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(0, 3, 3, 3),
            "&> :not(:first-of-type)": {
              marginLeft: theme.spacing(3),
            },
          }),
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          noOptions: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiUseMediaQuery: {
        defaultProps: {
          noSsr: true,
        },
      },
    },
    typography: (palette) => ({
      allVariants: {
        fontFamily: ["Opentalk", "serif"].join(","),
        color: palette.text.primary,
        fontWeight: 500,
        lineHeight: 1.25,
      },
    }),
  });

  /**
   * setting responsive fonts
   */

  theme.typography = {
    ...theme.typography,
    h1: {
      lineHeight: 1.3,
      fontSize: theme.typography.pxToRem(22),
      [theme.breakpoints.down("md")]: {
        fontSize: theme.typography.pxToRem(18),
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.typography.pxToRem(16),
      },
    },
    h2: {
      fontSize: theme.typography.pxToRem(16),
      [theme.breakpoints.down("md")]: {
        fontSize: theme.typography.pxToRem(14),
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.typography.pxToRem(12),
      },
    },
    body1: {
      fontFamily: ["Opentalk", "serif"].join(","),
      fontWeight: 500,
      fontSize: theme.typography.pxToRem(16),
      [theme.breakpoints.down("md")]: {
        fontSize: theme.typography.pxToRem(14),
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.typography.pxToRem(12),
      },
    },
    body2: {
      fontWeight: 400,
      fontSize: theme.typography.pxToRem(16),
      [theme.breakpoints.down("md")]: {
        fontSize: theme.typography.pxToRem(14),
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.typography.pxToRem(12),
      },
    },
    caption: {
      fontSize: theme.typography.pxToRem(12),
      fontWeight: 400,
      [theme.breakpoints.down("md")]: {
        fontSize: theme.typography.pxToRem(12),
      },
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.typography.pxToRem(10),
      },
    },
  };
  return theme;
}
