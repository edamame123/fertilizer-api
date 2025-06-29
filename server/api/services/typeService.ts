// server/api/services/typeService.ts
import { H3Event } from "h3";
import { ErrorCode, createApiError } from "~~/server/utils/errorHandler";
import { logger } from "~~/server/utils/logger";
import type { ApiResponse } from "~~/types/api";

interface TypeRecord {
  id: string;
  category: string;
}

export default {
  /**
   * タイプ一覧を取得する
   * @param event H3Event
   * @returns タイプレコードの配列
   */
  async getTypes(event: H3Event): Promise<TypeRecord[]> {
    const requestId = event.context.requestId || "unknown";

    try {
      // NuxtHub統一
      const db = hubDatabase();

      const query =
        "SELECT DISTINCT id, category FROM m_type WHERE id IS NOT NULL";

      logger.debug("Executing types query", { requestId }, { query });

      const queryResult = await db.prepare(query).all();
      const result = (queryResult.results ||
        queryResult) as unknown as TypeRecord[];

      logger.debug(
        "Types query result",
        { requestId },
        { count: result?.length || 0 }
      );

      if (!Array.isArray(result)) {
        throw createApiError(
          500,
          ErrorCode.QUERY_ERROR,
          "無効なクエリ結果形式です",
          undefined,
          requestId
        );
      }

      return result;
    } catch (queryError: unknown) {
      logger.error(
        "Query execution error details",
        { requestId },
        {
          error: queryError,
          message:
            queryError instanceof Error
              ? queryError.message
              : String(queryError),
          stack: queryError instanceof Error ? queryError.stack : undefined,
        }
      );

      throw createApiError(
        500,
        ErrorCode.QUERY_ERROR,
        "クエリ実行中にエラーが発生しました",
        [
          {
            issue:
              queryError instanceof Error
                ? queryError.message
                : String(queryError),
          },
        ],
        requestId
      );
    }
  },
};
