import oracledb
import json
from connection import get_connection

def export_all_to_json():
    """Export all tables to a single JSON file for inspection"""
    conn = get_connection()
    cursor = conn.cursor()
    
    result = {}
    
    try:
        # Get all tables
        cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Found tables: {tables}")
        
        for table in tables:
            try:
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                
                # Get column names
                cursor.execute(f"""
                    SELECT column_name 
                    FROM user_tab_columns 
                    WHERE table_name = :t 
                    ORDER BY column_id
                """, {"t": table})
                columns = [row[0] for row in cursor.fetchall()]
                
                result[table] = {
                    "count": len(rows),
                    "columns": columns,
                    "sample_rows": rows[:5]  # First 5 rows
                }
                
                print(f"✅ {table}: {len(rows)} rows")
                
            except Exception as e:
                print(f"❌ Error exporting {table}: {e}")
                result[table] = {"error": str(e)}
        
        # Write to JSON file
        with open("db_export.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, default=str)
        
        print("\n📄 Export saved to: db_export.json")
        print(f"📊 Total tables exported: {len(tables)}")
        
    except Exception as e:
        print(f"❌ Export failed: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    export_all_to_json()
