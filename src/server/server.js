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
  console.log("A player connected");

  socket.on("joinGame", (data) => {
    if (players.length < 2) {
      players.push(data);
      console.log(`${data.playerName} has joined the game`);

      if (players.length === 2) {
        io.emit("gameStart", "Both players have joined! The game is starting!");
      } else {
        io.emit(
          "gameUpdate",
          `${data.playerName} has joined the game! Waiting for another player...`
        );
      }
    } else {
      socket.emit("gameUpdate", "Sorry, the game is already full.");
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected");

    players = players.filter((player) => player.socketId !== socket.id);
    io.emit("gameUpdate", "A player has disconnected.");
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
