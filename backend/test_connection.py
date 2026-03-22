import oracledb
from connection import get_connection

def test_database_connection():
    """Test basic database connection and data retrieval"""
    try:
        print("🔌 Testing database connection...")
        conn = get_connection()
        cursor = conn.cursor()
        
        # Test basic connection
        print("✅ Database connected successfully!")
        
        # Check if we can query tables
        cursor.execute("SELECT COUNT(*) FROM user_tables")
        table_count = cursor.fetchone()[0]
        print(f"📋 Found {table_count} tables in your schema")
        
        # List all tables
        cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📋 Tables: {tables}")
        
        # Test Student table
        if 'STUDENT' in tables:
            cursor.execute("SELECT COUNT(*) FROM Student")
            student_count = cursor.fetchone()[0]
            print(f"👨‍🎓 Student count: {student_count}")
            
            if student_count > 0:
                cursor.execute("SELECT * FROM Student WHERE ROWNUM <= 3")
                sample_students = cursor.fetchall()
                print(f"📄 Sample students: {sample_students}")
        else:
            print("❌ Student table not found")
        
        # Test Hostel table
        if 'HOSTEL' in tables:
            cursor.execute("SELECT COUNT(*) FROM Hostel")
            hostel_count = cursor.fetchone()[0]
            print(f"🏢 Hostel count: {hostel_count}")
            
            if hostel_count > 0:
                cursor.execute("SELECT * FROM Hostel WHERE ROWNUM <= 3")
                sample_hostels = cursor.fetchall()
                print(f"📄 Sample hostels: {sample_hostels}")
        else:
            print("❌ Hostel table not found")
        
        cursor.close()
        conn.close()
        print("✅ Connection test completed successfully!")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("🔧 Check your connection.py credentials:")
        print("   - Oracle database is running")
        print("   - Username/password are correct")
        print("   - DSN/hostname is correct")

if __name__ == "__main__":
    test_database_connection()
