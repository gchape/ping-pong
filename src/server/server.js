import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const WINNING_SCORE = 5;
const BALL_SPEED = 4;

let gameRooms = new Map();

class GameRoom {
  constructor() {
    this.players = [];
    this.sockets = [];
    this.gameStarted = false;
    this.gameEnded = false;
    this.winner = null;
    this.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
      dy: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
    };
    this.paddles = {
      player1: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
      player2: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
    };
    this.gameLoop = null;
  }

  addPlayer(socket, playerName) {
    if (this.players.length >= 2) return false;

    this.players.push(playerName);
    this.sockets.push(socket);

    socket.emit("player-joined", {
      playerId: this.players.length - 1,
      players: [...this.players],
    });

    this.broadcast("game-state", this.getGameState());

    if (this.players.length === 2) {
      this.startGame();
    }

    return true;
  }

  removePlayer(socket) {
    const index = this.sockets.indexOf(socket);
    if (index !== -1) {
      this.players.splice(index, 1);
      this.sockets.splice(index, 1);

      if (this.gameLoop) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
      }

      this.gameStarted = false;
      this.gameEnded = false;

      this.broadcast("player-disconnected", { players: [...this.players] });
    }
  }

  movePaddle(playerId, y) {
    if (playerId === 0) {
      this.paddles.player1.y = Math.max(
        0,
        Math.min(y, CANVAS_HEIGHT - PADDLE_HEIGHT)
      );
    } else if (playerId === 1) {
      this.paddles.player2.y = Math.max(
        0,
        Math.min(y, CANVAS_HEIGHT - PADDLE_HEIGHT)
      );
    }
  }

  startGame() {
    if (this.players.length !== 2 || this.gameStarted) return;

    this.gameStarted = true;
    this.broadcast("game-started");

    this.gameLoop = setInterval(() => {
      this.updateGame();
    }, 1000 / 60);
  }

  updateGame() {
    if (!this.gameStarted || this.gameEnded) return;

    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    if (this.ball.y <= BALL_SIZE || this.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
      this.ball.dy = -this.ball.dy;
    }

    const ballLeft = this.ball.x - BALL_SIZE;
    const ballRight = this.ball.x + BALL_SIZE;
    const ballTop = this.ball.y - BALL_SIZE;
    const ballBottom = this.ball.y + BALL_SIZE;

    const paddle1Left = 10;
    const paddle1Right = 20;
    const paddle1Top = this.paddles.player1.y;
    const paddle1Bottom = this.paddles.player1.y + PADDLE_HEIGHT;

    if (
      ballLeft <= paddle1Right &&
      ballRight >= paddle1Left &&
      ballBottom >= paddle1Top &&
      ballTop <= paddle1Bottom &&
      this.ball.dx < 0
    ) {
      this.ball.dx = -this.ball.dx;
      const hitPos = (this.ball.y - paddle1Top) / PADDLE_HEIGHT;
      this.ball.dy += (hitPos - 0.5) * 2;
    }

    const paddle2Left = CANVAS_WIDTH - 20;
    const paddle2Right = CANVAS_WIDTH - 10;
    const paddle2Top = this.paddles.player2.y;
    const paddle2Bottom = this.paddles.player2.y + PADDLE_HEIGHT;

    if (
      ballLeft <= paddle2Right &&
      ballRight >= paddle2Left &&
      ballBottom >= paddle2Top &&
      ballTop <= paddle2Bottom &&
      this.ball.dx > 0
    ) {
      this.ball.dx = -this.ball.dx;
      const hitPos = (this.ball.y - paddle2Top) / PADDLE_HEIGHT;
      this.ball.dy += (hitPos - 0.5) * 2;
    }

    if (this.ball.x < 0) {
      this.paddles.player2.score++;
      this.resetBall();
    } else if (this.ball.x > CANVAS_WIDTH) {
      this.paddles.player1.score++;
      this.resetBall();
    }

    if (this.paddles.player1.score >= WINNING_SCORE) {
      this.endGame(this.players[0]);
    } else if (this.paddles.player2.score >= WINNING_SCORE) {
      this.endGame(this.players[1]);
    }

    this.broadcast("game-state", this.getGameState());
  }

  resetBall() {
    this.ball.x = CANVAS_WIDTH / 2;
    this.ball.y = CANVAS_HEIGHT / 2;
    this.ball.dx = Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED;
    this.ball.dy = Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED;
  }

  endGame(winner) {
    this.gameEnded = true;
    this.gameStarted = false;
    this.winner = winner;

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    this.broadcast("game-ended", { winner });
  }

  resetGame() {
    this.gameEnded = false;
    this.winner = null;
    this.paddles.player1.score = 0;
    this.paddles.player2.score = 0;
    this.resetBall();

    if (this.players.length === 2) {
      this.startGame();
    }
  }

  getGameState() {
    return {
      ball: { ...this.ball },
      paddles: {
        player1: { ...this.paddles.player1 },
        player2: { ...this.paddles.player2 },
      },
      gameStarted: this.gameStarted,
      gameEnded: this.gameEnded,
      winner: this.winner,
      players: [...this.players],
    };
  }

  broadcast(event, data) {
    this.sockets.forEach((socket) => {
      socket.emit(event, data);
    });
  }

  isEmpty() {
    return this.players.length === 0;
  }
}

function findOrCreateRoom() {
  for (let [roomId, room] of gameRooms) {
    if (room.players.length < 2) {
      return room;
    }
  }

  const roomId = Date.now().toString();
  const room = new GameRoom();
  gameRooms.set(roomId, room);
  return room;
}

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  let currentRoom = null;

  socket.on("join-game", (playerName) => {
    console.log(`Player ${playerName} joining game`);

    currentRoom = findOrCreateRoom();
    const success = currentRoom.addPlayer(socket, playerName);

    if (!success) {
      socket.emit("error", "Room is full");
    }
  });

  socket.on("paddle-move", ({ playerId, y }) => {
    if (currentRoom && currentRoom.gameStarted) {
      currentRoom.movePaddle(playerId, y);
    }
  });

  socket.on("play-again", () => {
    if (currentRoom) {
      currentRoom.resetGame();
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    if (currentRoom) {
      currentRoom.removePlayer(socket);

      if (currentRoom.isEmpty()) {
        for (let [roomId, room] of gameRooms) {
          if (room === currentRoom) {
            gameRooms.delete(roomId);
            break;
          }
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Game server ready for connections`);
});
