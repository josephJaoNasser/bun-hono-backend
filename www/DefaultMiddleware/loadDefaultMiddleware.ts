import { cors } from "hono/cors";
import LogRoute from "./LogRoute";
import { Hono } from "hono";

/**
 * @param {Hono} app
 */
function loadDefaultMiddleware(app: Hono) {
  const corsOptions = {
    origin: "*",
  };

  app.use("*", cors(corsOptions));
  app.use("*", LogRoute);
}

export default loadDefaultMiddleware;
