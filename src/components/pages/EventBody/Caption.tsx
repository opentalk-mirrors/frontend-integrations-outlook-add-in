import { Typography } from "@mui/material";
import { FC } from "react";

interface CaptionProps {
  children: React.ReactNode;
}

export const Caption: FC<CaptionProps> = ({ children }) => {
  return (
    <Typography component="h2" style={{ fontSize: "20px" }}>
      {children}
    </Typography>
  );
};
