// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PaletteMode, PaletteOptions } from "@mui/material";

export const brandPrimary = "#D1E545";
export const brandOutline = "#DBE0E2";
export const textPrimaryLight = "#20434F";
export const textPrimaryDark = "#FFF";
export const backgroundGradientLight =
  "linear-gradient(81deg, rgba(32,67,79,0.05) 0%, rgba(209,229,69,0.05) 100%)";
export const backgroundGradientDark =
  "linear-gradient(109deg, rgba(32,67,79,1) 0%, rgba(30,59,69,1) 100%)";

export const avatarBg = "#00212E";

export const avatarColorTable: Array<string> = [
  "#03BEF7",
  "#18BA80",
  "#FE8845",
  "#D05EFA",
  "#FD7171",
  "#F7BF03",
  "#FFFFFF",
  "#D4E862",
  "#77D854",
  "#E0386A",
  "#FFCCCC",
  "#2DEBD5",
  "#B817C1",
  "#FFF969",
  "#468EFF",
  "#765FFF",
];

const lightPalette: PaletteOptions = {
  primary: {
    light: "#DEED7B",
    main: brandPrimary,
    dark: "#C6D941",
    contrastText: textPrimaryLight,
  },
  secondary: {
    lightest: "#EAECEB",
    lighter: "#DBE0E2",
    light: "#4C6872",
    main: "#20434F",
    dark: "#19353F",
    contrastText: "#FFF",
  },
  outline: brandOutline,
  error: {
    light: "#EA8F8F",
    main: "#D32F2F",
    contrastText: "#FFF",
    dark: "#BB1F1F",
  },
  warning: {
    main: "#FF9300",
    contrastText: "#FFF",
    dark: "#FF9800",
  },
  info: {
    main: "#239EB1",
    contrastText: "#FFF",
    dark: "#2196F3",
  },
  success: {
    main: "#3ABD9F",
    contrastText: "#FFF",
    dark: "#43A047",
  },
  focus: {
    color: "#005392",
    outline: "2px solid #005392",
    outlineOffset: "2px",
    contrastColor: "#deed7b",
    contrastOutline: "2px solid #deed7b",
  },
  text: {
    primary: textPrimaryLight,
    secondary: "#FFF",
    disabled: "#72757B",
    placeholder: "#53616c",
  },
  background: {
    default: "#FFF",
    defaultGradient: backgroundGradientLight,
    paper: "#F4F4F4",
    overlay: backgroundGradientLight,
    video: "#01010166",
    secondaryOverlay: "#20434f66",
    voteResult: "#385865",
    light: "#475b5f",
  },
  action: {
    hover: "#20434F14",
  },
  avatar: {
    background: avatarBg,
    colorTable: avatarColorTable,
  },
};

const darkPalette: PaletteOptions = {
  primary: {
    light: "#E3EAB0",
    main: brandPrimary,
    dark: "#C6D941",
    contrastText: brandOutline,
  },
  secondary: {
    light: "#E0E5E6",
    main: "#C6CCCE",
    dark: "#A8AFB1",
    lightest: "#1F3E49",
    lighter: "#1F3E49",
    contrastText: "#17313A",
  },
  outline: brandOutline,
  error: {
    main: "#FE5F60",
    contrastText: "#FFF",
    dark: "#D32F2F",
    light: "#FE6363",
  },
  warning: {
    main: "#FF9300",
    contrastText: "#FFF",
    dark: "#FF9800",
  },
  info: {
    main: "#239EB1",
    contrastText: "#FFF",
    dark: "#2196F3",
  },
  success: {
    main: "#3ABD9F",
    contrastText: "#FFF",
    dark: "#43A047",
  },
  focus: {
    color: "#deed7b",
    outline: "2px solid #deed7b",
    outlineOffset: "2px",
    contrastColor: "#005392",
    contrastOutline: "2px solid #005392",
  },
  text: {
    primary: textPrimaryDark,
    secondary: "#20434F",
    disabled: "#72757B",
    placeholder: "#cccccc",
  },
  background: {
    default: "#000",
    defaultGradient: backgroundGradientDark,
    paper: "#17313A",
    overlay: backgroundGradientDark,
    video: "#01010166",
    secondaryOverlay: "#20434f66",
    voteResult: "#385865",
    light: "#475b5f",
  },
  action: {
    hover: "#20434F14",
  },
  avatar: {
    background: avatarBg,
    colorTable: avatarColorTable,
  },
};

export function getPalette(mode: PaletteMode = "light") {
  return mode === "light" ? lightPalette : darkPalette;
}
