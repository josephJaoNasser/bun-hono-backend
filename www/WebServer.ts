import fs = require("fs");
import path = require("path");
import loadDefaultMiddleware from "./DefaultMiddleware/loadDefaultMiddleware";
import logger from "@/utils/logger";
import { Route } from "@/types";
import { Hono } from "hono";

class WebServer {
  _app: Hono;

  DEFAULT_PORT = 3030;

  constructor() {
    this._app = new Hono();
    this._loadDefaultMiddlewares();
    this._dynamicallyLoadRoutes();
  }

  _loadDefaultMiddlewares() {
    loadDefaultMiddleware(this._app);
  }

  _dynamicallyLoadRoutes() {
    const routeFolderContents = fs.readdirSync(
      path.join(__dirname, "../routes"),
      { withFileTypes: true }
    );

    const routes: Route[] = routeFolderContents
      .filter((dirent) => dirent.isFile())
      .map((file) => file.name)
      .filter(
        (file) => file.endsWith(".route.ts") || file.endsWith(".route.js")
      )
      .map((routeFileName) => {
        const pathName = path.join(__dirname, `../routes/${routeFileName}`);
        logger.info(`Adding route: ../routes/${routeFileName}`);
        const routeFile = require(pathName);
        const route = routeFile.default || routeFile;

        if (!route.path) {
          route.path = routeFileName.split(".route")[0];
        }

        return route;
      })
      .sort((a, b) => a.order - b.order);

    for (const route of routes) {
      this._app.route(route.path, route.route);
      const addedRoute = this._app.routes.find((r) => (r.path = route.path));

      if (addedRoute) logger.success(`Added route ${addedRoute.path}`);
    }
    console.log("\n");
  }

  start() {
    const PORT = process.env.PORT || this.DEFAULT_PORT;
    Bun.serve({
      port: PORT,
      fetch: this._app.fetch,
    });

    logger.info(`Server running at http://localhost:${PORT}\n`);
  }
}

export default new WebServer();
