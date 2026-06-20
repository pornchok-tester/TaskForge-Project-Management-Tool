# TaskForge — API Spec สำหรับ Automation Test

Base URL: `http://localhost:8000`

---

## คำสั่ง Docker

| Scenario | Command |
|---|---|
| รันครั้งแรก | `docker compose up --build` |
| รันปกติ | `docker compose up` |
| หยุดรัน | `Ctrl+C` หรือ `docker compose down -v` |

---

## 1. Reset Database

ใช้เป็น precondition ก่อนเริ่มทุก Scenario

```
POST /api/test/reset
```

ไม่ต้องใส่ Authorization header และไม่มี request body

**Response 200**
```json
{
  "message": "reset complete",
  "duration_ms": 123
}
```

---

## 2. Login

ใช้เพื่อรับ `access_token` ที่จะนำไปใช้ใน API อื่น

```
POST /api/auth/login
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "admin@taskforge.test",
  "password": "Admin1234!",
  "remember_me": false
}
```

**Response 200**
```json
{
  "access_token": "<jwt_token>"
}
```

ให้เก็บค่า `access_token` ไว้ใช้เป็น `Bearer {token}` ใน header ของ API ที่เหลือ

---

## 3. Dashboard Stats

ใช้ compare กับค่าใน Widget "My Tasks", "Due Today", "Overdue" บนหน้า Dashboard

```
GET /api/dashboard/stats
Authorization: Bearer {token}
```

ไม่มี request body และไม่มี query parameter

**Response 200**
```json
{
  "my_tasks_count": 2,
  "due_today_count": 0,
  "overdue_count": 0
}
```

| Field | คำอธิบาย |
|---|---|
| `my_tasks_count` | จำนวน ticket ที่ assign ให้ user ปัจจุบัน และ status ยังไม่ใช่ `done` |
| `due_today_count` | จำนวน ticket ที่ `due_date` เป็นวันนี้ |
| `overdue_count` | จำนวน ticket ที่ `due_date` ผ่านมาแล้วและยังไม่ `done` |

> **หมายเหตุ:** API นี้ scoped ตาม token ที่ส่งมา — ค่าที่ได้จะเป็นของ user คนที่ login อยู่เท่านั้น

---

## 4. List Tickets by Project

ใช้ compare กับจำนวน card ในแต่ละคอลัมน์บนหน้า Board

```
GET /api/projects/{project_id}/tickets
Authorization: Bearer {token}
```

`{project_id}` คือ ID ของ project ที่กำลังดู Board อยู่ ได้มาจาก URL ของหน้า Board เช่น `/projects/abc123/board`

ไม่มี request body และไม่ต้องส่ง query parameter

**Response 200** — Array ของ ticket object

```json
[
  {
    "id": "string",
    "title": "string",
    "status": "todo"
  },
  {
    "id": "string",
    "title": "string",
    "status": "in_progress"
  }
]
```

| `status` value | คอลัมน์บน Board |
|---|---|
| `todo` | To Do |
| `in_progress` | In Progress |
| `in_review` | In Review |
| `done` | Done |

วิธี compare: นับจำนวน element ใน response ที่มี `status` ตรงกัน แล้วเทียบกับจำนวน card ที่แสดงในคอลัมน์นั้นบน UI
