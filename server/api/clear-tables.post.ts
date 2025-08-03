export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase()
    
    // 既存テーブルを削除（データも含めて）
    await db.prepare("DROP TABLE IF EXISTS t_fertilizers").run()
    await db.prepare("DROP TABLE IF EXISTS m_category").run() 
    await db.prepare("DROP TABLE IF EXISTS m_type").run()
    
    return {
      success: true,
      message: "All tables cleared successfully",
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})