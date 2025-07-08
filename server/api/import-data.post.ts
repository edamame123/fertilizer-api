export default defineEventHandler(async (event) => {
  try {
    const db = hubDatabase()
    
    // まずm_typeのサンプルデータを投入
    const typeData = [
      { id: 1, category: '有機質系', description: '天然由来の有機物からなる肥料で、ゆっくり効果を発揮し土壌改良効果もあります。' },
      { id: 2, category: '窒素系', description: '植物の成長や葉の形成を促進し、特に生育初期に重要な肥料です。' },
      { id: 3, category: 'リン酸系', description: '主に植物の根の成長を促進し、リン酸肥料として利用されます。' },
      { id: 4, category: 'カリ系', description: '植物の光合成や糖の生成に寄与し、加里肥料として使われます。' },
      { id: 5, category: 'カルシウム系', description: '主に土壌の酸性化を抑える効果があり、アルカリ性の改良材として使用されます。' }
    ]
    
    // m_typeデータ投入
    for (const type of typeData) {
      await db.prepare(
        "INSERT INTO m_type (id, category, description) VALUES (?, ?, ?)"
      ).bind(type.id, type.category, type.description).run()
    }
    
    // m_categoryのサンプルデータを投入
    const categoryData = [
      { id: 1, name: '堆肥', master_id: 1 },
      { id: 2, name: '有機化成肥料', master_id: 1 },
      { id: 3, name: '尿素系肥料', master_id: 2 },
      { id: 4, name: '硫安系肥料', master_id: 2 },
      { id: 5, name: '過リン酸石灰', master_id: 3 }
    ]
    
    // m_categoryデータ投入
    for (const category of categoryData) {
      await db.prepare(
        "INSERT INTO m_category (id, name, master_id) VALUES (?, ?, ?)"
      ).bind(category.id, category.name, category.master_id).run()
    }
    
    // t_fertilizersのサンプルデータを投入
    const fertilizerData = [
      {
        id: 1,
        level: 1,
        reg_no: 'TEST001',
        company: 'テスト会社A',
        prod_name: 'テスト肥料1',
        form_name: '粒状',
        nitrogen: 10.0,
        phos: 5.0,
        k: 8.0,
        category_id: 1
      },
      {
        id: 2,
        level: 1,
        reg_no: 'TEST002',
        company: 'テスト会社B',
        prod_name: 'テスト肥料2',
        form_name: '液状',
        nitrogen: 15.0,
        phos: 8.0,
        k: 12.0,
        category_id: 2
      }
    ]
    
    // t_fertilizersデータ投入
    for (const fertilizer of fertilizerData) {
      await db.prepare(`
        INSERT INTO t_fertilizers (
          id, level, reg_no, company, prod_name, form_name, 
          nitrogen, phos, k, category_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        fertilizer.id, fertilizer.level, fertilizer.reg_no, 
        fertilizer.company, fertilizer.prod_name, fertilizer.form_name,
        fertilizer.nitrogen, fertilizer.phos, fertilizer.k, fertilizer.category_id
      ).run()
    }
    
    // データ件数を確認
    const typeCount = await db.prepare("SELECT COUNT(*) as count FROM m_type").first()
    const categoryCount = await db.prepare("SELECT COUNT(*) as count FROM m_category").first()
    const fertilizerCount = await db.prepare("SELECT COUNT(*) as count FROM t_fertilizers").first()
    
    return {
      success: true,
      message: "Sample data imported successfully",
      counts: {
        types: typeCount.count,
        categories: categoryCount.count,
        fertilizers: fertilizerCount.count
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})