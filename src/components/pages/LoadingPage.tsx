import { FC } from "react";
import { Stack, Skeleton, Box } from "@mui/material";

export const LoadingPage: FC = () => {
  return (
    <Stack spacing={3} sx={{ maxWidth: 600, mx: "auto", width: "100%", mt: 4, px: 2 }}>
      {/* 1. Header Area: Avatar + Title Ghost */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="circular" width={48} height={48} />
        <Box width="100%">
          <Skeleton variant="text" width="60%" height={30} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Stack>

      {/* 2. Form Input Ghosts */}
      <Stack spacing={2}>
        {/* Simulates a TextField */}
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />

        {/* Simulates a Row of two inputs (e.g. Date/Time) */}
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" height={56} width="50%" sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={56} width="50%" sx={{ borderRadius: 1 }} />
        </Stack>

        {/* Simulates a large Description box */}
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
      </Stack>

      {/* 3. Action Button Ghost */}
      <Box display="flex" justifyContent="flex-end">
        <Skeleton variant="rounded" width={100} height={40} />
      </Box>
    </Stack>
  );
};
