// server/utils/responseFormatter.ts
import type { ApiResponse, PaginatedApiResponse, ApiMeta } from "~~/types/api";

export function createApiMeta(
  status: "success" | "error",
  requestId: string
): ApiMeta {
  return {
    status,
    version: "1.0",
    requestId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 標準APIレスポンスフォーマット
 * @param data レスポンスデータ
 * @param requestId リクエストID
 * @returns 整形されたAPIレスポンス
 */
export function formatApiResponse<T>(
  data: T,
  requestId: string
): ApiResponse<T> {
  return {
    meta: {
      status: "success",
      version: "1.0",
      requestId,
      timestamp: new Date().toISOString(),
    },
    data,
  };
}

/**
 * ページネーション付きAPIレスポンスフォーマット
 * @param data レスポンスデータ
 * @param requestId リクエストID
 * @param total 総件数
 * @param page 現在のページ
 * @param perPage 1ページあたりの件数
 * @returns ページネーション情報付きAPIレスポンス
 */
export function formatPaginatedResponse<T>(
  data: T,
  requestId: string,
  total: number,
  page: number,
  perPage: number
): PaginatedApiResponse<T> {
  const pageCount = Math.ceil(total / perPage);

  return {
    meta: {
      status: "success",
      version: "1.0",
      requestId,
      timestamp: new Date().toISOString(),
    },
    data,
    pagination: {
      total,
      page,
      perPage,
      pageCount,
    },
  };
}
