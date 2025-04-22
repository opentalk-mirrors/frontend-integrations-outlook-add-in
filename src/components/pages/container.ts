import { Stack, styled } from "@mui/material";

export default styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(1, 1, 0),
  display: "flex",
  flexDirection: "column",
  rowGap: "5px",
}));
