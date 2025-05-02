import { Context } from "hono";
import logger from "@/utils/logger";
import { failed, getErrorCode, success } from "@/utils/response";

export default async function ({ req, res, json }: Context) {
  try {
    return json(success({ message: "Connected to API!" }));
  } catch (err) {
    logger.error(err);
    return json(failed(err), 500);
  }
}
