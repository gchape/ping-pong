import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useGame } from "../hooks/useGame";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Game() {
  const { playerName, playerId } = useGame();
  const [paddlePosition, setPaddlePosition] = useState(0);
  const [opponentPaddlePosition, setOpponentPaddlePosition] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [ballVelocity, setBallVelocity] = useState({ x: 1, y: 1 });
  const paddleWidth = 70;
  const ballSize = 15;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const position = Math.min(
        Math.max(e.clientX - paddleWidth / 2, 0),
        window.innerWidth - paddleWidth
      );

      setPaddlePosition(position);
      socket.emit("paddleMove", { playerId, position });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [playerName]);

  useEffect(() => {
    socket.on(
      "opponentPaddleMove",
      (data: { playerId: number; position: number }) => {
        if (data.playerId !== playerId) {
          setOpponentPaddlePosition(data.position);
        }
      }
    );

    return () => {
      socket.off("opponentPaddleMove");
    };
  }, [playerId]);

  useEffect(() => {
    const gameInterval = setInterval(() => {
      setBallPosition((prevBallPosition) => {
        let newX = prevBallPosition.x + ballVelocity.x;
        let newY = prevBallPosition.y + ballVelocity.y;

        if (newY <= 0 || newY >= window.innerHeight - ballSize) {
          setBallVelocity((prevVelocity) => ({
            x: prevVelocity.x,
            y: -prevVelocity.y,
          }));
        }

        if (
          newY >= window.innerHeight - 10 &&
          newX >= paddlePosition &&
          newX <= paddlePosition + paddleWidth
        ) {
          setBallVelocity((prevVelocity) => ({
            x: prevVelocity.x,
            y: -prevVelocity.y,
          }));
        }

        if (
          newY <= 10 &&
          newX >= opponentPaddlePosition &&
          newX <= opponentPaddlePosition + paddleWidth
        ) {
          setBallVelocity((prevVelocity) => ({
            x: prevVelocity.x,
            y: -prevVelocity.y,
          }));
        }

        if (newX <= 0 || newX >= window.innerWidth - ballSize) {
          setBallVelocity((prevVelocity) => ({
            x: -prevVelocity.x,
            y: prevVelocity.y,
          }));
        }

        return { x: newX, y: newY };
      });
    }, 1000 / 60);

    return () => clearInterval(gameInterval);
  }, [ballVelocity, paddlePosition, opponentPaddlePosition]);

  useEffect(() => {
    socket.emit("ballMove", ballPosition);

    socket.on("syncBall", (data: { x: number; y: number }) => {
      setBallPosition(data);
    });

    return () => {
      socket.off("syncBall");
    };
  }, [ballPosition]);

  return (
    <Container fluid className="m-0 p-0 bg-dark w-100 h-100 position-relative">
      <div
        className="bg-light position-absolute"
        style={{
          top: "1.5%",
          left: `${paddlePosition}px`,
          width: `${paddleWidth}px`,
          height: "10px",
        }}
      />
      <div
        className="bg-light position-absolute"
        style={{
          bottom: "1.5%",
          left: `${opponentPaddlePosition}px`,
          width: `${paddleWidth}px`,
          height: "10px",
        }}
      />
      <div
        className="bg-light position-absolute"
        style={{
          top: `${ballPosition.y}px`,
          left: `${ballPosition.x}px`,
          width: `${ballSize}px`,
          height: `${ballSize}px`,
          borderRadius: "50%",
          backgroundColor: "white",
        }}
      />
    </Container>
  );
}
