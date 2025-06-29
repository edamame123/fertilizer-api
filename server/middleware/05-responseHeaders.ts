// server/middleware/responseHeaders.ts
import { defineEventHandler, setResponseHeaders } from "h3";
import { logger } from "../utils/logger";

export default defineEventHandler((event) => {
  const url = event.path || "";
  const requestId = event.context.requestId || "system";

  // エンドポイントに基づいてキャッシュ設定を変更
  try {
    if (url.includes("/api/fertilizers")) {
      // データ取得エンドポイント - 短期キャッシュ
      setResponseHeaders(event, {
        "Cache-Control": "public, max-age=60", // 1分
        "Content-Type": "application/json",
      });

      logger.debug("Set short-term cache headers for fertilizers endpoint", {
        requestId,
        path: url,
        cacheControl: "public, max-age=60",
      });
    } else if (url.includes("/api/")) {
      // フィルタリング系エンドポイント - 長期キャッシュ
      setResponseHeaders(event, {
        "Cache-Control": "public, max-age=3600", // 1時間
        "Content-Type": "application/json",
      });

      logger.debug("Set long-term cache headers for API endpoint", {
        requestId,
        path: url,
        cacheControl: "public, max-age=3600",
      });
    }

    // すべてのAPIレスポンスに共通ヘッダー
    if (url.includes("/api/")) {
      setResponseHeaders(event, {
        "X-API-Version": "1.0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      });
    }
  } catch (error) {
    logger.error(
      "Error setting response headers",
      { requestId, path: url },
      { error: error instanceof Error ? error.message : String(error) }
    );
    // ヘッダー設定のエラーはリクエスト処理を中断すべきではないため、
    // ここではエラーを投げずにログ記録のみを行う
  }
});
