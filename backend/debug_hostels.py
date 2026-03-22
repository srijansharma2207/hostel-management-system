import oracledb
from connection import get_connection

def debug_hostel_count():
    """Debug the hostel count to understand the database structure"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        print("🔍 Debugging Hostel Count...\n")
        
        # Check all tables
        cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📋 All tables: {tables}\n")
        
        # Check if Hostel table exists
        if 'HOSTEL' in tables:
            cursor.execute("SELECT COUNT(*) FROM Hostel")
            hostel_count = cursor.fetchone()[0]
            print(f"🏢 Hostel table count: {hostel_count}")
            
            cursor.execute("SELECT * FROM Hostel WHERE ROWNUM <= 3")
            sample = cursor.fetchall()
            print(f"📄 Sample hostel data: {sample}\n")
        
        # Check Room table structure
        if 'ROOM' in tables:
            cursor.execute("SELECT column_name FROM user_tab_columns WHERE table_name = 'ROOM' ORDER BY column_id")
            columns = [row[0] for row in cursor.fetchall()]
            print(f"🏠 Room table columns: {columns}")
            
            # Try different hostel counting methods
            methods = [
                ("COUNT(DISTINCT block)", "SELECT COUNT(DISTINCT block) FROM Room WHERE block IS NOT NULL"),
                ("COUNT(DISTINCT hostel)", "SELECT COUNT(DISTINCT hostel) FROM Room WHERE hostel IS NOT NULL"),
                ("COUNT(DISTINCT hostel_id)", "SELECT COUNT(DISTINCT hostel_id) FROM Room WHERE hostel_id IS NOT NULL"),
                ("COUNT(DISTINCT building)", "SELECT COUNT(DISTINCT building) FROM Room WHERE building IS NOT NULL"),
            ]
            
            for method_name, query in methods:
                try:
                    cursor.execute(query)
                    count = cursor.fetchone()[0]
                    print(f"📊 {method_name}: {count}")
                except Exception as e:
                    print(f"❌ {method_name}: Error - {e}")
            
            # Show sample room data
            cursor.execute("SELECT * FROM Room WHERE ROWNUM <= 3")
            sample_rooms = cursor.fetchall()
            print(f"📄 Sample room data: {sample_rooms}\n")
        
        # Check Student table for hostel info
        if 'STUDENT' in tables:
            cursor.execute("SELECT column_name FROM user_tab_columns WHERE table_name = 'STUDENT' ORDER BY column_id")
            student_columns = [row[0] for row in cursor.fetchall()]
            print(f"👨‍🎓 Student table columns: {student_columns}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    debug_hostel_count()
