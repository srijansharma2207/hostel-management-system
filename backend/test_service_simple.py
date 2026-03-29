import oracledb
from connection import get_connection
import json

def test_service_simple():
    """Simple test to get service requests with room and block info"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # First, let's see what's actually in the tables
        print("=== SERVICE_REQUEST table ===")
        cursor.execute("SELECT * FROM SERVICE_REQUEST WHERE ROWNUM <= 3")
        rows = cursor.fetchall()
        for row in rows:
            print(f"  {row}")
        
        print("\n=== ROOM table for student 240953654 ===")
        cursor.execute("""
            SELECT r.* FROM ROOM r
            JOIN ALLOCATION a ON r.ROOM_ID = a.ROOM_ID
            WHERE a.STUDENT_ID = 240953654 AND a.VACATE_DATE IS NULL
        """)
        rows = cursor.fetchall()
        for row in rows:
            print(f"  {row}")
            
        print("\n=== Direct join for service requests with room info ===")
        cursor.execute("""
            SELECT 
                sr.REQUEST_ID,
                sr.STUDENT_ID,
                sr.DESCRIPTION,
                sr.PRIORITY,
                sr.STATUS,
                r.ROOM_NUMBER as room_no,
                r.BLOCK as block_no,
                h.HOSTEL_NAME as block_name
            FROM SERVICE_REQUEST sr
            LEFT JOIN ALLOCATION a ON sr.STUDENT_ID = a.STUDENT_ID AND a.VACATE_DATE IS NULL
            LEFT JOIN ROOM r ON a.ROOM_ID = r.ROOM_ID
            LEFT JOIN HOSTEL h ON r.HOSTEL_ID = h.HOSTEL_ID
            WHERE sr.STUDENT_ID = 240953654
        """)
        rows = cursor.fetchall()
        for row in rows:
            print(f"  {row}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    test_service_simple()
