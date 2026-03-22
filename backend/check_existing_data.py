import oracledb
from connection import get_connection

def check_existing_tables():
    """Check what tables and data already exist in the database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Check all tables
        cursor.execute("""
            SELECT table_name FROM user_tables
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        print("📋 Existing Tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Check if Student table exists and show its structure
        if any('STUDENT' in table[0].upper() for table in tables):
            print("\n🏗️  Student Table Structure:")
            cursor.execute("""
                SELECT column_name, data_type, nullable
                FROM user_tab_columns 
                WHERE table_name = 'STUDENT'
                ORDER BY column_id
            """)
            
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'Y' else 'NOT NULL'}")
            
            # Show sample data
            print("\n📊 Sample Data (first 5 rows):")
            cursor.execute("""
                SELECT * FROM Student
                WHERE ROWNUM <= 5
            """)
            
            rows = cursor.fetchall()
            if rows:
                for row in rows:
                    print(f"  {row}")
                print(f"\n📈 Total Students: {count_students(cursor)}")
            else:
                print("  No data found")
        else:
            print("\n❌ Student table not found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cursor.close()
        conn.close()

def count_students(cursor):
    """Count total students"""
    cursor.execute("SELECT COUNT(*) FROM Student")
    return cursor.fetchone()[0]

if __name__ == "__main__":
    check_existing_tables()
