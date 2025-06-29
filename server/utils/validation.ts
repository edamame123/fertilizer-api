// server/utils/validation.ts
import { z } from "zod"; // スキーマバリデーションライブラリ
import type {
  ComponentKey,
  ComponentFilter,
  ComponentFilters,
  FilterParams,
  QueryParams,
  FilterTag,
} from "~~/types/filters";

import { ErrorCode, createApiError } from "./errorHandler";
import { logger } from "./logger";

// 基本的な数値範囲型
export const numberRangeSchema = (min: number = 0, max: number = 100) =>
  z.number().min(min).max(max);

// 日付検証スキーマ
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "日付形式はYYYY-MM-DDで指定してください",
});

// ComponentFilterスキーマ（オリジナルの型定義に合わせる）
export const componentFilterSchema = z
  .object({
    min: z.number().min(0).max(100),
    max: z.number().min(0).max(100),
    includeEmpty: z.boolean(),
  })
  .refine((data) => data.min <= data.max, {
    message: "最小値は最大値以下である必要があります",
    path: ["range"],
  });

// ComponentFiltersスキーマ（オリジナルの型定義に合わせる）
export const componentsSchema = z
  .object({
    nitrogen: componentFilterSchema.optional(),
    phos: componentFilterSchema.optional(),
    k: componentFilterSchema.optional(),
  })
  .catchall(z.union([componentFilterSchema, z.undefined()]));

// FilterTagスキーマ
export const filterTagSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: z.string(),
});

// FilterParamsスキーマ
export const filterParamsSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  reg_no: z.string().optional(),
  reg_date_from: dateSchema.optional(),
  reg_date_to: dateSchema.optional(),
  level: z.string().optional(),
  shape: z.string().optional(),
  effect: z.string().optional(),
  selectedTypeId: z.union([z.string(), z.null()]).optional(),
  typeFilters: z.array(filterTagSchema).optional(),
  components: componentsSchema.optional(),
});

// QueryParamsスキーマ（FilterParamsを拡張）
// queryParamsSchema の修正部分
export const queryParamsSchema = filterParamsSchema.extend({
  // page と perPage を文字列型も受け付けるように修正
  page: z
    .union([
      z.number().int().positive(),
      z.string().transform((val, ctx) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || parsed <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "ページ番号は正の整数である必要があります",
          });
          return z.NEVER;
        }
        return parsed;
      }),
    ])
    .optional()
    .default(1),
  perPage: z
    .union([
      z.number().refine((n) => [10, 20, 50, 100].includes(n), {
        message: "perPageは10, 20, 50, 100のいずれかである必要があります",
      }),
      z.string().transform((val, ctx) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || ![10, 20, 50, 100].includes(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "perPageは10, 20, 50, 100のいずれかである必要があります",
          });
          return z.NEVER;
        }
        return parsed;
      }),
    ])
    .optional()
    .default(10),
  showFormName: z.union([z.string(), z.boolean()]).optional(),
  sortBy: z.string().optional().default("id"),
  sortOrder: z.enum(["asc", "desc", "ASC", "DESC"]).optional().default("desc"),
});

// 日付範囲検証（開始日 <= 終了日）
export const dateRangeRefinement = (data: any) => {
  if (data.reg_date_from && data.reg_date_to) {
    return new Date(data.reg_date_from) <= new Date(data.reg_date_to);
  }
  return true;
};

// コンポーネント検証のためのユーティリティ関数
export function validateComponents(
  componentsStr: string | undefined,
  requestId: string
) {
  if (!componentsStr) return undefined;

  logger.debug(`コンポーネントバリデーション開始`, {
    requestId,
    componentsLength: componentsStr.length,
  });

  try {
    const parsed = JSON.parse(componentsStr);
    const result = componentsSchema.safeParse(parsed);

    if (!result.success) {
      const issues = result.error.errors.map((err) => ({
        field: `components.${err.path.join(".")}`,
        issue: err.message,
      }));

      logger.warn(
        `成分パラメータバリデーションエラー`,
        {
          requestId,
        },
        {
          issues,
        }
      );

      throw createApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "成分パラメータが無効です",
        issues,
        requestId
      );
    }

    logger.debug(
      `コンポーネントバリデーション成功`,
      {
        requestId,
      },
      {
        componentCount: Object.keys(result.data || {}).length,
      }
    );

    return result.data;
  } catch (e) {
    if (e && typeof e === "object" && "statusCode" in e) {
      // すでに処理済みのエラーはそのまま再スロー
      throw e;
    }

    // JSON解析エラーなどの場合
    logger.warn(
      `コンポーネントパラメータの解析に失敗`,
      {
        requestId,
      },
      {
        error: e instanceof Error ? e.message : String(e),
      }
    );

    throw createApiError(
      400,
      ErrorCode.BAD_REQUEST,
      "componentsパラメータの形式が不正です",
      [{ field: "components", issue: "有効なJSON形式で指定してください" }],
      requestId
    );
  }
}

// タイプフィルター検証のためのユーティリティ関数
// タイプフィルター検証のためのユーティリティ関数の修正
export function validateTypeFilters(
  typeFiltersStr: string | undefined,
  requestId: string
) {
  if (!typeFiltersStr) return [];

  logger.debug(`タイプフィルターバリデーション開始`, {
    requestId,
    filtersLength: typeFiltersStr.length,
  });

  try {
    // 文字列をパース
    const parsed = JSON.parse(typeFiltersStr);

    // 単一オブジェクトの場合は配列に変換
    const dataToValidate = Array.isArray(parsed) ? parsed : [parsed];

    // 配列として検証
    const result = z.array(filterTagSchema).safeParse(dataToValidate);

    if (!result.success) {
      const issues = result.error.errors.map((err) => ({
        field: `typeFilters${
          err.path.length > 0 ? "." + err.path.join(".") : ""
        }`,
        issue: err.message,
      }));

      logger.warn(
        `タイプフィルターバリデーションエラー`,
        {
          requestId,
        },
        {
          issues,
        }
      );

      throw createApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "タイプフィルターが無効です",
        issues,
        requestId
      );
    }

    logger.debug(
      `タイプフィルターバリデーション成功`,
      {
        requestId,
      },
      {
        filterCount: result.data.length,
        originalWasArray: Array.isArray(parsed),
      }
    );

    return result.data;
  } catch (e) {
    if (e && typeof e === "object" && "statusCode" in e) {
      throw e;
    }

    logger.warn(
      `タイプフィルターパラメータの解析に失敗`,
      {
        requestId,
      },
      {
        error: e instanceof Error ? e.message : String(e),
        input: typeFiltersStr,
      }
    );

    throw createApiError(
      400,
      ErrorCode.BAD_REQUEST,
      "typeFiltersパラメータの形式が不正です",
      [{ field: "typeFilters", issue: "有効なJSON形式で指定してください" }],
      requestId
    );
  }
}

// クエリパラメータ全体の検証
export function validateQueryParams(query: any, requestId: string) {
  logger.debug(
    `クエリパラメータのバリデーション開始`,
    {
      requestId,
    },
    {
      query,
    }
  );

  // まず基本パラメータを検証
  const basicResult = queryParamsSchema
    .omit({ components: true, typeFilters: true })
    .refine(dateRangeRefinement, {
      message: "開始日は終了日より前の日付を指定してください",
      path: ["reg_date_range"],
    })
    .safeParse(query);

  if (!basicResult.success) {
    const issues = basicResult.error.errors.map((err) => ({
      field: err.path.join("."),
      issue: err.message,
    }));

    logger.warn(
      `基本クエリパラメータのバリデーションエラー`,
      {
        requestId,
      },
      {
        issues,
      }
    );

    throw createApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "クエリパラメータが無効です",
      issues,
      requestId
    );
  }

  // JSON形式のパラメータを個別に検証
  const validatedComponents = validateComponents(
    query.components as string | undefined,
    requestId
  );
  const validatedTypeFilters = validateTypeFilters(
    query.typeFilters as string | undefined,
    requestId
  );

  // 検証済みのすべてのパラメータを結合
  const validatedParams = {
    ...basicResult.data,
    components: validatedComponents,
    typeFilters: validatedTypeFilters,
  };

  logger.debug(
    `クエリパラメータのバリデーション完了`,
    {
      requestId,
    },
    {
      page: validatedParams.page,
      perPage: validatedParams.perPage,
      hasComponents: !!validatedParams.components,
      typeFiltersCount: validatedParams.typeFilters?.length || 0,
    }
  );

  return validatedParams;
}

// 簡易バリデーション関数 - 単純なスキーマと値に対して使用
export function validateSimple<T>(
  schema: z.ZodType<T>,
  data: unknown,
  errorCode: ErrorCode,
  errorMessage: string,
  requestId: string
) {
  logger.debug(`シンプルバリデーション開始`, {
    requestId,
    errorCode,
  });

  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.errors.map((err) => ({
      field: err.path.join("."),
      issue: err.message,
    }));

    logger.warn(
      `シンプルバリデーションエラー`,
      {
        requestId,
        errorCode,
      },
      {
        issues,
      }
    );

    throw createApiError(400, errorCode, errorMessage, issues, requestId);
  }

  logger.debug(`シンプルバリデーション成功`, {
    requestId,
    errorCode,
  });

  return result.data;
}
