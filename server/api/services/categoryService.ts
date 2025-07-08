// server/api/services/categoryService.ts
import { H3Event } from "h3";
import { z } from "zod";
import { validateSimple } from "~~/server/utils/validation";
import { ErrorCode, createApiError } from "~~/server/utils/errorHandler";
import { logger } from "~~/server/utils/logger";

interface CategoryRecord {
  id: string;
  name: string;
  type_id: string;
}

export default {
  /**
   * 指定されたタイプIDに対応するカテゴリ一覧を取得する
   * @param typeId タイプID
   * @param event H3Event
   * @returns カテゴリレコードの配列
   */
  async getCategoriesByTypeId(
    typeId: string,
    event: H3Event
  ): Promise<CategoryRecord[]> {
    const requestId = event.context.requestId || "unknown";

    try {
      // D1バインディング直接使用
      const db = event.context.DB;

      const sqlQuery =
        "SELECT id, name, master_id AS type_id FROM m_category WHERE master_id = ? AND id IS NOT NULL";

      logger.debug(
        "Executing categories query",
        { requestId },
        { typeId, sqlQuery }
      );

      const queryResult = await db.prepare(sqlQuery).bind(typeId).all();
      const result = (queryResult.results ||
        queryResult) as unknown as CategoryRecord[];

      logger.debug(
        "Categories query result",
        { requestId },
        { count: result?.length || 0 }
      );

      return result;
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

  /**
   * カテゴリIDに基づいてカテゴリ情報を取得する
   * @param categoryId カテゴリID
   * @param event H3Event
   * @returns カテゴリレコード
   */
  async getCategoryById(
    categoryId: string,
    event: H3Event
  ): Promise<CategoryRecord> {
    const requestId = event.context.requestId || "unknown";

    try {
      // D1バインディング直接使用
      const db = event.context.DB;

      const sqlQuery =
        "SELECT id, name, master_id AS type_id FROM m_category WHERE id = ? AND id IS NOT NULL";

      logger.debug(
        "Executing category query by ID",
        { requestId },
        { categoryId, sqlQuery }
      );

      const result = (await db
        .prepare(sqlQuery)
        .bind(categoryId)
        .first()) as unknown as CategoryRecord;

      logger.debug("Category query result", { requestId }, { found: !!result });

      if (!result) {
        throw createApiError(
          404,
          ErrorCode.NOT_FOUND,
          "指定されたカテゴリが見つかりません",
          undefined,
          requestId
        );
      }

      return result;
    } catch (queryError: unknown) {
      if (
        queryError &&
        typeof queryError === "object" &&
        "statusCode" in queryError
      ) {
        throw queryError;
      }

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
