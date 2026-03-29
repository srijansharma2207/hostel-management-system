import oracledb
from connection import get_connection

def test_simple_query():
    """Test simple queries to understand the data structure"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        print("=== Testing ROOM table ===")
        cursor.execute("SELECT * FROM ROOM WHERE ROWNUM <= 3")
        rows = cursor.fetchall()
        for row in rows:
            print(f"  {row}")
            
        print("\n=== Testing HOSTEL table ===")
        cursor.execute("SELECT * FROM HOSTEL WHERE ROWNUM <= 3")
        rows = cursor.fetchall()
        for row in rows:
            print(f"  {row}")
            
        print("\n=== Testing ALLOCATION for student 240953654 ===")
        cursor.execute("SELECT * FROM ALLOCATION WHERE STUDENT_ID = 240953654")
        rows = cursor.fetchall()
        for row in rows:
            print(f"  {row}")
            
        print("\n=== Testing SERVICE_REQUEST for student 240953654 ===")
        cursor.execute("SELECT * FROM SERVICE_REQUEST WHERE STUDENT_ID = 240953654")
        rows = cursor.fetchall()
        for row in rows:
            print(f"  {row}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    test_simple_query()
