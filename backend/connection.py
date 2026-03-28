import oracledb
import os

def get_connection():
    return oracledb.connect(
        user=os.getenv("ORACLE_USER", "hostel"),
        password=os.getenv("ORACLE_PASSWORD", "hostel123"),
        dsn=os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1"),
    )