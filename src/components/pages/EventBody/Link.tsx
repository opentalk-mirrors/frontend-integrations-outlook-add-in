import { FC } from "react";
import { COLORS } from "./constants";

interface LinkProps {
  href: string;
  children: React.ReactNode;
}

export const Link: FC<LinkProps> = ({ href, children }) => (
  <a href={href} style={{ color: COLORS.link }} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);
