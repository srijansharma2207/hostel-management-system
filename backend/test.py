import oracledb

conn = oracledb.connect(
    user="hostel",
    password="hostel123",
    dsn="localhost:1521/XEPDB1"
)

print("Connected successfully!")

conn.close()