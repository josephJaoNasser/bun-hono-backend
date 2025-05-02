import IndexController from "@/controllers/index/index.controller";
import { MiddlewareFunction } from "@/types";
import { Hono } from "hono";

const router = new Hono();
const routeMiddleware: Array<MiddlewareFunction> = [];

if (routeMiddleware.length) {
  router.use(...routeMiddleware);
}

router.get("/", IndexController);

export default {
  route: router,
  path: "/index",
};
