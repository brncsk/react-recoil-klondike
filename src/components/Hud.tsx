import { useNewGame } from "../hooks";

export function Hud() {
  const newGame = useNewGame();

  return (
    <div className="hud">
      <button onClick={newGame}>Deal New</button>
    </div>
  );
}
