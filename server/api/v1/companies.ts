// server/api/v1/companies.ts
import { defineEventHandler, getQuery } from "h3";
import { logger } from "../../utils/logger";
import { formatApiResponse } from "../../utils/responseFormatter";
import {
  ErrorCode,
  createApiError,
  logApiError,
  ErrorMessages,
} from "../../utils/errorHandler";
import companyService from "../services/companyService";

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId || "unknown";

  try {
    logger.debug("V1 Companies API request", {
      requestId,
      path: event.path,
      method: event.method,
      query: getQuery(event),
    });

    // サービス層のみを呼び出し（DB操作なし）
    const companies = await companyService.getCompanies(event);

    // 標準化されたレスポンス形式
    return formatApiResponse(companies, requestId);
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
      "Error fetching companies",
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
