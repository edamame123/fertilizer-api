// server/api/services/fertilizerService.ts
import type { Fertilizer } from "~~/types/fertilizer";
import type {
  ComponentFilters,
  QueryParams,
  ApiResponseData,
} from "~~/types/filters";
import { logger } from "~~/server/utils/logger";
import {
  createApiError,
  ErrorCode,
  ErrorMessages,
} from "~~/server/utils/errorHandler";
import { getTypeCategories } from "~~/server/utils/cache";

/**
 * 肥料データを検索・取得する共通サービス関数
 * @param params クエリパラメータ
 * @param context リクエストコンテキスト
 * @returns 検索結果と総件数、ページ情報
 */
export async function getFertilizers(params: QueryParams, context: any) {
  const requestId = context.requestId || "unknown";

  console.log("=== getFertilizers FUNCTION START ===", requestId);
  console.log("Received params:", params);

  try {
    logger.debug(
      "Fertilizer service: processing request",
      {
        requestId,
        params: JSON.stringify(params),
      },
      {
        dbAvailable: !!context.DB,
      }
    );

    // 検証済みのパラメータを使用
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // クエリパラメータの処理
    const page = params.page || 1;
    const perPage = params.perPage || 10;
    const showFormName = params.showFormName === "true";

    const nameFilter = params.name;
    const companyFilter = params.company;
    const regNoFilter = params.reg_no;
    const regDateFrom = params.reg_date_from;
    const regDateTo = params.reg_date_to;

    // デバッグ: 日付パラメータの値を確認
    logger.info("Date parameters received", {
      requestId,
      regDateFrom: regDateFrom,
      regDateTo: regDateTo,
      regDateFromType: typeof regDateFrom,
      regDateToType: typeof regDateTo,
      regDateFromTruthy: !!regDateFrom,
      regDateToTruthy: !!regDateTo,
    });
    const levelFilter = params.level || "1,2";
    const shapeFilter = params.shape || null;
    const effectFilter = params.effect || null;
    const selectedTypeId = params.selectedTypeId;
    const typeFilters = params.typeFilters || [];

    const offset = (page - 1) * perPage;

    // 成分フィルタの処理
    if (params.components) {
      const componentKeys: Array<keyof ComponentFilters> = [
        "nitrogen",
        "phos",
        "k",
      ];

      for (const key of componentKeys) {
        const filter = params.components[key];
        if (filter) {
          if (typeof filter.min === "number") {
            whereConditions.push(`${key} >= ?`);
            queryParams.push(filter.min);
          }

          if (typeof filter.max === "number") {
            whereConditions.push(`${key} <= ?`);
            queryParams.push(filter.max);
          }

          if (!filter.includeEmpty) {
            if (filter.min === 0) {
              whereConditions.push(`${key} IS NOT NULL`);
            } else {
              whereConditions.push(`(${key} IS NOT NULL AND ${key} > 0)`);
            }
          }
        }
      }
    }

    // レベルフィルタの処理
    if (levelFilter) {
      const levels = levelFilter.split(",").map(Number);
      if (levels.length > 0) {
        const placeholders = levels.map(() => "?").join(",");
        whereConditions.push(`level IN (${placeholders})`);
        queryParams.push(...levels);
      }
    }

    // その他のフィルタ処理
    if (regNoFilter) {
      whereConditions.push("reg_no LIKE ?");
      queryParams.push(`%${regNoFilter}%`);
    }

    if (regDateFrom) {
      const formattedDateFrom = new Date(regDateFrom).toISOString().split("T")[0];
      whereConditions.push("date(reg_date) >= date(?)");
      queryParams.push(formattedDateFrom);
      logger.info("Registration date from filter added", {
        requestId,
        original: regDateFrom,
        formatted: formattedDateFrom,
        condition: "date(reg_date) >= date(?)"
      });
    }

    if (regDateTo) {
      const formattedDateTo = new Date(regDateTo).toISOString().split("T")[0];
      whereConditions.push("date(reg_date) <= date(?)");
      queryParams.push(formattedDateTo);
      logger.debug("Registration date to filter added", {
        requestId,
        original: regDateTo,
        formatted: formattedDateTo,
        condition: "date(reg_date) <= date(?)"
      });
    }

    if (nameFilter) {
      whereConditions.push("(prod_name LIKE ? OR form_name LIKE ?)");
      queryParams.push(`%${nameFilter}%`, `%${nameFilter}%`);
    }

    if (companyFilter) {
      whereConditions.push("company LIKE ?");
      queryParams.push(`%${companyFilter}%`);
    }

    if (shapeFilter !== null) {
      whereConditions.push("COALESCE(shape, '') = ?");
      queryParams.push(shapeFilter);
    }

    if (effectFilter !== null) {
      whereConditions.push("effect = ?");
      queryParams.push(effectFilter);
    }

    // タイプとカテゴリのフィルタリング処理
    let joinClause = "";

    // カテゴリフィルターの処理
    if (typeFilters.length > 0) {
      const categoryIds = typeFilters.map((filter) => filter.id.split("-")[1]);
      const placeholders = categoryIds.map(() => "?").join(",");
      whereConditions.push(`t_fertilizers.category_id IN (${placeholders})`);
      queryParams.push(...categoryIds);
      joinClause = "";
    }
    // タイプIDによるフィルタリング
    else if (selectedTypeId && selectedTypeId !== "null") {
      const categoryIds = await getTypeCategories(
        { context: context },
        selectedTypeId
      );

      if (categoryIds.length > 0) {
        const placeholders = categoryIds.map(() => "?").join(",");
        whereConditions.push(`t_fertilizers.category_id IN (${placeholders})`);
        queryParams.push(...categoryIds);
      } else {
        whereConditions.push("1 = 0");
      }

      joinClause = "";
    }

    // ソート条件の処理
    const sortField = params.sortBy || "id";
    const sortOrder = (params.sortOrder || "desc").toUpperCase();
    const orderClause = `ORDER BY ${sortField} ${sortOrder}`;

    // WHERE句の構築
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // NuxtHub統一
    const db = hubDatabase();

    // クエリの実行
    let results: Fertilizer[], total: number;
    try {
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM t_fertilizers 
        ${joinClause}
        ${whereClause}
      `;

      const countResult = (await db
        .prepare(countQuery)
        .bind(...queryParams)
        .first()) as unknown as { count: number };
      total = countResult.count;

      const dataQuery = `
        SELECT t_fertilizers.* 
        FROM t_fertilizers 
        ${joinClause}
        ${whereClause} 
        ${orderClause} 
        LIMIT ? OFFSET ?
      `;

      logger.debug("Executing SQL query", {
        requestId,
        query: dataQuery,
        params: queryParams,
        limit: perPage,
        offset: offset,
        whereConditions: whereConditions,
      });

      const queryResult = await db
        .prepare(dataQuery)
        .bind(...queryParams, perPage, offset)
        .all();

      results = (queryResult.results || queryResult) as unknown as Fertilizer[];
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

    return {
      results,
      total,
      page,
      perPage,
    };
  } catch (error: unknown) {
    logger.error(
      "Error in fertilizer service",
      {
        requestId,
        params: JSON.stringify(params),
      },
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    );

    throw error;
  }
}

/**
 * 特定の肥料データを取得する
 */
export async function getFertilizerById(
  id: string,
  context: any
): Promise<Fertilizer> {
  const requestId = context.requestId || "unknown";

  try {
    if (!id || isNaN(Number(id))) {
      throw createApiError(
        400,
        ErrorCode.INVALID_PARAMETER,
        "無効な肥料IDです",
        [{ field: "id", issue: "有効な数値IDを指定してください" }],
        requestId
      );
    }

    // NuxtHub統一
    const db = hubDatabase();

    const result = (await db
      .prepare("SELECT * FROM t_fertilizers WHERE id = ?")
      .bind(id)
      .first()) as unknown as Fertilizer;

    if (!result) {
      throw createApiError(
        404,
        ErrorCode.NOT_FOUND,
        `ID: ${id} の肥料データは見つかりませんでした`,
        [{ field: "id", issue: "指定されたIDのデータが存在しません" }],
        requestId
      );
    }

    return result;
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * 肥料データの統計情報を取得する
 */
export async function getFertilizerStats(context: any): Promise<any> {
  const requestId = context.requestId || "unknown";

  try {
    // NuxtHub統一
    const db = hubDatabase();

    const statsQuery = `
      SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT company) as company_count,
        MIN(reg_date) as earliest_reg_date,
        MAX(reg_date) as latest_reg_date,
        AVG(nitrogen) as avg_nitrogen,
        AVG(phos) as avg_phos,
        AVG(k) as avg_k
      FROM t_fertilizers
    `;

    const results = (await db.prepare(statsQuery).first()) as unknown as any;

    return results;
  } catch (error: unknown) {
    throw error;
  }
}
