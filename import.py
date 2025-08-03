import sqlite3
import subprocess
import os
import time

def full_import():
    # 1. ローカルDBからデータ読み取り
    local_conn = sqlite3.connect(".data/hub/d1/miniflare-D1DatabaseObject/7b8799eb95f0bb5448e259812996a461ce40142dacbdea254ea597e307767f45.sqlite")
    cursor = local_conn.cursor()
    
    # テーブル構造を確認
    cursor.execute("PRAGMA table_info(t_fertilizers)")
    columns_info = cursor.fetchall()
    column_count = len(columns_info)
    
    print(f"Table has {column_count} columns")
    
    # データを取得
    cursor.execute("SELECT * FROM t_fertilizers")
    rows = cursor.fetchall()
    print(f"Found {len(rows)} records to import")
    
    # 2. バッチ処理（全データ対応）
    batch_size = 500  # バッチサイズを500に設定
    total_batches = (len(rows) + batch_size - 1) // batch_size
    successful_batches = 0
    failed_batches = 0
    total_records_imported = 0
    
    print(f"Starting import of {len(rows)} records in {total_batches} batches...")
    
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        batch_num = i // batch_size + 1
        
        # SQLファイル作成
        filename = f"batch_{batch_num:04d}.sql"
        records_in_batch = 0
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                for row in batch:
                    # 全ての列に対して値を処理
                    if len(row) != column_count:
                        print(f"Skipping row with incorrect column count: expected {column_count}, got {len(row)}")
                        continue
                        
                    values = []
                    for val in row:
                        if val is None:
                            values.append("NULL")
                        elif isinstance(val, str):
                            # 危険な文字をエスケープ
                            escaped = val.replace("'", "''")
                            values.append(f"'{escaped}'")
                        elif isinstance(val, (int, float)):
                            values.append(str(val))
                        else:
                            # その他の型は文字列として扱う
                            escaped = str(val).replace("'", "''")
                            values.append(f"'{escaped}'")
                    
                    if len(values) == column_count:
                        values_str = ','.join(values)
                        f.write(f"INSERT INTO t_fertilizers VALUES({values_str});\n")
                        records_in_batch += 1
                    else:
                        print(f"Skipping row with value count mismatch: {len(values)}")
                        
        except Exception as e:
            print(f"Error creating SQL file {filename}: {e}")
            failed_batches += 1
            continue
        
        # Wranglerで直接インポート
        print(f"Importing {filename} (batch {batch_num}/{total_batches}) - {records_in_batch} records...")
        
        try:
            cmd = [
                "powershell", "-Command", 
                f"npx wrangler d1 execute fertilizer-api --remote --file {filename}"
            ]
            
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                timeout=600,  # タイムアウトを10分に延長
                cwd=os.getcwd(),
                encoding='utf-8',
                errors='replace'
            )
            
            if result.returncode == 0:
                successful_batches += 1
                total_records_imported += records_in_batch
                print(f"✓ Batch {batch_num} successful ({records_in_batch} records)")
                os.remove(filename)  # 成功したファイルは削除
            else:
                failed_batches += 1
                print(f"✗ Batch {batch_num} failed:")
                if result.stdout:
                    print(f"STDOUT: {result.stdout}")
                if result.stderr:
                    print(f"STDERR: {result.stderr}")
                print(f"Failed SQL file saved as: {filename}")
                
        except subprocess.TimeoutExpired:
            failed_batches += 1
            print(f"✗ Batch {batch_num} timed out (over 10 minutes)")
        except Exception as e:
            failed_batches += 1
            print(f"✗ Batch {batch_num} error: {e}")
        
        # プログレス表示
        progress = (batch_num / total_batches) * 100
        print(f"Progress: {progress:.1f}% ({batch_num}/{total_batches})")
        
        # API制限を回避するため少し待機
        time.sleep(3)
    
    local_conn.close()
    
    print(f"\n" + "="*50)
    print(f"Import completed!")
    print(f"Total records to import: {len(rows)}")
    print(f"Successful batches: {successful_batches}/{total_batches}")
    print(f"Failed batches: {failed_batches}")
    print(f"Total records imported: {total_records_imported}")
    print(f"Success rate: {(successful_batches/total_batches)*100:.1f}%")
    
    if failed_batches > 0:
        print(f"\nFailed SQL files are saved for manual retry.")
        print("You can manually run: npx wrangler d1 execute fertilizer-api --remote --file batch_XXXX.sql")

if __name__ == "__main__":
    print("Starting full import of all records...")
    print("This may take a while depending on your data size.")
    
    response = input("Continue? (y/N): ")
    if response.lower() == 'y':
        start_time = time.time()
        full_import()
        end_time = time.time()
        print(f"\nTotal execution time: {end_time - start_time:.2f} seconds")
    else:
        print("Import cancelled.")