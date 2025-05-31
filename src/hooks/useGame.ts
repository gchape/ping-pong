import { useState, useEffect } from "react";
import { useParams } from "react-router";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

interface GameState {
  gameStatus: string;
  playerName: string;
  playerId: number;
}

export const useGame = (): GameState => {
  const { playerName } = useParams<{ playerName: string }>();
  const [gameStatus, setGameStatus] = useState<string>(
    "Waiting for another player..."
  );
  const [playerId, setPlayerId] = useState<number>(0);

  useEffect(() => {
    if (playerName) {
      socket.emit("joinGame", { playerName });

      socket.on("gameUpdate", (status: string) => {
        setGameStatus(status);
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

  useEffect(() => {
    if (playerName) {
      setPlayerId(Math.random() > 0.5 ? 1 : 2);
    }
  }, [playerName]);

  return { gameStatus, playerName: playerName!, playerId };
};
