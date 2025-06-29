// server/api/public/categories.ts
import { defineEventHandler, getQuery } from "h3";
import { z } from "zod";
import { validateSimple } from "../../utils/validation";
import { logger } from "../../utils/logger";
import { formatApiResponse } from "../../utils/responseFormatter";
import {
  ErrorCode,
  createApiError,
  logApiError,
  ErrorMessages,
} from "../../utils/errorHandler";
import categoryService from "../services/categoryService";

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId || "unknown";

  try {
    const rawQuery = getQuery(event);

    logger.debug("Public Categories API request", {
      requestId,
      path: event.path,
      method: event.method,
      query: rawQuery,
    });

    // type_idパラメータのバリデーション
    const schema = z.object({
      type_id: z.string({
        required_error: "type_idパラメータが必要です",
      }),
    });

    // validateSimpleを使用して検証
    const query = validateSimple(
      schema,
      rawQuery,
      ErrorCode.MISSING_PARAMETER,
      "type_idパラメータが必要です",
      requestId
    );

    // サービス層のみを呼び出し（DB操作なし）
    const categories = await categoryService.getCategoriesByTypeId(
      query.type_id,
      event
    );

    // 標準化されたレスポンス形式を使用
    return formatApiResponse(categories, requestId);
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
      "Error in public categories API",
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
