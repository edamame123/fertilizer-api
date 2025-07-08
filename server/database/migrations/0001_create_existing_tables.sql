-- 既存のテーブル構造を認識させるためのマイグレーション

-- m_type テーブル
CREATE TABLE IF NOT EXISTS m_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL
);

-- m_category テーブル  
CREATE TABLE IF NOT EXISTS m_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    master_id INTEGER,
    FOREIGN KEY (master_id) REFERENCES m_type(id)
);

-- t_fertilizers テーブル（基本構造のみ）
CREATE TABLE IF NOT EXISTS t_fertilizers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT,
    company TEXT,
    brand_name TEXT,
    form_name TEXT,
    fertilizer_type TEXT,
    nitrogen REAL,
    phosphorus REAL,
    potassium REAL
    -- 他のカラムは必要に応じて追加
);