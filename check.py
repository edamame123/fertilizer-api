import sqlite3

def check_orphan_records():
    conn = sqlite3.connect(".data/hub/d1/miniflare-D1DatabaseObject/7b8799eb95f0bb5448e259812996a461ce40142dacbdea254ea597e307767f45.sqlite")
    cursor = conn.cursor()
    
    # 孤児レコードを検索
    cursor.execute("""
        SELECT DISTINCT f.category_id
        FROM t_fertilizers f
        LEFT JOIN m_category c ON f.category_id = c.id
        WHERE c.id IS NULL
        ORDER BY f.category_id
    """)
    orphan_categories = cursor.fetchall()
    print(f"存在しないcategory_id: {[row[0] for row in orphan_categories]}")
    
    # 件数確認
    cursor.execute("""
        SELECT COUNT(*)
        FROM t_fertilizers f
        LEFT JOIN m_category c ON f.category_id = c.id
        WHERE c.id IS NULL
    """)
    orphan_count = cursor.fetchone()[0]
    print(f"孤児レコード数: {orphan_count}")
    
    conn.close()

if __name__ == "__main__":
    check_orphan_records()