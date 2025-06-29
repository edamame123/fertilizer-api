// server/middleware/cacheInit.ts
import { refreshTypeCategories } from "../utils/cache";
import { logger } from "../utils/logger";
import { ErrorCode, createApiError } from "../utils/errorHandler";

// process の型拡張
declare global {
  namespace NodeJS {
    interface Process {
      cacheInitialized?: boolean;
    }
  }
}

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId || "system";

  // キャッシュ初期化は一度だけ実行する目印
  if (!process.cacheInitialized) {
    logger.info("Initializing type-category cache", { requestId });

    try {
      await refreshTypeCategories(event);
      process.cacheInitialized = true;
      logger.info("Type-category cache initialized successfully", {
        requestId,
      });
    } catch (error) {
      logger.error(
        "Failed to initialize type-category cache",
        { requestId },
        { error: error instanceof Error ? error.message : String(error) }
      );

      // エラー時でもアプリケーションの実行は続行する
      // 重大なエラーの場合は、ここでcreateApiErrorを返すことも検討可能
    }
  }
});
