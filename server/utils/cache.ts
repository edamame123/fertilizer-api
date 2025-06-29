// server/utils/cache.ts
import type { H3Event } from "h3";

interface TypeCategoryCache {
  [typeId: string]: string[]; // typeId -> array of categoryIds
}

// キャッシュの管理用オブジェクト
interface CacheManager {
  data: TypeCategoryCache;
  lastUpdated: number;
}

// グローバルキャッシュオブジェクト
let cacheManager: CacheManager = {
  data: {},
  lastUpdated: 0,
};

// キャッシュの有効期限（ミリ秒）- 例: 1時間
const CACHE_TTL = 60 * 60 * 1000;

// キャッシュが有効かチェック
export function isCacheValid(): boolean {
  const now = Date.now();
  return (
    cacheManager.lastUpdated > 0 && now - cacheManager.lastUpdated < CACHE_TTL
  );
}

// タイプIDに対応するカテゴリIDリストを取得
export function getCategoryIdsForType(typeId: string): string[] | null {
  if (!isCacheValid() || !cacheManager.data[typeId]) {
    return null;
  }
  return cacheManager.data[typeId];
}

// キャッシュを更新
export async function refreshTypeCategories(context: any): Promise<void> {
  const requestId = context.requestId || "unknown";

  try {
    // NuxtHub統一
    const db = hubDatabase();

    console.log(`[${requestId}] Refreshing type-category cache`);

    // 全てのタイプとそれに対応するカテゴリを取得
    const query =
      "SELECT master_id AS type_id, id AS category_id FROM m_category WHERE id IS NOT NULL";

    const queryResult = await db.prepare(query).all();
    const results = (queryResult.results || queryResult) as unknown as Array<{
      type_id: string;
      category_id: string;
    }>;

    // 新しいキャッシュデータを準備
    const newCache: TypeCategoryCache = {};

    // 結果をパース
    for (const row of results) {
      const typeId = row.type_id;
      const categoryId = row.category_id;

      if (!newCache[typeId]) {
        newCache[typeId] = [];
      }

      newCache[typeId].push(categoryId);
    }

    // グローバルキャッシュを更新
    cacheManager = {
      data: newCache,
      lastUpdated: Date.now(),
    };

    console.log(
      `[${requestId}] Type-category cache refreshed with ${
        Object.keys(newCache).length
      } types`
    );
  } catch (error: unknown) {
    console.error(
      `[${requestId}] Error refreshing type-category cache:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

// 指定されたタイプに対応するすべてのカテゴリIDを取得
export async function getTypeCategories(
  context: any,
  typeId: string
): Promise<string[]> {
  // キャッシュが有効でなければ更新
  if (!isCacheValid()) {
    await refreshTypeCategories(context);
  }

  // キャッシュからデータを取得
  const categoryIds = getCategoryIdsForType(typeId);
  if (categoryIds) {
    return categoryIds;
  }

  // キャッシュに該当タイプがない場合は空配列を返す
  return [];
}
