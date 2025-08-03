import sqlite3

def convert_category_ids():
    conn = sqlite3.connect(".data/hub/d1/miniflare-D1DatabaseObject/7b8799eb95f0bb5448e259812996a461ce40142dacbdea254ea597e307767f45.sqlite")
    cursor = conn.cursor()
    
    # m_categoryから名前→IDのマッピング作成
    cursor.execute("SELECT id, name FROM m_category")
    category_map = {name: id for id, name in cursor.fetchall()}
    
    # t_fertilizersの文字列category_idを数値に変換
    cursor.execute("SELECT rowid, category_id FROM t_fertilizers WHERE typeof(category_id) = 'text'")
    text_categories = cursor.fetchall()
    print(f"文字列category_idのレコード数: {len(text_categories)}")
    
    converted_count = 0
    for rowid, category_name in text_categories:
        if category_name in category_map:
            new_id = category_map[category_name]
            cursor.execute("UPDATE t_fertilizers SET category_id = ? WHERE rowid = ?", (new_id, rowid))
            converted_count += 1
    
    conn.commit()
    print(f"変換完了: {converted_count}件")
    conn.close()

if __name__ == "__main__":
    convert_category_ids()