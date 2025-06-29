// server/api/public/categories/[id].ts
//import { defineEventHandler, getQuery } from "h3";
import { logger } from "../../../utils/logger";
import { formatApiResponse } from "../../../utils/responseFormatter";
import {
  ErrorCode,
  createApiError,
  logApiError,
  ErrorMessages,
} from "../../../utils/errorHandler";
import categoryService from "../../services/categoryService";

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId || "unknown";
  const categoryId = event.context.params?.id;

  try {
    logger.debug("Public Category By ID API request", {
      requestId,
      path: event.path,
      method: event.method,
      categoryId,
    });

    if (!categoryId) {
      throw createApiError(
        400,
        ErrorCode.MISSING_PARAMETER,
        "カテゴリIDが必要です",
        undefined,
        requestId
      );
    }

    // サービス層のみを呼び出し（DB操作なし）
    const category = await categoryService.getCategoryById(categoryId, event);

    // 標準化されたレスポンス形式を使用
    return formatApiResponse(category, requestId);
  } catch (error: unknown) {
    // エラーログの記録
    logApiError(error, {
      requestId,
      path: event.path,
      method: event.method,
      query: { id: categoryId },
    });

    // APIエラーの場合はそのまま返す
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    // その他の予期しないエラー
    logger.error(
      "Error in public category by ID API",
      {
        requestId,
        path: event.path,
        method: event.method,
        query: { id: categoryId },
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
