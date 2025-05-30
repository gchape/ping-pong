import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./app/router.ts";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
