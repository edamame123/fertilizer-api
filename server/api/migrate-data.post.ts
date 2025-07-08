export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase()
    
    // まず簡単なテーブルで動作確認
    await db.prepare("CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)").run()
    
    // 作成されたテーブル一覧を確認
    const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    
    return {
      success: true,
      message: "Test table created",
      tables: tables.results || tables,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})