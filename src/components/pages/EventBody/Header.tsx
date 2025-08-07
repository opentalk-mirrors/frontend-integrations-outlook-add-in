import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { COLORS } from "./constants";

interface HeaderProps {
  title: string;
  senderName: string;
}

export const Header: FC<HeaderProps> = ({ title, senderName }) => {
  return (
    <Box
      style={{
        paddingBottom: "15px",
        backgroundColor: COLORS.contrastBackground,
      }}
    >
      <Typography component="h1" style={{ fontSize: "24px", margin: "10px 0" }}>
        OpenTalk Meeting Invitation - {title}
      </Typography>
      <p>{senderName} invites you to an OpenTalk Meeting.</p>
    </Box>
  );
};
