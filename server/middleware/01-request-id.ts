// server/middleware/request-id.ts
import { randomUUID } from "crypto";
import { logger } from "../utils/logger";
import { getLogLevelForStatusCode } from "../utils/errorHandler";

export default defineEventHandler((event) => {
  // リクエストIDの生成と設定
  const requestId = randomUUID();
  event.context.requestId = requestId;

  // レスポンスヘッダーにリクエストIDを追加
  setResponseHeader(event, "X-Request-ID", requestId);

  // リクエスト開始ログ
  logger.info(`Request started: ${event.method} ${event.path}`, {
    requestId,
    path: event.path,
    method: event.method,
    query: getQuery(event),
  });

  // リクエスト完了後のログ記録
  event.res.on("finish", () => {
    const statusCode = event.res.statusCode;
    // ステータスコードに基づいて適切なログレベルを取得
    const logLevel = getLogLevelForStatusCode(statusCode);

    // 適切なログレベルでリクエスト完了を記録
    logger[logLevel.toLowerCase() as keyof typeof logger](
      `Request completed: ${statusCode}`,
      {
        requestId,
        path: event.path,
        method: event.method,
        statusCode,
        responseTime: Date.now() - event.context.timestamp,
      }
    );
  });

  // リクエスト開始タイムスタンプを記録
  event.context.timestamp = Date.now();
});
