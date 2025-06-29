// server/utils/errorHandler.ts
import { H3Error } from "h3";
import { logger, LogLevel } from "./logger";

// エラーコードの定義
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  QUERY_ERROR = "QUERY_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  BAD_REQUEST = "BAD_REQUEST",
  // 追加するコード
  MISSING_PARAMETER = "MISSING_PARAMETER",
  PARAMETER_FORMAT = "PARAMETER_FORMAT",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  INVALID_PARAMETER = "INVALID_PARAMETER",
}

// エラーメッセージの定義
export const ErrorMessages = {
  [ErrorCode.VALIDATION_ERROR]: "リクエストパラメータが無効です",
  [ErrorCode.DATABASE_ERROR]: "データベース接続エラーが発生しました",
  [ErrorCode.QUERY_ERROR]: "クエリ実行中にエラーが発生しました",
  [ErrorCode.NOT_FOUND]: "リクエストされたリソースが見つかりません",
  [ErrorCode.UNAUTHORIZED]: "認証が必要です",
  [ErrorCode.FORBIDDEN]: "このリソースへのアクセス権がありません",
  [ErrorCode.INTERNAL_ERROR]: "サーバー内部エラーが発生しました",
  [ErrorCode.SERVICE_UNAVAILABLE]: "サービスが一時的に利用できません",
  [ErrorCode.BAD_REQUEST]: "リクエスト形式が不正です",
  [ErrorCode.MISSING_PARAMETER]: "必須パラメータが不足しています",
  [ErrorCode.PARAMETER_FORMAT]: "パラメータ形式が不正です",
  [ErrorCode.RESOURCE_NOT_FOUND]: "リクエストされたリソースが見つかりません",
};

// APIエラー詳細情報の型定義
export interface ApiErrorDetail {
  field?: string;
  issue: string;
  suggestedValue?: any;
}

/**
 * APIエラーログを記録する関数
 *
 * @param error エラーオブジェクト
 * @param context ログコンテキスト情報
 */
export function logApiError(
  error: unknown,
  context: {
    requestId: string;
    path: string;
    method: string;
    query: any;
  }
) {
  const errorObj = error as any;

  // APIエラーの場合（H3Error形式）
  if (errorObj && errorObj.statusCode) {
    // エラーデータの取得を試みる
    const errorData = errorObj.data?.error || {};

    logger.error(
      `API Error: ${errorData.code || "UNKNOWN"} - ${
        errorData.message || "No message"
      }`,
      {
        ...context,
        statusCode: errorObj.statusCode,
      },
      {
        code: errorData.code,
        message: errorData.message,
        details: errorData.details,
        stack: errorObj.stack,
      }
    );
  } else if (error instanceof Error) {
    // 標準Errorオブジェクトの場合
    logger.error(`Unhandled Error: ${error.message}`, context, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // その他のエラータイプ
    logger.error(`Unknown Error Type`, context, {
      error: typeof error === "object" ? JSON.stringify(error) : String(error),
    });
  }
}

/**
 * 構造化されたAPIエラーを作成する関数
 *
 * @param statusCode HTTPステータスコード
 * @param code エラーコード
 * @param message エラーメッセージ
 * @param details エラー詳細情報
 * @param requestId リクエストID
 * @returns H3Error オブジェクト
 */
export function createApiError(
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: ApiErrorDetail[],
  requestId?: string
): H3Error {
  const timestamp = new Date().toISOString();

  // H3Errorオブジェクトの作成
  const error = createError({
    statusCode,
    data: {
      error: {
        code,
        message,
        details,
        requestId,
        timestamp,
      },
    },
  });

  // エラー作成時にログ記録
  logger.error(
    `API Error Created: ${code}`,
    {
      requestId,
      statusCode,
      path: getRequestPath(),
    },
    {
      errorCode: code,
      message,
      details,
      stack: new Error().stack?.split("\n").slice(1).join("\n"), // 現在のスタックから最初の行を除外
    }
  );

  return error;
}

/**
 * 現在のリクエストパスを取得（可能な場合）
 * グローバルコンテキスト外でも動作するようフォールバック付き
 */
function getRequestPath(): string {
  try {
    // これは関数が適切なコンテキスト内で呼び出された場合のみ機能
    const event = useEvent();
    return event?.path || "unknown_path";
  } catch (e) {
    return "unknown_path";
  }
}

/**
 * 開発環境でのみエラーの詳細情報を表示（本番環境では一般的なメッセージを表示）
 *
 * @param error エラーオブジェクト
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns 環境に応じたエラーメッセージ
 */
export function getSafeErrorMessage(
  error: any,
  defaultMessage: string = "エラーが発生しました"
): string {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev && error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return defaultMessage;
}

/**
 * エラーの重大度を判断する関数
 *
 * @param statusCode HTTPステータスコード
 * @returns ログレベル
 */
export function getLogLevelForStatusCode(statusCode: number): LogLevel {
  if (statusCode >= 500) {
    return LogLevel.ERROR;
  } else if (statusCode >= 400) {
    return LogLevel.WARN;
  }
  return LogLevel.INFO;
}
