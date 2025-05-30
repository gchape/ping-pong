import { createBrowserRouter } from "react-router";
import Game from "../components/Game";
import Home from "../components/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/game/:playerName",
    Component: Game,
  },
]);
