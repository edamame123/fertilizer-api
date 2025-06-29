// server/api/v1/components.ts
import { defineEventHandler, getQuery } from "h3";
import { logger } from "../../utils/logger";
import { formatApiResponse } from "../../utils/responseFormatter";
import {
  ErrorCode,
  createApiError,
  logApiError,
  ErrorMessages,
} from "../../utils/errorHandler";
import componentService from "../services/componentService";

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId || "unknown";

  try {
    const query = getQuery(event);
    const componentsStr = query.components as string;

    logger.debug("V1 Components API request", {
      requestId,
      path: event.path,
      method: event.method,
      query,
    });

    // サービス層のみを呼び出し（DB操作なし）
    const products = await componentService.getProductsByComponents(
      componentsStr,
      event
    );

    // 標準化されたレスポンス形式を使用
    const response = formatApiResponse(products, requestId);

    // API v1用のメタデータを追加
    response.meta = {
      ...response.meta,
      version: "1.0",
    };

    // 追加情報をレスポンスに含める
    (response as any).apiInfo = {
      type: "external",
    };

    return response;
  } catch (error: unknown) {
    // エラーログの記録
    logApiError(error, {
      requestId,
      path: event.path,
      method: event.method,
      query: getQuery(event),
    });

    // APIエラーの場合はそのまま返す
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    // その他の予期しないエラー
    logger.error(
      "Error in v1 components API",
      {
        requestId,
        path: event.path,
        method: event.method,
        query: getQuery(event),
      },
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    );

    throw createApiError(
      500,
      ErrorCode.INTERNAL_ERROR,
      ErrorMessages[ErrorCode.INTERNAL_ERROR],
      undefined,
      requestId
    );
  }
});
