// server/api/services/componentService.ts
import { H3Event } from "h3";
import { validateComponents } from "~~/server/utils/validation";
import { ErrorCode, createApiError } from "~~/server/utils/errorHandler";
import { logger } from "~~/server/utils/logger";
import type {
  ComponentKey,
  ComponentFilter,
  ComponentFilters,
} from "~~/types/filters";

export default {
  /**
   * 指定された成分条件に基づいて製品を検索する
   * @param componentsStr 成分検索条件の文字列
   * @param event H3Event
   * @returns 条件に一致する製品の配列
   */
  async getProductsByComponents(
    componentsStr: string,
    event: H3Event
  ): Promise<any[]> {
    const requestId = event.context.requestId || "unknown";

    try {
      if (!componentsStr) {
        throw createApiError(
          400,
          ErrorCode.MISSING_PARAMETER,
          "componentsパラメータが必要です",
          [
            {
              field: "components",
              issue: "componentsパラメータを指定してください",
            },
          ],
          requestId
        );
      }

      // 新しいバリデーション関数を使用
      const components = validateComponents(componentsStr, requestId);

      // 必須コンポーネントのチェック（最小限のチェック、validateComponentsで詳細は検証済み）
      const required: ComponentKey[] = ["nitrogen", "phos", "k"];
      const hasRequiredComponents = required.every((key) => components?.[key]);

      if (!hasRequiredComponents) {
        throw createApiError(
          400,
          ErrorCode.INVALID_PARAMETER,
          "必須の成分パラメータが不足しています",
          [
            {
              field: "components",
              issue: "nitrogen, phos, kの各成分を指定してください",
            },
          ],
          requestId
        );
      }

      // NuxtHub統一
      const db = hubDatabase();

      // 成分値でのフィルタリングクエリを構築
      const query = `
          SELECT * FROM products 
          WHERE nitrogen BETWEEN ? AND ?
          AND phos BETWEEN ? AND ?
          AND k BETWEEN ? AND ?
        `;

      // componentsパラメータからmin/max値を取得
      const params = [
        components?.nitrogen?.min ?? 0,
        components?.nitrogen?.max ?? 100,
        components?.phos?.min ?? 0,
        components?.phos?.max ?? 100,
        components?.k?.min ?? 0,
        components?.k?.max ?? 100,
      ];

      logger.debug(
        "Executing components query",
        { requestId },
        { query, params }
      );

      const queryResult = await db
        .prepare(query)
        .bind(...params)
        .all();

      const results = (queryResult.results || queryResult) as unknown as any[];

      logger.debug(
        "Query results",
        { requestId },
        { count: results?.length || 0 }
      );

      return results;
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
