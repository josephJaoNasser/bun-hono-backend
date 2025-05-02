const dotenv = require("dotenv");
dotenv.config();

import WebServer from "./www/WebServer";
import Database from "./database";
import logger from "./utils/logger";

(async () => {
  logger.info("Connecting to database...");
  try {
    const dbConnection = await Database.connect();
    if (!dbConnection)
      return logger
        .verbose()
        .bg()
        .error("Unable to connect to database. Server terminated. ");

    logger.success("Database connection successfull!\n");
  } catch (err) {
    return logger
      .verbose()
      .bg()
      .error("Unable to connect to database. Server terminated.");
  }

  logger.info("Starting the server...");
  WebServer.start();
})();
