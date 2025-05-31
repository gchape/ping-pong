import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

let players = [];

io.on("connection", (socket) => {
  console.log(`A player connected: ${socket.id}`);

  socket.on("joinGame", (data) => {
    const { playerName } = data;

    if (players.length < 2) {
      players.push({ playerName, socketId: socket.id });
      console.log(`${playerName} has joined the game`);

      socket.emit("joinGame", `${playerName} has joined the game`);

      if (players.length === 2) {
        io.emit("gameStart", "Both players have joined! The game is starting!");
      } else {
        io.emit(
          "gameUpdate",
          `${playerName} has joined the game! Waiting for another player...`
        );
      }
    } else {
      socket.emit("gameUpdate", "Sorry, the game is already full.");
    }
  });

  socket.on("paddleMove", (data) => {
    const { playerId, position } = data;
    console.log(`Player ${playerId} moved paddle to position: ${position}`);

    socket.broadcast.emit("opponentPaddleMove", { playerId, position });
  });

  socket.on("disconnect", () => {
    const playerName = players.find(
      (player) => player.socketId === socket.id
    )?.playerName;

    players = players.filter((player) => player.socketId !== socket.id);

    console.log(`${playerName} has disconnected`);
    io.emit("gameUpdate", `${playerName} has disconnected`);
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
