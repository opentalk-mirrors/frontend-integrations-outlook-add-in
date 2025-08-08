import Box from "@mui/material/Box";
import { FC } from "react";
import { CallInInfo } from "../../../api/types/events";
import { Caption } from "./Caption";
import { Typography } from "@mui/material";

export const PhoneParticipation: FC<CallInInfo> = ({ tel, id, password }) => {
  return (
    <Box style={{ margin: "20px 0" }}>
      <Caption>Participate via Phone</Caption>
      <Typography component="p">You can use your phone to participate in this meeting.</Typography>
      <Typography component="p">
        Just dial in the following number and enter the given conference ID and conference PIN, or
        click the Quick-Dial number on your phone.
      </Typography>
      <strong>Number:</strong> {tel}
      <br />
      <strong>Conference ID:</strong> {id}
      <br />
      <strong>Conference PIN:</strong> {password}
      <br />
      <strong>Quick-Dial:</strong> {tel},,{id},,{password}
      <br />
    </Box>
  );
};
