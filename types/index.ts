import { Context, Hono, Next } from "hono";

export type MiddlewareFunction = (context: Context, next: Next) => any;

export type Route = {
  route: Hono;
  order?: number;
  path: string;
};
