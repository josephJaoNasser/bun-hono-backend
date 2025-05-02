 import { MiddlewareHandler } from "hono";

const ExampleMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    next();
  } catch (err) {}
};

export default ExampleMiddleware;
