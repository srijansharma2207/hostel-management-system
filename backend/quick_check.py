import oracledb
from connection import get_connection

try:
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
    tables = [row[0] for row in cursor.fetchall()]
    
    print("Tables found:", tables)
    
    # If Student table exists, show data
    if 'STUDENT' in tables:
        cursor.execute("SELECT COUNT(*) FROM Student")
        count = cursor.fetchone()[0]
        print(f"Student count: {count}")
        
        if count > 0:
            cursor.execute("SELECT student_id, first_name, last_name, branch, year FROM Student WHERE ROWNUM <= 3")
            sample = cursor.fetchall()
            print("Sample data:", sample)
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
