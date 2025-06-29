// server/api/v1/fertilizers.ts
import { defineEventHandler, getQuery } from "h3";
import { getFertilizers } from "../services/fertilizerService";
import { formatPaginatedResponse } from "../../utils/responseFormatter";
import { validateQueryParams } from "../../utils/validation";
import { logger } from "../../utils/logger";
import type { QueryParams } from "~~/types/filters";
import type {
  PaginatedApiResponse,
  ExternalPaginatedApiResponse,
} from "~~/types/api";

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId || "unknown";

  try {
    logger.debug("API v1 Fertilizers request", {
      requestId,
      path: event.path,
      method: event.method,
      query: getQuery(event),
    });

    // パラメータの検証と変換
    const rawQuery = getQuery(event);
    const validatedQuery = validateQueryParams(rawQuery, requestId);

    // QueryParams型に合わせて変換
    const query: QueryParams = {
      ...validatedQuery,
      // showFormNameを明示的にstring型に変換
      showFormName: validatedQuery.showFormName?.toString() || "false",
    };

    // サービス層のみを呼び出し（DB操作なし）
    const result = await getFertilizers(query, event.context);

    // API v1のレスポンス形式
    const response = formatPaginatedResponse(
      result.results,
      requestId,
      result.total,
      result.page,
      result.perPage
    ) as ExternalPaginatedApiResponse<any>; // 拡張型にキャスト

    // API v1用のメタデータを追加
    response.meta = {
      ...response.meta,
      version: "1.0",
    };

    // 追加情報をレスポンスに含める
    response.apiInfo = {
      type: "external",
    };

    return response;
  } catch (error: unknown) {
    // エラーハンドリング
    throw error;
  }
});
