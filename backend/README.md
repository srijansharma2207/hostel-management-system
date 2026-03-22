# Backend Setup Guide

## Prerequisites
- Oracle Database (XEPDB1 running on localhost:1521)
- Python 3.7+
- Required packages: `flask`, `flask-cors`, `oracledb`

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install flask flask-cors oracledb
```

### 2. Database Setup
Run the database setup script to create the Student table and insert sample data:

```bash
python database_setup.py
```

This will:
- Create the `Student` table with all necessary fields
- Insert 10 sample student records
- Handle existing tables gracefully

### 3. Start the Backend Server
```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

### GET /students
Returns all students in the database.

**Response:**
```json
[
  {
    "id": "STU2024001",
    "name": "Arjun Sharma",
    "branch": "B.Tech CSE",
    "year": 1
  }
]
```

### POST /students
Adds a new student to the database.

**Request Body:**
```json
{
  "student_id": "STU2024011",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@hostel.edu",
  "phone": "+91 98765 43220",
  "branch": "B.Tech CSE",
  "year": 2
}
```

**Response:**
```json
{
  "message": "Student added successfully!"
}
```

## Database Schema

### Student Table
- `student_id` (VARCHAR2, PRIMARY KEY)
- `first_name` (VARCHAR2, NOT NULL)
- `last_name` (VARCHAR2, NOT NULL)
- `email` (VARCHAR2, UNIQUE)
- `phone` (VARCHAR2)
- `branch` (VARCHAR2, NOT NULL)
- `year` (NUMBER, NOT NULL)
- `room_number` (VARCHAR2)
- `block` (VARCHAR2)
- `status` (VARCHAR2, DEFAULT 'Active')
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
