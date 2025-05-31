import { useEffect, useRef, useState } from "react";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { io, Socket } from "socket.io-client";

interface GameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };
  paddles: {
    player1: { y: number; score: number };
    player2: { y: number; score: number };
  };
  gameStarted: boolean;
  gameEnded: boolean;
  winner: string | null;
  players: string[];
}

export default function Game() {
  const { playerName } = useParams<{ playerName: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    ball: { x: 400, y: 200, dx: 5, dy: 3 },
    paddles: {
      player1: { y: 150, score: 0 },
      player2: { y: 150, score: 0 },
    },
    gameStarted: false,
    gameEnded: false,
    winner: null,
    players: [],
  });

  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "waiting" | "ready" | "disconnected"
  >("connecting");
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 100;
  const BALL_SIZE = 10;

  useEffect(() => {
    if (!playerName) {
      navigate("/");
      return;
    }

    socketRef.current = io("http://localhost:3001");
    const socket = socketRef.current;

    socket.emit("join-game", playerName);

    socket.on("player-joined", ({ playerId: id, players }) => {
      setPlayerId(id);
      setGameState((prev) => ({ ...prev, players }));
      setConnectionStatus(players.length < 2 ? "waiting" : "ready");
    });

    socket.on("game-state", (newGameState: GameState) => {
      setGameState(newGameState);
    });

    socket.on("game-started", () => {
      setGameState((prev) => ({ ...prev, gameStarted: true }));
      setConnectionStatus("ready");
    });

    socket.on("game-ended", ({ winner }) => {
      setGameState((prev) => ({
        ...prev,
        gameEnded: true,
        winner,
        gameStarted: false,
      }));
    });

    socket.on("player-disconnected", ({ players }) => {
      setGameState((prev) => ({ ...prev, players }));
      setConnectionStatus(players.length < 2 ? "waiting" : "ready");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [playerName, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !socketRef.current || playerId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const normalizedY = Math.max(
        0,
        Math.min(y, CANVAS_HEIGHT - PADDLE_HEIGHT)
      );

      setMouseY(normalizedY);
      socketRef.current?.emit("paddle-move", { playerId, y: normalizedY });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, [playerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fff";
    ctx.fillRect(10, gameState.paddles.player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(
      CANVAS_WIDTH - 20,
      gameState.paddles.player2.y,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );

    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      gameState.paddles.player1.score.toString(),
      CANVAS_WIDTH / 4,
      60
    );
    ctx.fillText(
      gameState.paddles.player2.score.toString(),
      (3 * CANVAS_WIDTH) / 4,
      60
    );

    ctx.font = "16px Arial";
    ctx.fillText(gameState.players[0] || "Player 1", CANVAS_WIDTH / 4, 90);
    ctx.fillText(
      gameState.players[1] || "Player 2",
      (3 * CANVAS_WIDTH) / 4,
      90
    );
  }, [gameState]);

  const handlePlayAgain = () => {
    socketRef.current?.emit("play-again");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const renderGameStatus = () => {
    if (connectionStatus === "connecting") {
      return <Alert variant="info">Connecting to server...</Alert>;
    }

    if (connectionStatus === "disconnected") {
      return <Alert variant="danger">Disconnected from server</Alert>;
    }

    if (connectionStatus === "waiting") {
      return (
        <Alert variant="warning">Waiting for another player to join...</Alert>
      );
    }

    if (gameState.gameEnded) {
      return (
        <Alert
          variant={
            gameState.winner === gameState.players[playerId || 0]
              ? "success"
              : "danger"
          }
        >
          <h4>{gameState.winner} wins!</h4>
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={handlePlayAgain}
              className="me-2"
            >
              Play Again
            </Button>
            <Button variant="secondary" onClick={handleBackToHome}>
              Back to Home
            </Button>
          </div>
        </Alert>
      );
    }

    if (!gameState.gameStarted && connectionStatus === "ready") {
      return <Alert variant="success">Game starting soon...</Alert>;
    }

    return null;
  };

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-dark"
    >
      <Card className="bg-dark border-light">
        <Card.Header className="text-center">
          <Card.Title className="text-light">
            Ping Pong Game - {playerName}
          </Card.Title>
          {playerId !== null && (
            <small className="text-muted">
              You are Player {playerId + 1} ({playerId === 0 ? "Left" : "Right"}{" "}
              Paddle)
            </small>
          )}
        </Card.Header>

        <Card.Body className="p-0">
          {renderGameStatus()}

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-light"
            style={{
              display: "block",
              cursor: gameState.gameStarted ? "none" : "default",
            }}
          />

          {gameState.gameStarted && (
            <div className="text-center text-light mt-2">
              <small>Move your mouse to control your paddle</small>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
