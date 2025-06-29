// server/middleware/error-handler.ts
import {
  ErrorCode,
  createApiError,
  getLogLevelForStatusCode,
} from "../utils/errorHandler";
import { logger } from "../utils/logger";
import { H3Error } from "h3";

export default defineEventHandler((event) => {
  // リクエストIDはrequest-id.tsミドルウェアで既に設定されているはず
  const requestId = event.context.requestId;

  // APIバージョンを設定
  setResponseHeader(event, "X-API-Version", "1.0");

  // レスポンスにアクセス制御ヘッダーを設定
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
    "Access-Control-Max-Age": "86400",
  });

  // エラーハンドリング: onErrorを使用して全てのエラーをキャッチ
  event.context.onError = (error: Error | H3Error | unknown) => {
    // H3エラーの場合はそのまま使用
    if (error && typeof error === "object" && "statusCode" in error) {
      return error;
    }

    // 標準エラーをAPIエラーに変換
    const statusCode = error instanceof Error ? 500 : 400;
    const errorCode =
      statusCode === 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST;

    // エラーログを記録
    logger.error(
      `Unhandled error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      {
        requestId,
        path: event.path,
        method: event.method,
        statusCode,
      },
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : String(error),
      }
    );

    // 構造化されたAPIエラーを返す
    return createApiError(
      statusCode,
      errorCode,
      error instanceof Error ? error.message : String(error),
      undefined,
      requestId
    );
  };
});
