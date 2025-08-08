import { Box, Link } from "@mui/material";
import { FC } from "react";
import { COLORS } from "./constants";

interface FooterProps {
  roomLink: string;
}

export const Footer: FC<FooterProps> = ({ roomLink }) => {
  return (
    <>
      <Box
        style={{ backgroundColor: COLORS.contrastBackground, padding: "20px 0", margin: "15px" }}
      >
        If the buttons or links don&apos;t work open your browser and type in the following links:
        <br />
        {roomLink}
      </Box>
      New to OpenTalk? Read our quick guide here:{" "}
      <Link href="https://opentalk.eu/en/quick-manual">https://opentalk.eu/en/quick-manual</Link>
    </>
  );
};
