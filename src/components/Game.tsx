import { useGame } from "../hooks/useGame";

export default function Game() {
  const { gameStatus, playerName } = useGame();

  return (
    <div>
      <h1>Welcome, {playerName}!</h1>
      <p>{gameStatus}</p>
    </div>
  );
}
