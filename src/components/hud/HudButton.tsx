import React from "react";

export function HudButton({
  icon,
  caption,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  caption: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="item">
      <span className="primary">{icon}</span>
      <span className="caption">{caption}</span>
    </button>
  );
}
