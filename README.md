# TaskForge — Project Management Tool

ระบบจัดการ Project แบบ Kanban สำหรับ Team พัฒนาซอฟต์แวร์

## Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend  | FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL 15 |
| Container | Docker Compose |

---

## Quick Start

```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; lsof -ti :8000 | xargs kill -9 2>/dev/null; echo "done"


docker compose up --build
docker compose down -v
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |

---

## Seed Users

ระบบจะ seed ข้อมูลผู้ใช้เหล่านี้อัตโนมัติเมื่อ start up

| Display Name | Email | Password | Role |
|---|---|---|---|
| Admin User | admin@taskforge.test | Admin1234! | admin |
| Manager User | manager@taskforge.test | Manager1234! | manager |
| Dev One | dev1@taskforge.test | Dev1234! | developer |
| Dev Two | dev2@taskforge.test | Dev5678! | developer |
| Viewer User | viewer@taskforge.test | Viewer1234! | viewer |

### สิทธิ์แต่ละ Role

| ความสามารถ | admin | manager | developer | viewer |
|---|:---:|:---:|:---:|:---:|
| ดู Dashboard, Projects, Board | ✅ | ✅ | ✅ | ✅ |
| สร้าง Project | ✅ | ✅ | ❌ | ❌ |
| Quick Add Ticket | ✅ | ✅ | ✅ | ❌ |
| แก้ไข Ticket (Title, Status, Priority, Assignee) | ✅ | ✅ | ✅ | ❌ |
| เพิ่ม Comment | ✅ | ✅ | ✅ | ❌ |
| เข้าหน้า Members | ✅ | ✅ | ❌ | ❌ |
| เปลี่ยน Role สมาชิก | ✅ | ❌ | ❌ | ❌ |
| ลบสมาชิก | ✅ | ❌ | ❌ | ❌ |

---

## Seed Projects

| ชื่อ Project | Status |
|---|---|
| Project Alpha | Active |
| Project Beta | Active |
| Project Delta | Active |
| Project Gamma | Active |
| Project Iota | Active |
| Project Kappa | Active |
| Project Archive One | Archived |

---

## Test Scenarios

> **Precondition ทุก Scenario:** ระบบ Reset Database ก่อนเริ่มทุก Test Case เพื่อให้ข้อมูลเป็น clean state เสมอ (`POST /api/test/reset`)

---

### TC01 — Admin Manage Project And Ticket End To End

ทดสอบ flow หลักของ Admin ตั้งแต่ Login จนถึง Logout ครอบคลุม Dashboard, Projects, Board และ Ticket

**ขั้นที่ 1 — Login เป็น Admin**
- เปิด Browser ไปที่หน้า Login
- กรอก Email: `admin@taskforge.test` และ Password: `Admin1234!`
- กด Sign In
- **Expected:** URL เปลี่ยนไปที่ `/dashboard`

**ขั้นที่ 2 — ตรวจสอบ Dashboard Stats**
- อ่านตัวเลขจำนวนที่แสดงอยู่บน Widget "My Tasks", "Due Today", "Overdue" บนหน้า Dashboard
- เรียก `GET /api/dashboard/stats` ด้วย token ของ Admin
- **Expected:** ตัวเลขบน Widget My Tasks ตรงกับ `my_tasks_count` จาก API
- **Expected:** ตัวเลขบน Widget Due Today ตรงกับ `due_today_count` จาก API
- **Expected:** ตัวเลขบน Widget Overdue ตรงกับ `overdue_count` จาก API

**ขั้นที่ 3 — ดู Projects List (default filter = All)**
- คลิก Projects ใน Navbar เพื่อเข้าหน้า Projects
- **Expected:** แสดง project card ทั้งหมด 7 ใบ
- **Expected:** ปุ่ม New Project ปรากฏ
- **Expected:** project card ทั้ง 6 ที่เป็น Active (Alpha, Beta, Delta, Gamma, Iota, Kappa) มี badge "Active"
- **Expected:** project card "Project Archive One" มี badge "Archived"

**ขั้นที่ 4 — Filter และ Search Projects**
- คลิก Filter dropdown → เลือก "Active"
  - **Expected:** แสดง 6 card, card "Project Archive One" ไม่ปรากฏ
- คลิก Filter dropdown → เลือก "Archived"
  - **Expected:** แสดง 1 card, card "Project Archive One" ปรากฏ พร้อม badge "Archived"
- คลิก Filter dropdown → เลือก "All"
  - **Expected:** แสดง 7 card
- พิมพ์ "Alpha" ใน Search box
  - **Expected:** แสดง 1 card, card "Project Alpha" ปรากฏ พร้อม badge "Active"
- Clear Search
  - **Expected:** แสดง 7 card

**ขั้นที่ 5 — สร้าง Project ใหม่**
- คลิกปุ่ม New Project
- **Expected:** Modal สร้าง Project ปรากฏ
- กรอกชื่อ: `Automation Test Project` และ Description: `Created during automation test`
- คลิก Create
- **Expected:** Modal ปิด, toast success ปรากฏ
- **Expected:** card "Automation Test Project" ปรากฏบนหน้า Projects พร้อม badge "Active"

**ขั้นที่ 6 — เข้า Board และ Compare กับ API**
- คลิก card "Project Alpha"
- **Expected:** URL เปลี่ยนไปที่ `/board`
- เรียก `GET /api/projects/{project_id}/tickets` ด้วย token ของ Admin
- **Expected:** จำนวน card ในคอลัมน์ Todo, In Progress, In Review, Done บน UI ตรงกับจำนวน ticket แต่ละ status จาก API ทุกคอลัมน์

**ขั้นที่ 7 — Quick Add Ticket**
- บันทึกจำนวน card ใน Todo ก่อนเพิ่ม
- คลิกปุ่ม Add Card ในคอลัมน์ Todo
- พิมพ์ชื่อ `Automation quick add ticket` แล้วกด Enter
- **Expected:** card "Automation quick add ticket" ปรากฏในคอลัมน์ Todo
- **Expected:** จำนวน card ใน Todo เพิ่มขึ้น 1 จากก่อนหน้า (compare dynamic ไม่ hardcode)

**ขั้นที่ 8 — เปิด Ticket และแก้ไข Title**
- คลิก card "Fix login validation bug" ในคอลัมน์ Todo
- **Expected:** URL เปลี่ยนไปที่ `/tickets/...`
- คลิกที่ Title เพื่อเข้าสู่โหมดแก้ไข
- ลบ Title เดิมแล้วพิมพ์ `Fix login validation bug (Reviewed)`
- กด Enter เพื่อ Save
- **Expected:** toast success ปรากฏ
- **Expected:** Title แสดงเป็น "Fix login validation bug (Reviewed)"

**ขั้นที่ 9 — เปลี่ยน Status, Priority และ Assignee**
- คลิก Status dropdown → เลือก "In Progress"
  - **Expected:** toast success ปรากฏ
- คลิก Priority dropdown → เลือก "Critical"
  - **Expected:** toast success ปรากฏ
- คลิก Assignee dropdown → พิมพ์ "Manager" ใน search → เลือก "Manager User"
  - **Expected:** toast success ปรากฏ

**ขั้นที่ 10 — เพิ่ม Comment**
- พิมพ์ `Admin reviewed this ticket` ใน Comment input
- คลิกปุ่ม Add Comment
- **Expected:** Comment "Admin reviewed this ticket" ปรากฏในรายการ Comment และ ช่อง input ถูก clear อัตโนมัติ (ค่าใน input เป็น empty string)

**ขั้นที่ 11 — Logout และ Verify Redirect**
- คลิก User Menu icon
- **Expected:** Dropdown menu ปรากฏ
- คลิก Logout
- **Expected:** URL เปลี่ยนไปที่ `/login`
- เข้าไปที่ url ของ `/dashboard` โดยไม่ login
- **Expected:** ระบบ Redirect กลับมาที่ `/login`

---

### TC02 — Developer Work On Assigned Ticket

ทดสอบ Developer ทำงานกับ Ticket ที่ได้รับมอบหมาย และ Quick Add งานใหม่

**ขั้นที่ 1 — Login เป็น Developer**
- เปิด Browser ไปที่หน้า Login
- กรอก Email: `dev1@taskforge.test` และ Password: `Dev1234!`
- กด Sign In
- **Expected:** URL เปลี่ยนไปที่ `/dashboard`

**ขั้นที่ 2 — ตรวจสอบ Dashboard Stats**
- อ่านตัวเลขจำนวนที่แสดงอยู่บน Widget "My Tasks", "Due Today", "Overdue" บนหน้า Dashboard
- เรียก `GET /api/dashboard/stats` ด้วย token ของ Dev One
- **Expected:** ตัวเลขบน Widget My Tasks ตรงกับ `my_tasks_count` จาก API
- **Expected:** ตัวเลขบน Widget Due Today ตรงกับ `due_today_count` จาก API
- **Expected:** ตัวเลขบน Widget Overdue ตรงกับ `overdue_count` จาก API

**ขั้นที่ 3 — เข้า Board และ Compare กับ API**
- คลิก Projects ใน Navbar → คลิก card "Project Alpha"
- **Expected:** URL เปลี่ยนไปที่ `/board`
- เรียก `GET /api/projects/{project_id}/tickets` ด้วย token ของ Dev One
- **Expected:** จำนวน card ทุกคอลัมน์บน UI ตรงกับ API

**ขั้นที่ 4 — Update Ticket Status**
- คลิก card "Refactor authentication module" ในคอลัมน์ In Progress
- **Expected:** URL เปลี่ยนไปที่ `/tickets/...`
- คลิก Status dropdown → เลือก "In Review"
- **Expected:** toast success ปรากฏ

**ขั้นที่ 5 — เพิ่ม Comment**
- พิมพ์ `Completed refactoring, ready for code review` ใน Comment input
- คลิกปุ่ม Add Comment
- **Expected:** Comment ปรากฏในรายการ
- **Expected:** Comment input ถูก clear อัตโนมัติ

**ขั้นที่ 6 — Quick Add Ticket งานใหม่**
- คลิกปุ่ม Back to Board
- **Expected:** URL เปลี่ยนกลับไปที่ `/board`
- บันทึกจำนวน card ใน Todo ก่อนเพิ่ม
- คลิกปุ่ม Add Card ในคอลัมน์ Todo
- พิมพ์ `Write unit tests for auth module` แล้วกด Enter
- **Expected:** card "Write unit tests for auth module" ปรากฏในคอลัมน์ Todo
- **Expected:** จำนวน card ใน Todo เพิ่มขึ้น 1 จากก่อนหน้า (compare dynamic)

---

### TC03 — Viewer Has Read Only Access

ทดสอบว่า Viewer เห็นข้อมูลได้ครบถ้วน แต่ไม่สามารถแก้ไขหรือเข้าถึงหน้าที่ไม่มีสิทธิ์ได้

**ขั้นที่ 1 — Login เป็น Viewer**
- เปิด Browser ไปที่หน้า Login
- กรอก Email: `viewer@taskforge.test` และ Password: `Viewer1234!`
- กด Sign In
- **Expected:** URL เปลี่ยนไปที่ `/dashboard`

**ขั้นที่ 2 — ตรวจสอบ Dashboard Stats**
- อ่านตัวเลขจำนวนที่แสดงอยู่บน Widget "My Tasks", "Due Today", "Overdue" บนหน้า Dashboard
- เรียก `GET /api/dashboard/stats` ด้วย token ของ Viewer
- **Expected:** ตัวเลขบน Widget My Tasks ตรงกับ `my_tasks_count` จาก API
- **Expected:** ตัวเลขบน Widget Due Today ตรงกับ `due_today_count` จาก API
- **Expected:** ตัวเลขบน Widget Overdue ตรงกับ `overdue_count` จาก API

**ขั้นที่ 3 — ตรวจสอบ Projects Page**
- คลิก Projects ใน Navbar
- **Expected:** แสดง 7 card
- **Expected:** ปุ่ม New Project **ไม่ปรากฏ** (Viewer ไม่มีสิทธิ์สร้าง Project)

**ขั้นที่ 4 — ตรวจสอบ Board**
- คลิก card "Project Alpha"
- **Expected:** URL เปลี่ยนไปที่ `/board`
- เรียก `GET /api/projects/{project_id}/tickets` ด้วย token ของ Viewer
- **Expected:** จำนวน card ทุกคอลัมน์ตรงกับ API
- **Expected:** ปุ่ม Add Card **ไม่ปรากฏ**ในทุกคอลัมน์ (Viewer ไม่มีสิทธิ์เพิ่ม Ticket)

**ขั้นที่ 5 — ตรวจสอบ Ticket Detail เป็น Read-only**
- คลิก card "Fix login validation bug" ในคอลัมน์ Todo
- **Expected:** URL เปลี่ยนไปที่ `/tickets/...`
- คลิกที่บริเวณ Title
- **Expected:** Title input **ไม่ปรากฏ** (ไม่สามารถแก้ไข Title ได้)
- **Expected:** Status dropdown trigger **ไม่ปรากฏ**
- **Expected:** Priority dropdown trigger **ไม่ปรากฏ**
- **Expected:** Assignee dropdown trigger **ไม่ปรากฏ**
- **Expected:** Due Date input **ไม่ปรากฏ**
- **Expected:** Comment input และปุ่ม Add Comment **ไม่ปรากฏ**

**ขั้นที่ 6 — ตรวจสอบการเข้าหน้า Members โดยตรง**
- นำทางตรงไปที่ `/workspace/members` ใน address bar
- **Expected:** ระบบ Redirect กลับมาที่ `/dashboard` (Viewer ไม่มีสิทธิ์เข้าหน้า Members)

---

### TC04 — Admin Manage Workspace Members

ทดสอบ Admin จัดการสมาชิก ครอบคลุม การแสดงผล, Sort, Search, เปลี่ยน Role และลบสมาชิก

**ขั้นที่ 1 — Login และเข้าหน้า Members**
- เปิด Browser ไปที่หน้า Login
- กรอก Email: `admin@taskforge.test` และ Password: `Admin1234!`
- กด Sign In → คลิก Members ใน Navbar
- **Expected:** URL เปลี่ยนไปที่ `/workspace/members`
- **Expected:** สมาชิกทั้ง 5 คนปรากฏครบในตาราง: Admin User, Manager User, Dev One, Dev Two, Viewer User
- **Expected:** status badge ของทุกคนแสดงเป็น "Active"
- **Expected:** Admin User ไม่มีปุ่ม Remove (Admin ไม่สามารถลบตัวเองได้)

**ขั้นที่ 2 — Sort ตาม Column ต่างๆ (ตรวจทุกแถวแบบ dynamic)**
- คลิก Sort Email header (ascending)
  - **Expected:** ทุกแถวเรียงตาม email a→z — ตรวจโดย: ดึง email ทุกแถวมาเป็น array → สร้าง sorted copy → เปรียบเทียบ element-by-element ทีละ index
- คลิก Sort Name header (ascending)
  - **Expected:** ทุกแถวเรียงตาม first name a→z — ใช้ first token (ชื่อต้น) เป็น sort key เพราะ backend sort ด้วย `first_name`
- คลิก Sort Name header อีกครั้ง (descending)
  - **Expected:** ทุกแถวเรียงตาม first name z→a
- คลิก Sort Role header (ascending)
  - **Expected:** ทุกแถวเรียงตาม role hierarchy: admin → manager → developer → viewer
  - หมายเหตุ: ไม่ใช่ alphabetical — ตรวจโดย map role → rank index แล้วเช็ค ranks เรียงจากน้อยไปมาก

**ขั้นที่ 3 — ค้นหาสมาชิก**
- พิมพ์ `dev` ใน Search box
- **Expected:** แสดง 2 แถว: Dev One และ Dev Two เท่านั้น
- Clear Search
- **Expected:** แสดง 5 แถวครบ

**ขั้นที่ 4 — เปลี่ยน Role สมาชิก**
- คลิก Role dropdown ของแถว "Dev Two" → เลือก "Manager"
- **Expected:** toast success ปรากฏ
- **Expected:** role cell ของ "Dev Two" แสดงเป็น "Manager"

**ขั้นที่ 5 — ลบสมาชิก (Cancel แล้วลบจริง)**
- คลิกปุ่ม Remove ของ "Dev Two"
  - **Expected:** Confirm modal ปรากฏ
  - คลิก Cancel
  - **Expected:** modal ปิด, "Dev Two" ยังอยู่ในตาราง
- คลิกปุ่ม Remove ของ "Dev Two" อีกครั้ง
  - **Expected:** Confirm modal ปรากฏ
  - คลิก Confirm
  - **Expected:** modal ปิด, toast success ปรากฏ
  - **Expected:** "Dev Two" หายออกจากตาราง

---

## API Reference

### Reset Database

ใช้เป็น Test Setup ก่อนเริ่มทุก Scenario เพื่อให้ข้อมูลเป็น clean state เสมอ

```
POST /api/test/reset
```

ไม่ต้องใส่ header หรือ body

**Response 200**
```json
{ "message": "reset complete", "duration_ms": 123 }
```

---

### Login

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
{ "access_token": "<jwt_token>" }
```

นำ `access_token` ไปใส่เป็น `Authorization: Bearer {token}` ใน request ที่เหลือ

---

### Dashboard Stats

```
GET /api/dashboard/stats
Authorization: Bearer {token}
```

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
| `my_tasks_count` | Ticket ที่ assign ให้ user นี้และ status ยังไม่ใช่ `done` |
| `due_today_count` | Ticket ที่ `due_date` เป็นวันนี้ |
| `overdue_count` | Ticket ที่ `due_date` ผ่านมาแล้วและยังไม่ `done` |

> ค่าที่ได้ scoped ตาม token ที่ส่งมา — เป็นข้อมูลของ user คนที่ login เท่านั้น

---

### List Projects

```
GET /api/projects
Authorization: Bearer {token}
```

**Response 200** — Array ของ project object

```json
[
  { "id": "string", "name": "Project Alpha", "status": "active" }
]
```

---

### List Tickets by Project

```
GET /api/projects/{project_id}/tickets
Authorization: Bearer {token}
```

**Response 200** — Array ของ ticket object

```json
[
  { "id": "string", "title": "string", "status": "todo" },
  { "id": "string", "title": "string", "status": "in_progress" }
]
```

| `status` value | คอลัมน์บน Board |
|---|---|
| `todo` | To Do |
| `in_progress` | In Progress |
| `in_review` | In Review |
| `done` | Done |

วิธี compare: นับ element ใน array ที่มี `status` ตรงกัน แล้วเทียบกับจำนวน card บน UI ในคอลัมน์นั้น

---
