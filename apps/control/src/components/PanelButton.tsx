import React, { ReactNode, MouseEventHandler } from "react";
import Button from "ui/Buttons/Button";

import { styled } from "ui/theme/theme";

const StyledPanelButton = styled(Button, {
  textTransform: "uppercase",

  variants: {
    active: {
      true: {
        borderRadius: 0,
        alignItems: "center",
        justifyContent: "center",
        span: {
          color: "$accent",
        },
        border: "2px solid $brand",
        borderLeft: "none",
        background: "none",
        backgroundColor: "transparent",
        ".icon": {
          span: {
            path: { fill: "$accent" },
          },
        },
      },
      false: {
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderRadius: 0,
        color: "$text",
        borderLeft: "2px solid $brand",
        background: "none",
        backgroundColor: "transparent",
        ".icon": {
          span: {
            path: { fill: "$text" },
          },
        },
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export default function PanelButton({
  children,
  active,
  onClick,
  icon,
  css,
  size = "sm",
}: {
  children: ReactNode;
  active: boolean;
  onClick?: MouseEventHandler;
  icon?: ReactNode;
  css?: any;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <StyledPanelButton
      css={css}
      size={size}
      icon={icon}
      onClick={onClick}
      children={children}
      active={active}
    />
  );
}
