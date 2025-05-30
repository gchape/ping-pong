import { useParams } from "react-router";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Game() {
  const { playerName } = useParams<{ playerName: string }>();
  const [gameStatus, setGameStatus] = useState<string>(
    "Waiting for another player..."
  );

  useEffect(() => {
    // Emit the joinGame event to the backend
    socket.emit("joinGame", { playerName, socketId: socket.id });

    // Listen for game updates from the server
    socket.on("gameUpdate", (data: string) => {
      setGameStatus(data);
    });

    // Listen for gameStart event to notify players when the game starts
    socket.on("gameStart", (data: string) => {
      setGameStatus(data);
    });

    // Cleanup the socket connection when the component is unmounted
    return () => {
      socket.off("gameUpdate");
      socket.off("gameStart");
    };
  }, [playerName]);

  return (
    <div>
      <h1>Welcome, {playerName}!</h1>
      <p>{gameStatus}</p>
    </div>
  );
}
