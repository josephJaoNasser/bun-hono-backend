import path from "path";
import loadDefaultMiddleware from "./DefaultMiddleware/loadDefaultMiddleware";
import logger from "@/utils/logger";
import { Route } from "@/types";
import { Hono } from "hono";
import { Glob } from "bun";

class WebServer {
  _app: Hono;

  DEFAULT_PORT = 3030;

  constructor() {
    this._app = new Hono();
    this._loadDefaultMiddlewares();
  }

  _loadDefaultMiddlewares() {
    loadDefaultMiddleware(this._app);
  }

  async _dynamicallyLoadRoutes() {
    const routeDir = path.join(__dirname, "../routes");
    const glob = new Glob("**.route.ts");
    let routes: Route[] = [];

    for await (const file of glob.scan({ cwd: routeDir, onlyFiles: true })) {
      const pathName = path.join(__dirname, `../routes/${file}`);
      logger.info(`Adding route: ../routes/${file}`);
      const routeFile = require(pathName);
      const route: Route = routeFile.default || routeFile;
      if (!route.path) {
        route.path = file.split(".route")[0];
      }

      routes.push(route);
    }

    routes = routes
      .filter((r) => !!r)
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

    for (const route of routes) {
      this._app.route(route.path, route.route);
      const addedRoute = this._app.routes.find((r) => (r.path = route.path));

      if (addedRoute) logger.success(`Added route ${addedRoute.path}`);
    }
    console.log("\n");
  }

  async start() {
    await this._dynamicallyLoadRoutes();

    const PORT = process.env.PORT || this.DEFAULT_PORT;
    Bun.serve({
      port: PORT,
      fetch: this._app.fetch,
    });

    logger.info(`Server running at http://localhost:${PORT}\n`);
  }
}

export default new WebServer();
