import oracledb

def get_connection():
    return oracledb.connect(
        user="hostel",
        password="hostel123",
        dsn="localhost:1521/XEPDB1"
    )