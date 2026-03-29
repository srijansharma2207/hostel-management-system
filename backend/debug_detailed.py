import oracledb
from connection import get_connection

def debug_detailed():
    """Debug the exact data structure and mappings"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        print("=== ROOM table columns ===")
        cursor.execute("""
            SELECT column_name, data_type 
            FROM user_tab_columns 
            WHERE table_name = 'ROOM'
            ORDER BY column_id
        """)
        for col in cursor.fetchall():
            print(f"  {col[0]} ({col[1]})")
            
        print("\n=== First 3 ROOM rows ===")
        cursor.execute("SELECT * FROM ROOM WHERE ROWNUM <= 3")
        for row in cursor.fetchall():
            print(f"  {row}")
            
        print("\n=== HOSTEL table columns ===")
        cursor.execute("""
            SELECT column_name, data_type 
            FROM user_tab_columns 
            WHERE table_name = 'HOSTEL'
            ORDER BY column_id
        """)
        for col in cursor.fetchall():
            print(f"  {col[0]} ({col[1]})")
            
        print("\n=== First 3 HOSTEL rows ===")
        cursor.execute("SELECT * FROM HOSTEL WHERE ROWNUM <= 3")
        for row in cursor.fetchall():
            print(f"  {row}")
            
        print("\n=== ALLOCATION for student 240953654 ===")
        cursor.execute("""
            SELECT * FROM ALLOCATION 
            WHERE STUDENT_ID = 240953654
            ORDER BY ALLOCATION_DATE DESC
        """)
        for row in cursor.fetchall():
            print(f"  {row}")
            
        print("\n=== SERVICE_REQUEST for student 240953654 ===")
        cursor.execute("""
            SELECT * FROM SERVICE_REQUEST 
            WHERE STUDENT_ID = 240953654
        """)
        for row in cursor.fetchall():
            print(f"  {row}")
            
        print("\n=== Manual join test ===")
        cursor.execute("""
            SELECT 
                s.STUDENT_ID,
                r.ROOM_NUMBER,
                r.HOSTEL_ID,
                h.HOSTEL_NAME,
                h.BLOCK_NAME
            FROM STUDENT s
            LEFT JOIN ALLOCATION a ON s.STUDENT_ID = a.STUDENT_ID
            LEFT JOIN ROOM r ON a.ROOM_ID = r.ROOM_ID
            LEFT JOIN HOSTEL h ON r.HOSTEL_ID = h.HOSTEL_ID
            WHERE s.STUDENT_ID = 240953654
            AND a.VACATE_DATE IS NULL
        """)
        for row in cursor.fetchall():
            print(f"  {row}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    debug_detailed()
