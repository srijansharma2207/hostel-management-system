import oracledb
from connection import get_connection

def setup_database():
    """Create Student table and insert sample data"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Create Student table
        cursor.execute("""
            CREATE TABLE Student (
                student_id VARCHAR2(20) PRIMARY KEY,
                first_name VARCHAR2(50) NOT NULL,
                last_name VARCHAR2(50) NOT NULL,
                email VARCHAR2(100) UNIQUE,
                phone VARCHAR2(20),
                branch VARCHAR2(50) NOT NULL,
                year NUMBER(1) NOT NULL,
                room_number VARCHAR2(10),
                block VARCHAR2(10),
                status VARCHAR2(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert sample data
        sample_students = [
            ('STU2024001', 'Arjun', 'Sharma', 'arjun.sharma@hostel.edu', '+91 98765 43210', 'B.Tech CSE', 1, 'A101', 'A', 'Active'),
            ('STU2024002', 'Priya', 'Patel', 'priya.patel@hostel.edu', '+91 98765 43211', 'B.Tech ECE', 2, 'B205', 'B', 'Active'),
            ('STU2024003', 'Rahul', 'Kumar', 'rahul.kumar@hostel.edu', '+91 98765 43212', 'B.Tech ME', 3, 'C302', 'C', 'Active'),
            ('STU2024004', 'Ananya', 'Gupta', 'ananya.gupta@hostel.edu', '+91 98765 43213', 'B.Tech IT', 1, 'A102', 'A', 'Active'),
            ('STU2024005', 'Vikram', 'Singh', 'vikram.singh@hostel.edu', '+91 98765 43214', 'B.Tech CSE', 4, 'D401', 'D', 'Active'),
            ('STU2024006', 'Kavya', 'Reddy', 'kavya.reddy@hostel.edu', '+91 98765 43215', 'B.Tech EEE', 2, 'B206', 'B', 'Active'),
            ('STU2024007', 'Amit', 'Verma', 'amit.verma@hostel.edu', '+91 98765 43216', 'B.Tech CSE', 3, 'C303', 'C', 'Active'),
            ('STU2024008', 'Sneha', 'Mishra', 'sneha.mishra@hostel.edu', '+91 98765 43217', 'B.Tech IT', 2, 'A103', 'A', 'Active'),
            ('STU2024009', 'Rohit', 'Jain', 'rohit.jain@hostel.edu', '+91 98765 43218', 'B.Tech ME', 1, 'D402', 'D', 'Active'),
            ('STU2024010', 'Divya', 'Nair', 'divya.nair@hostel.edu', '+91 98765 43219', 'B.Tech ECE', 4, 'B207', 'B', 'Active')
        ]
        
        for student in sample_students:
            cursor.execute("""
                INSERT INTO Student (student_id, first_name, last_name, email, phone, branch, year, room_number, block, status)
                VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)
            """, student)
        
        conn.commit()
        print("✅ Database setup completed successfully!")
        print(f"✅ Inserted {len(sample_students)} sample students")
        
    except Exception as e:
        if "ORA-00955" in str(e):
            print("⚠️  Table already exists. Skipping creation.")
        else:
            print(f"❌ Error: {e}")
            conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    setup_database()
