// server/api/debug.get.ts
export default defineEventHandler(async (event) => {
  try {
    const context = event.context;

    // 安全なプロパティチェック関数
    const safeCheck = (fn: () => any, fallback: any = "error") => {
      try {
        return fn();
      } catch {
        return fallback;
      }
    };

    // 安全な型チェック
    const getType = (value: any): string => {
      try {
        return typeof value;
      } catch {
        return "unknown";
      }
    };

    return {
      environment: {
        nodeEnv: process.env.NODE_ENV || "undefined",
        isDev: process.env.NODE_ENV === "development",
      },

      context: {
        hasCloudflareDB: safeCheck(() => !!context.cloudflare?.env?.DB, false),
        hasContextDB: safeCheck(() => !!context.DB, false),
        contextKeys: safeCheck(() => Object.keys(context), []),
      },

      d1Database: {
        contextDB: safeCheck(() => {
          const db = context.DB || context.cloudflare?.env?.DB;
          return db ? "D1 binding available" : "D1 binding not found";
        }, "D1 binding check failed"),
        dbType: getType(context.DB || context.cloudflare?.env?.DB),
      },

      imports: {
        betterSqlite3Available: safeCheck(() => {
          // 動的インポートのテスト（実際にはインポートしない）
          return "import test not performed";
        }),
      },
    };
  } catch (outerError: unknown) {
    return {
      error: "Debug endpoint failed",
      message:
        outerError instanceof Error ? outerError.message : "Unknown error",
    };
  }
});
