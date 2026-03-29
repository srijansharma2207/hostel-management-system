import oracledb
from connection import get_connection

def debug_service_requests():
    """Debug service requests and see actual data structure"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Check tables
        cursor.execute("SELECT table_name FROM user_tables WHERE table_name LIKE '%SERVICE%' OR table_name LIKE '%REQUEST%'")
        tables = cursor.fetchall()
        print("📋 Service/Request Tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Check SERVICE_REQUEST table structure
        if any('SERVICE_REQUEST' in table[0] for table in tables):
            print("\n🏗️  SERVICE_REQUEST Table Structure:")
            cursor.execute("""
                SELECT column_name, data_type, nullable
                FROM user_tab_columns 
                WHERE table_name = 'SERVICE_REQUEST'
                ORDER BY column_id
            """)
            
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'Y' else 'NOT NULL'}")
            
            # Show sample data
            print("\n📊 SERVICE_REQUEST Sample Data:")
            cursor.execute("SELECT * FROM SERVICE_REQUEST WHERE ROWNUM <= 3")
            rows = cursor.fetchall()
            for row in rows:
                print(f"  {row}")
        
        # Check ALLOCATION table structure
        cursor.execute("SELECT table_name FROM user_tables WHERE table_name LIKE '%ALLOC%'")
        alloc_tables = cursor.fetchall()
        if any('ALLOCATION' in table[0] for table in alloc_tables):
            print("\n🏗️  ALLOCATION Table Structure:")
            cursor.execute("""
                SELECT column_name, data_type, nullable
                FROM user_tab_columns 
                WHERE table_name = 'ALLOCATION'
                ORDER BY column_id
            """)
            
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'Y' else 'NOT NULL'}")
            
            # Show sample data for student 240953654
            print("\n📊 ALLOCATION Data for student 240953654:")
            cursor.execute("""
                SELECT * FROM ALLOCATION 
                WHERE STUDENT_ID = 240953654
                ORDER BY ALLOCATION_DATE DESC
            """)
            rows = cursor.fetchall()
            for row in rows:
                print(f"  {row}")
        
        # Check ROOM table structure
        cursor.execute("SELECT table_name FROM user_tables WHERE table_name = 'ROOM'")
        room_tables = cursor.fetchall()
        if room_tables:
            print("\n🏗️  ROOM Table Structure:")
            cursor.execute("""
                SELECT column_name, data_type, nullable
                FROM user_tab_columns 
                WHERE table_name = 'ROOM'
                ORDER BY column_id
            """)
            
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'Y' else 'NOT NULL'}")
            
            # Show sample data
            print("\n📊 ROOM Sample Data:")
            cursor.execute("SELECT * FROM ROOM WHERE ROWNUM <= 5")
            rows = cursor.fetchall()
            for row in rows:
                print(f"  {row}")
        
        # Check HOSTEL table structure
        cursor.execute("SELECT table_name FROM user_tables WHERE table_name = 'HOSTEL'")
        hostel_tables = cursor.fetchall()
        if hostel_tables:
            print("\n🏗️  HOSTEL Table Structure:")
            cursor.execute("""
                SELECT column_name, data_type, nullable
                FROM user_tab_columns 
                WHERE table_name = 'HOSTEL'
                ORDER BY column_id
            """)
            
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'Y' else 'NOT NULL'}")
            
            # Show sample data
            print("\n📊 HOSTEL Sample Data:")
            cursor.execute("SELECT * FROM HOSTEL WHERE ROWNUM <= 5")
            rows = cursor.fetchall()
            for row in rows:
                print(f"  {row}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    debug_service_requests()
