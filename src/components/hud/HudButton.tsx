export function HudButton({
  icon,
  caption,
  onClick,
  disabled,
}: {
  icon: string;
  caption: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}>
      <span className="icon">{icon}</span>
      <br />
      <span className="caption">{caption}</span>
    </button>
  );
}
