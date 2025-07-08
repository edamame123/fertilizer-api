export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase()
    
    // 既存テーブルを削除
    await db.prepare("DROP TABLE IF EXISTS t_fertilizers").run()
    await db.prepare("DROP TABLE IF EXISTS m_category").run() 
    await db.prepare("DROP TABLE IF EXISTS m_type").run()
    
    // 正しいスキーマでテーブル作成
    await db.prepare(`
      CREATE TABLE m_type (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        description TEXT
      )
    `).run()
    
    await db.prepare(`
      CREATE TABLE m_category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        master_id INTEGER,
        FOREIGN KEY (master_id) REFERENCES m_type(id)
      )
    `).run()
    
    await db.prepare(`
      CREATE TABLE t_fertilizers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level INTEGER,
        reg_no TEXT,
        reg_date DATE,
        company TEXT,
        prod_name TEXT,
        form_name TEXT,
        url TEXT,
        region TEXT,
        shape TEXT,
        fertilization TEXT,
        organic TEXT,
        effect TEXT,
        crop TEXT,
        nitrogen REAL,
        phos REAL,
        k REAL,
        ca REAL,
        mg REAL,
        alk REAL,
        si REAL,
        mn REAL,
        b REAL,
        fe REAL,
        cu REAL,
        zn REAL,
        mo REAL,
        n_total REAL,
        n_nh4 REAL,
        n_nh4_in REAL,
        n_no3 REAL,
        n_no3_in REAL,
        n_no3_in1 REAL,
        p_total REAL,
        p_cit REAL,
        p_cit_in REAL,
        p_sol REAL,
        p_sol_in REAL,
        p_wat REAL,
        p_wat_in REAL,
        k_total REAL,
        k_cit REAL,
        k_cit_in REAL,
        k_wat REAL,
        k_wat_in REAL,
        si_sol REAL,
        si_wat REAL,
        mg_sol REAL,
        mg_cit REAL,
        mg_cit_in REAL,
        mg_wat REAL,
        mg_wat_in REAL,
        mn_sol REAL,
        mn_cit REAL,
        mn_cit_in REAL,
        mn_wat REAL,
        mn_wat_in REAL,
        b_cit REAL,
        b_wat REAL,
        b_wat_in REAL,
        lime_total REAL,
        lime_sol REAL,
        lime_cit REAL,
        lime_wat REAL,
        s_total REAL,
        s_sol REAL,
        address TEXT,
        category_id INTEGER,
        exp_type TEXT,
        FOREIGN KEY (category_id) REFERENCES m_category(id)
      )
    `).run()
    
    return {
      success: true,
      message: "Database cleared and recreated with correct schema",
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})