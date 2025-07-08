export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase()
    
    // テーブル一覧を取得
    const tablesResult = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    
    // t_fertilizersのカラム情報を取得
    let columnsResult = null
    try {
      columnsResult = await db.prepare("PRAGMA table_info(t_fertilizers)").all()
    } catch (e) {
      columnsResult = { error: e.message }
    }
    
    return {
      success: true,
      tables: tablesResult.results || tablesResult,
      fertilizersColumns: columnsResult.results || columnsResult,
      requestId: event.context.requestId || 'unknown'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      requestId: event.context.requestId || 'unknown'
    }
  }
})