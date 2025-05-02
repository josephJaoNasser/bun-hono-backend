import PingController from "@/controllers/ping/ping.controller";
import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

router.get("/", PingController);

export default {
  route: router,
  path: "/ping",
};
