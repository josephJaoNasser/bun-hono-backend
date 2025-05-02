import { Context, Next } from "hono";

const LogRouteMiddleware = async (c: Context, next: Next) => {
  const { req } = c;

  let methodString = req.method;
  switch (req.method) {
    case "GET":
      methodString = `\x1b[32m${req.method}\x1b[0m`;
      break;
    case "POST":
      methodString = `\x1b[33m${req.method}\x1b[0m`;
      break;
    case "PUT":
      methodString = `\x1b[34m${req.method}\x1b[0m`;
      break;
    case "PATCH":
      methodString = `\x1b[36m${req.method}\x1b[0m`;
      break;
    case "DELETE":
      methodString = `\x1b[35m${req.method}\x1b[0m`;
      break;
    default:
      methodString = `\x1b[0m${req.method}\x1b[0m`;
      break;
  }

  await next(); // Call the next middleware or route handler

  // Log only if route was matched (not 404)
  if (c.res.status !== 404) {
    console.log(`${methodString} ${req.path}`);
  }
};

export default LogRouteMiddleware;
