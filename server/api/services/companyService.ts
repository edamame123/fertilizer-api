// server/api/services/companyService.ts
import { H3Event } from "h3";
import { ErrorCode, createApiError } from "~~/server/utils/errorHandler";
import { logger } from "~~/server/utils/logger";

interface CompanyRecord {
  company: string;
}

export default {
  /**
   * 会社一覧を取得する
   * @param event H3Event
   * @returns 会社名の配列
   */
  async getCompanies(event: H3Event) {
    const requestId = event.context.requestId || "unknown";

    try {
      // NuxtHub統一
      const db = hubDatabase();

      const query =
        "SELECT DISTINCT company FROM t_fertilizers WHERE company IS NOT NULL";

      logger.debug("Executing companies query", { requestId }, { query });

      const queryResult = await db.prepare(query).all();
      const result = (queryResult.results ||
        queryResult) as unknown as CompanyRecord[];

      logger.debug(
        "Companies query result",
        { requestId },
        { count: result?.length || 0 }
      );

      return result.map((r: CompanyRecord) => r.company);
    } catch (queryError: unknown) {
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
