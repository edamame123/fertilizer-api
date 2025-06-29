// server/middleware/d1.ts
import { logger } from "../utils/logger";

export default defineEventHandler((event) => {
  const requestId = event.context.requestId || "system";

  try {
    if (!event.context.DB && event.context.cloudflare?.env?.DB) {
      event.context.DB = event.context.cloudflare.env.DB;
      logger.debug("DB context initialized", { requestId });
    } else if (!event.context.cloudflare?.env?.DB) {
      logger.warn("Cloudflare D1 database not available", { requestId });
    }
  } catch (error) {
    logger.error(
      "Error initializing DB context",
      { requestId },
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
});
