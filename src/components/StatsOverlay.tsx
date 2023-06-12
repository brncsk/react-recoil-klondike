import { useRecoilValue } from "recoil";
import {
  bestTimeState,
  currentStreakState,
  leastMovesState,
  longestWinningOrLosingStreakState,
  numGamesPlayedState,
  numWinsAndLossesState,
} from "../state/stats";
import { formatTime } from "../util/time";

export function StatsOverlay() {
  const numGamesPlayed = useRecoilValue(numGamesPlayedState);
  const { wins, losses } = useRecoilValue(numWinsAndLossesState);
  const currentStreak = useRecoilValue(currentStreakState);

  const longestWinningStreak = useRecoilValue(
    longestWinningOrLosingStreakState(true)
  );
  const longestLosingStreak = useRecoilValue(
    longestWinningOrLosingStreakState(false)
  );

  const bestTime = useRecoilValue(bestTimeState);
  const leastMoves = useRecoilValue(leastMovesState);

  const toPercent = (num: number) => `${(num * 100).toFixed(0)}%`;

  return (
    <table className="stats">
      <tbody>
        <tr>
          <th>Number of Games Played</th>
          <td>{numGamesPlayed}</td>
        </tr>
        <tr>
          <th>Number of Games Won/Lost</th>
          <td>
            {wins} ({toPercent(wins / numGamesPlayed)}) / {losses} (
            {toPercent(losses / numGamesPlayed)})
          </td>
        </tr>
      </tbody>
      <tbody>
        <tr>
          <th>Longest Winning Streak</th>
          <td>{longestWinningStreak}</td>
        </tr>
        <tr>
          <th>Longest Losing Streak</th>
          <td>{longestLosingStreak}</td>
        </tr>
        <tr>
          <th>Current Streak</th>
          <td>
            {currentStreak
              ? `${currentStreak?.streakLength} ${
                  currentStreak?.winning ? "Win(s)" : "Loss(es)"
                }`
              : "None"}
          </td>
        </tr>
      </tbody>
      <tbody>
        <tr>
          <th>Best Time</th>
          <td>{bestTime === Infinity ? "N/A" : formatTime(bestTime)}</td>
        </tr>
        <tr>
          <th>Least Moves</th>
          <td>{leastMoves === Infinity ? "N/A" : leastMoves}</td>
        </tr>
      </tbody>
    </table>
  );
}
