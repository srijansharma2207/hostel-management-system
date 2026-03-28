from flask import Flask, jsonify, request
from flask_cors import CORS
from connection import get_connection
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

def _table_exists(cursor, table_name: str) -> bool:
    cursor.execute(
        "SELECT COUNT(*) FROM user_tables WHERE table_name = :t",
        {"t": table_name.upper()},
    )
    return cursor.fetchone()[0] > 0


def _get_columns(cursor, table_name: str) -> set:
    cursor.execute(
        """
        SELECT column_name
        FROM user_tab_columns
        WHERE table_name = :t
        """,
        {"t": table_name.upper()},
    )
    return {r[0].upper() for r in cursor.fetchall()}


# Home route
@app.route("/")
def home():
    return "Backend running!"


# Get students
@app.route("/students")
def get_students():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        student_cols = _get_columns(cursor, "STUDENT")

        sid_col = "STUDENT_ID" if "STUDENT_ID" in student_cols else ("ID" if "ID" in student_cols else None)
        fn_col = "FIRST_NAME" if "FIRST_NAME" in student_cols else None
        ln_col = "LAST_NAME" if "LAST_NAME" in student_cols else None
        branch_col = "BRANCH" if "BRANCH" in student_cols else None
        year_col = "YEAR" if "YEAR" in student_cols else None

        select_cols = [c for c in [sid_col, fn_col, ln_col, branch_col, year_col] if c is not None]
        cursor.execute(f"SELECT {', '.join(select_cols)} FROM Student")
        rows = cursor.fetchall()

        room_by_student = {}
        hostel_by_student = {}
        hostel_id_by_student = {}

        if _table_exists(cursor, "ALLOCATION") and _table_exists(cursor, "ROOM"):
            alloc_cols = _get_columns(cursor, "ALLOCATION")
            room_cols = _get_columns(cursor, "ROOM")

            alloc_student_col = "STUDENT_ID" if "STUDENT_ID" in alloc_cols else None
            alloc_room_col = "ROOM_ID" if "ROOM_ID" in alloc_cols else None
            room_id_col = "ROOM_ID" if "ROOM_ID" in room_cols else ("ID" if "ID" in room_cols else None)

            # Prefer HOSTEL_ID, else try other common columns used as a block/hostel number.
            block_no_col = None
            for c in ["HOSTEL_ID", "BLOCK", "HOSTEL", "BUILDING"]:
                if c in room_cols:
                    block_no_col = c
                    break

            hostel_id_col = "HOSTEL_ID" if "HOSTEL_ID" in room_cols else None

            room_label_col = None
            for c in ["ROOM_NUMBER", "ROOM_NO", "ROOM_NUM", "ROOM"]:
                if c in room_cols:
                    room_label_col = c
                    break

            if alloc_student_col and alloc_room_col and room_id_col:
                cursor.execute(f"SELECT {alloc_student_col}, {alloc_room_col} FROM Allocation")
                alloc_rows = cursor.fetchall()
                student_to_roomid = {r[0]: r[1] for r in alloc_rows if r[0] is not None and r[1] is not None}

                cursor.execute(
                    f"SELECT {room_id_col}"
                    + (f", {room_label_col}" if room_label_col else "")
                    + (f", {hostel_id_col}" if hostel_id_col else "")
                    + (f", {block_no_col}" if block_no_col and block_no_col != hostel_id_col else "")
                    + " FROM Room"
                )
                room_rows = cursor.fetchall()
                roomid_to_roomlabel = {}
                roomid_to_hostelid = {}
                roomid_to_blockno = {}
                for rr in room_rows:
                    rid = rr[0]
                    idx = 1
                    if room_label_col:
                        roomid_to_roomlabel[rid] = rr[idx]
                        idx += 1
                    if hostel_id_col:
                        roomid_to_hostelid[rid] = rr[idx]
                        idx += 1
                    if block_no_col and block_no_col != hostel_id_col:
                        roomid_to_blockno[rid] = rr[idx]

                hostelid_to_label = {}
                if _table_exists(cursor, "HOSTEL") and hostel_id_col:
                    hostel_cols = _get_columns(cursor, "HOSTEL")
                    hid_col = "HOSTEL_ID" if "HOSTEL_ID" in hostel_cols else ("ID" if "ID" in hostel_cols else None)
                    hlabel_col = None
                    for c in ["HOSTEL_NAME", "NAME", "HOSTEL_NO", "HOSTEL_NUMBER", "HOSTEL"]:
                        if c in hostel_cols:
                            hlabel_col = c
                            break
                    if hid_col and hlabel_col:
                        cursor.execute(f"SELECT {hid_col}, {hlabel_col} FROM Hostel")
                        hostelid_to_label = {h[0]: h[1] for h in cursor.fetchall()}

                for st_id, room_id in student_to_roomid.items():
                    if room_id in roomid_to_roomlabel:
                        room_by_student[st_id] = roomid_to_roomlabel[room_id]
                    if room_id in roomid_to_hostelid:
                        hostel_id_by_student[st_id] = roomid_to_hostelid[room_id]
                        if roomid_to_hostelid[room_id] in hostelid_to_label:
                            hostel_by_student[st_id] = hostelid_to_label[roomid_to_hostelid[room_id]]
                    elif room_id in roomid_to_blockno:
                        hostel_id_by_student[st_id] = roomid_to_blockno[room_id]

        data = []
        for r in rows:
            # Map row indices based on select_cols order
            row_map = dict(zip(select_cols, r))
            stud_key = row_map.get(sid_col)

            full_name = ""
            if fn_col and ln_col:
                full_name = f"{row_map.get(fn_col, '')} {row_map.get(ln_col, '')}".strip()
            elif fn_col:
                full_name = str(row_map.get(fn_col, ""))

            data.append({
                "id": stud_key,
                "name": full_name,
                "branch": row_map.get(branch_col),
                "year": row_map.get(year_col),
                "room": room_by_student.get(stud_key, "—"),
                "block": hostel_by_student.get(stud_key, "—"),
                "block_no": hostel_id_by_student.get(stud_key, None),
            })

        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# Simple test endpoint
@app.route("/test")
def test():
    return {"message": "Backend is working!", "timestamp": str(datetime.now())}


@app.route("/db-info")
def db_info():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT USER FROM dual")
        db_user = cursor.fetchone()[0]
        cursor.execute("SELECT SYS_CONTEXT('USERENV','CURRENT_SCHEMA') FROM dual")
        current_schema = cursor.fetchone()[0]
        return jsonify({"user": db_user, "current_schema": current_schema})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/db-instance")
def db_instance():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Works in common XE setups; if privileges are limited, fall back to USERENV contexts.
        info = {}
        try:
            cursor.execute(
                """
                SELECT
                    SYS_CONTEXT('USERENV','DB_NAME') AS db_name,
                    SYS_CONTEXT('USERENV','CON_NAME') AS con_name,
                    SYS_CONTEXT('USERENV','SERVICE_NAME') AS service_name,
                    SYS_CONTEXT('USERENV','SERVER_HOST') AS server_host,
                    SYS_CONTEXT('USERENV','INSTANCE_NAME') AS instance_name
                FROM dual
                """
            )
            r = cursor.fetchone()
            info.update(
                {
                    "db_name": r[0],
                    "con_name": r[1],
                    "service_name": r[2],
                    "server_host": r[3],
                    "instance_name": r[4],
                }
            )
        except Exception as e:
            info["contexts_error"] = str(e)

        try:
            cursor.execute("SELECT GLOBAL_NAME FROM GLOBAL_NAME")
            info["global_name"] = cursor.fetchone()[0]
        except Exception as e:
            info["global_name_error"] = str(e)

        try:
            cursor.execute(
                """
                SELECT
                    name,
                    db_unique_name
                FROM v$database
                """
            )
            r = cursor.fetchone()
            info["v_database_name"] = r[0]
            info["db_unique_name"] = r[1]
        except Exception as e:
            info["v_database_error"] = str(e)

        return jsonify(info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/oracle-env")
def oracle_env():
    return jsonify(
        {
            "ORACLE_USER": os.getenv("ORACLE_USER"),
            "ORACLE_DSN": os.getenv("ORACLE_DSN"),
        }
    )


# Debug endpoint to see hostel count
@app.route("/debug-hostels")
def debug_hostels():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        result = {}

        # Check all tables
        cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
        result['tables'] = [row[0] for row in cursor.fetchall()]

        # Check if Hostel table exists
        if 'HOSTEL' in result['tables']:
            cursor.execute("SELECT COUNT(*) FROM Hostel")
            result['hostel_table_count'] = cursor.fetchone()[0]
        else:
            result['hostel_table_count'] = 0

        # Check Room table
        if 'ROOM' in result['tables']:
            cursor.execute("SELECT COUNT(*) FROM Room")
            result['total_rooms'] = cursor.fetchone()[0]

            # Try different hostel counting methods
            methods = [
                ("distinct_block", "SELECT COUNT(DISTINCT block) FROM Room WHERE block IS NOT NULL"),
                ("distinct_hostel", "SELECT COUNT(DISTINCT hostel) FROM Room WHERE hostel IS NOT NULL"),
                ("distinct_hostel_id", "SELECT COUNT(DISTINCT hostel_id) FROM Room WHERE hostel_id IS NOT NULL"),
                ("distinct_building", "SELECT COUNT(DISTINCT building) FROM Room WHERE building IS NOT NULL"),
            ]

            for method_name, query in methods:
                try:
                    cursor.execute(query)
                    result[method_name] = cursor.fetchone()[0]
                except:
                    result[method_name] = 0
        else:
            result['room_table_exists'] = False

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        conn.close()


# Get dashboard stats
@app.route("/dashboard-stats")
def get_dashboard_stats():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Get total students
        cursor.execute("SELECT COUNT(*) FROM Student")
        total_students = cursor.fetchone()[0]

        total_hostels = 0
        occupied_rooms = 0
        total_rooms = 0
        total_beds = 0
        allocated_beds = 0
        students_allocated = 0

        if _table_exists(cursor, "HOSTEL"):
            cursor.execute("SELECT COUNT(*) FROM Hostel")
            total_hostels = cursor.fetchone()[0]

        if _table_exists(cursor, "ALLOCATION"):
            cursor.execute("SELECT COUNT(*) FROM Allocation")
            students_allocated = cursor.fetchone()[0]

        if _table_exists(cursor, "ROOM"):
            cursor.execute("SELECT COUNT(*) FROM Room")
            total_rooms = cursor.fetchone()[0]

            room_cols = _get_columns(cursor, "ROOM")

            # Capacity-based stats (beds)
            if "CAPACITY" in room_cols:
                cursor.execute("SELECT NVL(SUM(capacity), 0) FROM Room")
                total_beds = cursor.fetchone()[0]

                if "OCCUPIED" in room_cols:
                    # Capacity allocated = sum of occupied beds
                    cursor.execute("SELECT NVL(SUM(occupied), 0) FROM Room")
                    allocated_beds = cursor.fetchone()[0]
                elif "STUDENT_ID" in room_cols:
                    cursor.execute("SELECT NVL(SUM(capacity), 0) FROM Room WHERE student_id IS NOT NULL")
                    allocated_beds = cursor.fetchone()[0]

            if "OCCUPIED" in room_cols:
                # Rooms allocated = rooms where occupied > 0
                cursor.execute("SELECT COUNT(*) FROM Room WHERE NVL(occupied, 0) > 0")
                occupied_rooms = cursor.fetchone()[0]
            elif "STUDENT_ID" in room_cols:
                cursor.execute("SELECT COUNT(*) FROM Room WHERE student_id IS NOT NULL")
                occupied_rooms = cursor.fetchone()[0]
            elif _table_exists(cursor, "ALLOCATION"):
                alloc_cols = _get_columns(cursor, "ALLOCATION")

                if "ROOM_ID" in alloc_cols:
                    cursor.execute("SELECT COUNT(DISTINCT room_id) FROM Allocation")
                    occupied_rooms = cursor.fetchone()[0]
                else:
                    cursor.execute("SELECT COUNT(*) FROM Allocation")
                    occupied_rooms = cursor.fetchone()[0]

        if total_hostels == 0 and _table_exists(cursor, "ROOM"):
            room_cols = _get_columns(cursor, "ROOM")
            if "HOSTEL_ID" in room_cols:
                cursor.execute("SELECT COUNT(DISTINCT hostel_id) FROM Room WHERE hostel_id IS NOT NULL")
                total_hostels = cursor.fetchone()[0]

        rooms_allocated_percentage = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
        beds_allocated_percentage = (allocated_beds / total_beds * 100) if total_beds > 0 else 0

        return jsonify({
            "total_students": total_students,
            "total_hostels": total_hostels,
            "total_rooms": total_rooms,
            "occupied_rooms": occupied_rooms,
            "total_beds": int(total_beds) if total_beds is not None else 0,
            "allocated_beds": int(allocated_beds) if allocated_beds is not None else 0,
            "students_allocated": int(students_allocated) if students_allocated is not None else 0,
            "rooms_allocated_percentage": round(rooms_allocated_percentage, 1),
            "beds_allocated_percentage": round(beds_allocated_percentage, 1)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Add new student
@app.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        student_cols = _get_columns(cursor, "STUDENT")

        insert_cols = []
        values = []

        # Optional numeric primary key
        if "ID" in student_cols:
            try:
                cursor.execute("SELECT NVL(MAX(id), 0) + 1 FROM Student")
                next_id = cursor.fetchone()[0]
                insert_cols.append("id")
                values.append(next_id)
            except:
                pass

        col_map = {
            "STUDENT_ID": "student_id",
            "FIRST_NAME": "first_name",
            "LAST_NAME": "last_name",
            "PHONE": "phone",
            "BRANCH": "branch",
            "YEAR": "year",
            "GENDER": "gender",
        }

        for db_col, json_key in col_map.items():
            if db_col in student_cols and data.get(json_key) is not None:
                insert_cols.append(db_col.lower())
                values.append(data.get(json_key))

        if not insert_cols:
            return jsonify({"error": "No valid student fields provided for insert."}), 400

        placeholders = ", ".join([f":{i+1}" for i in range(len(values))])
        cursor.execute(
            f"INSERT INTO Student ({', '.join(insert_cols)}) VALUES ({placeholders})",
            tuple(values),
        )

        conn.commit()
        return jsonify({"message": "Student added successfully!"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()

# Get hostels
@app.route("/hostels")
def get_hostels():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if not _table_exists(cursor, "HOSTEL"):
            return jsonify([])
        
        hostel_cols = _get_columns(cursor, "HOSTEL")
        cols_to_select = []
        for col in ["HOSTEL_ID", "BLOCK_NAME", "HOSTEL_NAME", "NAME", "HOSTEL_NO", "HOSTEL_NUMBER", "CODE", "TYPE", "GENDER", "TOTAL_BLOCKS", "TOTAL_ROOMS", "WARDEN_NAME"]:
            if col in hostel_cols:
                cols_to_select.append(col)
        
        cursor.execute(f"SELECT {', '.join(cols_to_select)} FROM Hostel")
        rows = cursor.fetchall()
        
        data = []
        for row in rows:
            item = {}
            for i, col in enumerate(cols_to_select):
                item[col.lower()] = row[i]
            data.append(item)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/allocations")
def get_allocations():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if not _table_exists(cursor, "ALLOCATION"):
            return jsonify([])

        alloc_cols = _get_columns(cursor, "ALLOCATION")
        student_cols = _get_columns(cursor, "STUDENT") if _table_exists(cursor, "STUDENT") else set()
        room_cols = _get_columns(cursor, "ROOM") if _table_exists(cursor, "ROOM") else set()
        hostel_cols = _get_columns(cursor, "HOSTEL") if _table_exists(cursor, "HOSTEL") else set()

        alloc_id_col = "ALLOCATION_ID" if "ALLOCATION_ID" in alloc_cols else ("ID" if "ID" in alloc_cols else None)
        alloc_student_col = "STUDENT_ID" if "STUDENT_ID" in alloc_cols else None
        alloc_room_col = "ROOM_ID" if "ROOM_ID" in alloc_cols else None

        alloc_date_col = None
        for c in ["ALLOCATION_DATE", "ALLOCATED_ON", "ALLOCATION", "ALLOCATIO"]:
            if c in alloc_cols:
                alloc_date_col = c
                break

        vacate_date_col = None
        for c in ["VACATE_DATE", "VACATE_ON", "VACATE_DA"]:
            if c in alloc_cols:
                vacate_date_col = c
                break

        select_cols = [c for c in [alloc_id_col, alloc_student_col, alloc_room_col, alloc_date_col, vacate_date_col] if c]
        if not alloc_student_col or not alloc_room_col:
            return jsonify([])

        cursor.execute(f"SELECT {', '.join(select_cols)} FROM ALLOCATION")
        alloc_rows = cursor.fetchall()

        # Student lookup
        sid_col = "STUDENT_ID" if "STUDENT_ID" in student_cols else ("ID" if "ID" in student_cols else None)
        fn_col = "FIRST_NAME" if "FIRST_NAME" in student_cols else None
        ln_col = "LAST_NAME" if "LAST_NAME" in student_cols else None
        name_col = "NAME" if "NAME" in student_cols else None

        students_by_id = {}
        if sid_col:
            stud_select_cols = [c for c in [sid_col, fn_col, ln_col, name_col] if c]
            if stud_select_cols:
                cursor.execute(f"SELECT {', '.join(stud_select_cols)} FROM STUDENT")
                for row in cursor.fetchall():
                    row_map = dict(zip(stud_select_cols, row))
                    sid = row_map.get(sid_col)
                    full_name = ""
                    if name_col and row_map.get(name_col):
                        full_name = str(row_map.get(name_col))
                    elif fn_col and ln_col:
                        full_name = f"{row_map.get(fn_col, '')} {row_map.get(ln_col, '')}".strip()
                    elif fn_col:
                        full_name = str(row_map.get(fn_col, ""))
                    students_by_id[sid] = full_name

        # Room lookup
        room_id_col = "ROOM_ID" if "ROOM_ID" in room_cols else ("ID" if "ID" in room_cols else None)
        hostel_id_col = "HOSTEL_ID" if "HOSTEL_ID" in room_cols else None
        room_label_col = None
        for c in ["ROOM_NUMBER", "ROOM_NO", "ROOM_NUM", "ROOM"]:
            if c in room_cols:
                room_label_col = c
                break

        room_by_id = {}
        hostel_id_by_room_id = {}
        if room_id_col:
            r_select = [room_id_col]
            if room_label_col:
                r_select.append(room_label_col)
            if hostel_id_col:
                r_select.append(hostel_id_col)
            cursor.execute(f"SELECT {', '.join(r_select)} FROM ROOM")
            for rr in cursor.fetchall():
                rid = rr[0]
                idx = 1
                if room_label_col:
                    room_by_id[rid] = rr[idx]
                    idx += 1
                if hostel_id_col:
                    hostel_id_by_room_id[rid] = rr[idx]

        # Hostel lookup
        hostel_by_id = {}
        hid_col = "HOSTEL_ID" if "HOSTEL_ID" in hostel_cols else ("ID" if "ID" in hostel_cols else None)
        hlabel_col = None
        for c in ["BLOCK_NAME", "HOSTEL_NAME", "NAME", "HOSTEL_NO", "HOSTEL_NUMBER", "HOSTEL"]:
            if c in hostel_cols:
                hlabel_col = c
                break
        if hid_col and hlabel_col:
            cursor.execute(f"SELECT {hid_col}, {hlabel_col} FROM HOSTEL")
            hostel_by_id = {r[0]: r[1] for r in cursor.fetchall()}

        data = []
        for row in alloc_rows:
            row_map = dict(zip(select_cols, row))
            student_id = row_map.get(alloc_student_col)
            room_id = row_map.get(alloc_room_col)
            hostel_id = hostel_id_by_room_id.get(room_id)

            data.append({
                "allocation_id": row_map.get(alloc_id_col) if alloc_id_col else None,
                "student_id": student_id,
                "room_id": room_id,
                "allocation_date": row_map.get(alloc_date_col) if alloc_date_col else None,
                "vacate_date": row_map.get(vacate_date_col) if vacate_date_col else None,
                "student_name": students_by_id.get(student_id, "—"),
                "room_no": room_by_id.get(room_id, "—"),
                "hostel_id": hostel_id,
                "hostel": hostel_by_id.get(hostel_id, "—") if hostel_id is not None else "—",
            })

        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# Get rooms
@app.route("/rooms")
def get_rooms():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if not _table_exists(cursor, "ROOM"):
            return jsonify([])
        
        room_cols = _get_columns(cursor, "ROOM")
        cols_to_select = []
        for col in [
            "ROOM_ID",
            "ROOM_NUMBER",
            "ROOM_NO",
            "ROOM_NUM",
            "ROOM",
            "HOSTEL_ID",
            "HOSTEL",
            "BLOCK",
            "FLOOR",
            "ROOM_TYPE",
            "TYPE",
            "AC_TYPE",
            "AC",
            "CAPACITY",
            "OCCUPIED",
            "FEE",
            "STATUS",
            "STUDENT_ID",
        ]:
            if col in room_cols:
                cols_to_select.append(col)
        
        cursor.execute(f"SELECT {', '.join(cols_to_select)} FROM Room")
        rows = cursor.fetchall()
        
        data = []
        for row in rows:
            item = {}
            for i, col in enumerate(cols_to_select):
                item[col.lower()] = row[i]
            data.append(item)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# Get waiting list
@app.route("/waiting-list")
def get_waiting_list():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Prefer WAITING_APPLICATION (your DB has 500 rows here), fall back to WAITING_LIST.
        if _table_exists(cursor, "WAITING_APPLICATION"):
            wa_cols = _get_columns(cursor, "WAITING_APPLICATION")

            cols_to_select = []
            for col in ["WAITING_ID", "STUDENT_ID", "COURSE", "HOSTEL_PREFERENCE", "ROOM_PREFERENCE", "APPLIED_ON"]:
                if col in wa_cols:
                    cols_to_select.append(col)

            order_col = "APPLIED_ON" if "APPLIED_ON" in wa_cols else ("WAITING_ID" if "WAITING_ID" in wa_cols else None)
            order_sql = f" ORDER BY {order_col} DESC" if order_col else ""

            cursor.execute(f"SELECT {', '.join(cols_to_select)} FROM Waiting_Application{order_sql}")
            rows = cursor.fetchall()

            data = []
            for row in rows:
                row_map = dict(zip(cols_to_select, row))
                data.append(
                    {
                        "student_id": row_map.get("STUDENT_ID"),
                        "course": row_map.get("COURSE"),
                        "preferred_hostel": row_map.get("HOSTEL_PREFERENCE"),
                        "preferred_room_type": row_map.get("ROOM_PREFERENCE"),
                        "applied_on": row_map.get("APPLIED_ON"),
                        "waiting_id": row_map.get("WAITING_ID"),
                    }
                )

            return jsonify(data)

        if not _table_exists(cursor, "WAITING_LIST"):
            return jsonify([])

        wl_cols = _get_columns(cursor, "WAITING_LIST")
        cols_to_select = []
        for col in [
            "APPLICATION_ID",
            "ID",
            "STUDENT_ID",
            "PREFERRED_HOSTEL",
            "HOSTEL_PREFERENCE",
            "REQUESTED_ROOM_TYPE",
            "PREFERRED_ROOM_TYPE",
            "REQUEST_DATE",
            "APPLIED_ON",
            "STATUS",
        ]:
            if col in wl_cols:
                cols_to_select.append(col)

        # Pick an available date column for ordering.
        order_col = None
        for c in ["APPLIED_ON", "REQUEST_DATE"]:
            if c in wl_cols:
                order_col = c
                break
        if not order_col:
            for c in ["APPLICATION_ID", "ID"]:
                if c in wl_cols:
                    order_col = c
                    break

        order_sql = f" ORDER BY {order_col} DESC" if order_col else ""
        cursor.execute(f"SELECT {', '.join(cols_to_select)} FROM Waiting_List{order_sql}")
        rows = cursor.fetchall()

        data = []
        for row in rows:
            row_map = dict(zip(cols_to_select, row))
            data.append(
                {
                    "student_id": row_map.get("STUDENT_ID"),
                    "preferred_hostel": row_map.get("PREFERRED_HOSTEL") or row_map.get("HOSTEL_PREFERENCE"),
                    "preferred_room_type": row_map.get("PREFERRED_ROOM_TYPE") or row_map.get("REQUESTED_ROOM_TYPE"),
                    "applied_on": row_map.get("APPLIED_ON") or row_map.get("REQUEST_DATE"),
                    "status": row_map.get("STATUS"),
                    "application_id": row_map.get("APPLICATION_ID") or row_map.get("ID"),
                }
            )

        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# Debug export endpoint
@app.route("/debug-export")
def debug_export():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
        tables = [row[0] for row in cursor.fetchall()]
        
        result = {}
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                result[table] = {"count": count}
                
                if count > 0:
                    cursor.execute(f"SELECT * FROM {table} WHERE ROWNUM <= 3")
                    sample_rows = cursor.fetchall()
                    cursor.execute(f"""
                        SELECT column_name 
                        FROM user_tab_columns 
                        WHERE table_name = :t 
                        ORDER BY column_id
                    """, {"t": table})
                    columns = [row[0] for row in cursor.fetchall()]
                    result[table]["columns"] = columns
                    result[table]["sample_rows"] = sample_rows
            except Exception as e:
                result[table] = {"error": str(e)}
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    app.run(debug=True)