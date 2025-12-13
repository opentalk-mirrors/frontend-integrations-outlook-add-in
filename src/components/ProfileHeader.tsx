import { FC, useEffect, useState } from "react";
import { Box, Typography, Avatar, IconButton, Divider, Skeleton, Tooltip } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { useClientContext } from "../providers/ClientProvider";
import { useTranslation } from "react-i18next";

export const ProfileHeader: FC = () => {
  const { me, isLoading, logout } = useClientContext();
  const { t } = useTranslation();

  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!me?.avatarUrl) {
      setAvatarSrc(undefined);
      return undefined;
    }

    const img = new Image();
    img.src = me.avatarUrl;
    img.onload = () => setAvatarSrc(me.avatarUrl);

    return () => {
      img.onload = null;
    };
  }, [me?.avatarUrl]);

  // 1. Handle Loading State (Compact)
  if (isLoading || !me) {
    return (
      <>
        <Box sx={{ display: "flex", alignItems: "center", p: 2, gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="80%" height={16} />
          </Box>
        </Box>
        <Divider />
      </>
    );
  }

  const initials = `${me.firstname.charAt(0)}${me.lastname.charAt(0)}`.toUpperCase();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          gap: 2,
          width: "100%",
        }}
      >
        {/* Compact Avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.light",
            color: "primary.contrastText",
            fontSize: "1rem",
            fontWeight: 600,
          }}
          src={avatarSrc}
          alt={me.displayName}
        >
          {initials}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 700, lineHeight: 1.2, color: "text.primary" }}
          >
            {me.displayName}
          </Typography>

          <Typography variant="caption" noWrap display="block" sx={{ color: "#666" }}>
            {me.email}
          </Typography>
        </Box>

        <Tooltip title={t("logout")}>
          <IconButton onClick={logout} size="large" sx={{ color: "action.active" }}>
            <LogoutIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ marginTop: 0 }} />
    </>
  );
};
