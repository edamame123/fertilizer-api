// server/utils/logger.ts
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  query?: any;
  [key: string]: any;
}

// 環境設定によってログレベルを制御
const LOG_LEVEL = process.env.LOG_LEVEL || "INFO";
const LOG_LEVELS_PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// 現在の環境のログレベルより優先度が高いかチェック
function shouldLog(level: LogLevel): boolean {
  return (
    LOG_LEVELS_PRIORITY[level] >= LOG_LEVELS_PRIORITY[LOG_LEVEL as LogLevel]
  );
}

export function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  data?: any
) {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(context && { context }),
    ...(data && { data }),
  };

  // JSON形式でログ出力
  console.log(JSON.stringify(logEntry));
}

// 各ログレベルの専用関数
export const logger = {
  debug: (message: string, context?: LogContext, data?: any) =>
    log(LogLevel.DEBUG, message, context, data),
  info: (message: string, context?: LogContext, data?: any) =>
    log(LogLevel.INFO, message, context, data),
  warn: (message: string, context?: LogContext, data?: any) =>
    log(LogLevel.WARN, message, context, data),
  error: (message: string, context?: LogContext, data?: any) =>
    log(LogLevel.ERROR, message, context, data),
};
