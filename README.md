# Ping Pong Game

A simple multiplayer ping pong game built with **React**, **Socket.IO**, **Vite**, and **Express**.

## Features

- **Multiplayer**: Play with another player in real-time.
- **WebSocket Connection**: Using **Socket.IO** to handle real-time communication between players.
- **React** frontend for user interaction and game interface.
- **Responsive**: The game is mobile-friendly and works on both desktop and mobile devices.

## Tech Stack

- **Frontend**:

  - React
  - React Router
  - React Bootstrap
  - Socket.IO client
  - Vite for bundling and development
  - TypeScript

- **Backend**:

  - Express
  - Socket.IO server for real-time communication
  - CORS for cross-origin requests

## Setup Instructions

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ping-pong
```

### 2. Install Dependencies

```bash
npm install
```

This will install both frontend and backend dependencies since they are in the same project.

### 3. Run the Application

Run the application in **development mode** (this will run both the server and the React app simultaneously):

```bash
npm run dev
```

- The backend server will be available on `http://localhost:4000`.
- The frontend (React app) will be available on `http://localhost:5173`.

### 4. Open the Game

- Open a browser and navigate to `http://localhost:5173`.
- You will see a simple home screen where you can enter your name and join the game.

### 5. Play the Game

Once you’ve entered your name, the application will open a new window to join the game. You will be matched with another player. The game starts when both players are connected.

## File Structure

```bash
├── public/
│   └── vite.svg            # Vite logo SVG file
├── src/
│   ├── assets/
│   │   └── pp-animated.gif # Animated ping pong image
│   ├── components/
│   │   ├── Game.tsx        # Game screen component
│   │   └── Home.tsx        # Home screen component
│   ├── app/
│   │   └── router.ts       # Routing setup with React Router
│   ├── events/
│   │   └── click.ts        # Handling player joining logic
│   ├── index.css           # Global CSS
│   ├── main.tsx            # Entry point for React app
│   ├── server/
│   │   └── server.js       # Express server setup
│   ├── vite-env.d.ts       # TypeScript declarations for Vite
├── package.json            # Project metadata and dependencies
├── tsconfig.app.json       # TypeScript config for frontend
├── tsconfig.json           # TypeScript config (common for both frontend and backend)
├── tsconfig.node.json      # TypeScript config for backend
├── vite.config.ts          # Vite config for bundling
└── README.md               # This file
```

## Game Instructions

### How to Play:

1. **Move the Paddle**: Use your mouse to control the paddle on the screen.
2. **Score Points**: Hit the ball to score points. The game is played to 5 points.
3. **Matchmaking**: Once you join the game, you’ll be matched with another player.
4. **Game Start**: Once both players have joined, the game will start.
