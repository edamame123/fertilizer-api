// server/api/public/fertilizers.ts
import { defineEventHandler, getQuery } from "h3";
import { getFertilizers } from "../services/fertilizerService";
import { formatPaginatedResponse } from "../../utils/responseFormatter";
import { validateQueryParams } from "../../utils/validation";
import { logger } from "../../utils/logger";
import type { QueryParams, FilterTag } from "~~/types/filters";
import { ErrorCode, createApiError } from "../../utils/errorHandler";

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId || "unknown";

  console.log("=== FERTILIZERS API ENDPOINT CALLED ===", requestId);
  
  try {
    const rawQuery = getQuery(event);
    console.log("Raw query:", rawQuery);

    logger.debug("Public Fertilizers API request", {
      requestId,
      path: event.path,
      method: event.method,
      query: rawQuery,
    });

    // typeFiltersパラメータの柔軟な処理
    let processedTypeFilters = undefined;

    if (rawQuery.typeFilters) {
      try {
        if (typeof rawQuery.typeFilters === "string") {
          // 文字列として送信された場合（JSON文字列として解析）
          if (rawQuery.typeFilters.startsWith("[")) {
            // 配列形式のJSON文字列
            processedTypeFilters = JSON.parse(rawQuery.typeFilters);
          } else if (rawQuery.typeFilters.startsWith("{")) {
            // オブジェクト形式のJSON文字列（現在の問題のケース）
            const parsedFilter = JSON.parse(rawQuery.typeFilters);
            processedTypeFilters = [parsedFilter]; // 配列に変換
          }
        } else if (Array.isArray(rawQuery.typeFilters)) {
          // 既に配列として送信された場合
          processedTypeFilters = rawQuery.typeFilters;
        }

        // 処理後のtypeFilters値をログ
        logger.debug("Processed typeFilters", {
          requestId,
          original: rawQuery.typeFilters,
          processed: processedTypeFilters,
          isArray: Array.isArray(processedTypeFilters),
        });
      } catch (parseError: unknown) {
        logger.warn("Failed to parse typeFilters", {
          requestId,
          typeFilters: rawQuery.typeFilters,
          error:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        });
        // バリデーションエラーを投げる（または、エラーを無視して処理を継続することも可能）
        throw createApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "タイプフィルターが無効です",
          [{ field: "typeFilters", issue: "Invalid format" }],
          requestId
        );
      }

      // クエリパラメータを更新（後続のバリデーションに備える）
      rawQuery.typeFilters = processedTypeFilters;
    }

    // 既存のバリデーション関数を使用
    const validatedQuery = validateQueryParams(rawQuery, requestId);

    // QueryParams型に合わせて変換
    const query: QueryParams = {
      ...validatedQuery,
      // showFormNameを明示的にstring型に変換
      showFormName: validatedQuery.showFormName?.toString() || "false",
      // 処理済みのtypeFiltersを設定（バリデーションでエラーがなければ）
      typeFilters: processedTypeFilters,
    };

    // サービス層のみを呼び出し（DB操作なし）
    console.log("=== CALLING getFertilizers ===", query);
    const result = await getFertilizers(query, event.context);
    console.log("=== getFertilizers RESULT ===", result?.total);

    // 既存のレスポンス形式を保持
    return formatPaginatedResponse(
      result.results,
      requestId,
      result.total,
      result.page,
      result.perPage
    );
  } catch (error: unknown) {
    // エラーハンドリング
    throw error;
  }
});
