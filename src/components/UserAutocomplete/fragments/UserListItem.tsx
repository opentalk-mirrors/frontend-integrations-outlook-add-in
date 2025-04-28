import { Box, Stack, Typography } from "@mui/material";
import React, { FunctionComponent, ReactNode } from "react";
import { ParticipantOption } from "../../../api/types/user";

interface UserListItemProps {
  props?: React.HTMLAttributes<HTMLLIElement>;
  option: ParticipantOption;
  action?: ReactNode;
}

const UserListItem: FunctionComponent<UserListItemProps> = ({ props, option, action }) => {
  const isUser = "kind" in option;
  return (
    <Box
      {...props}
      key={option.email}
      component="li"
      sx={[
        {
          display: "flex",
          alignItems: "center",
          justifyContent: action ? "space-between" : undefined,
          marginBottom: 1,
        },
      ]}
    >
      {isUser ? (
        <Stack>
          <Typography noWrap>
            {option.firstname} {option.lastname}
          </Typography>
          <Typography variant="caption" noWrap>
            {option.email}
          </Typography>
        </Stack>
      ) : (
        <Typography noWrap>{option.email}</Typography>
      )}
      {action !== undefined && action}
    </Box>
  );
};

export default UserListItem;

export const getOptionLabel = (option: ParticipantOption) => {
  if ("kind" in option) {
    return `${option.firstname} ${option.lastname} ${option.email}`;
  }
  if (option.email) {
    return option.email;
  }
  return "";
};
