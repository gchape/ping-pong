import { useState, useEffect } from "react";
import { useParams } from "react-router";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

interface GameState {
  gameStatus: string;
  playerName: string;
}

export const useGame = (): GameState => {
  const { playerName } = useParams<{ playerName: string }>();
  const [gameStatus, setGameStatus] = useState<string>(
    "Waiting for another player..."
  );

  useEffect(() => {
    if (playerName) {
      socket.emit("joinGame", { playerName, socketId: socket.id });

      socket.on("gameUpdate", (data: string) => {
        setGameStatus(data);
      });

      socket.on("gameStart", (data: string) => {
        setGameStatus(data);
      });

      return () => {
        socket.off("gameUpdate");
        socket.off("gameStart");
      };
    }
  }, [playerName]);

  return { gameStatus, playerName: playerName || "" };
};
