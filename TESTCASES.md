# TaskForge — Test Scenarios for Automation

## ข้อกำหนดเบื้องต้น

- Application รันอยู่ที่ `http://localhost:3000`
- API รันอยู่ที่ `http://localhost:8000`
- **ก่อนเริ่ม Scenario ทุกอัน** ให้ reset database ก่อนเสมอ
  ```
  POST http://localhost:8000/api/test/reset
  ```

---

## ข้อมูลในระบบหลัง Reset

### Users
| Email | Password | Role |
|-------|----------|------|
| admin@taskforge.test | Admin1234! | admin |
| manager@taskforge.test | Manager1234! | manager |
| dev1@taskforge.test | Dev1234! | developer |
| dev2@taskforge.test | Dev5678! | developer |
| viewer@taskforge.test | Viewer1234! | viewer |

### Projects
- **Active (6 อัน):** Project Alpha, Project Beta, Project Delta, Project Gamma, Project Iota, Project Kappa
- **Archived (1 อัน):** Project Archive One

### Tickets ใน Project Alpha
| Title | Status | Priority | Assignee |
|-------|--------|----------|----------|
| Fix login validation bug | To Do | High | Dev One |
| Implement dark mode | To Do | Critical | Admin User |
| Add export to CSV feature | To Do | Low | (ไม่มี) |
| Refactor authentication module | In Progress | High | Dev One |
| Design new dashboard layout | In Progress | Medium | Admin User |
| Write API documentation | In Review | Medium | Manager User |
| Initial project setup | Done | Low | Admin User |
| Basic CRUD API implementation | Done | Medium | Dev One |

---

## Scenario 1: Admin จัดการ Project และ Ticket ตั้งแต่ต้น

**จุดประสงค์:** ทดสอบ flow ของ Admin ตั้งแต่ Login → สร้าง Project → เข้าดู Board → จัดการ Ticket

---

**ขั้นที่ 1 — Login**

1. เปิด Browser ไปที่ `http://localhost:3000`
2. กรอก Email: `admin@taskforge.test` และ Password: `Admin1234!`
3. คลิกปุ่ม Sign in
   - **Expected:** Login สำเร็จ เข้าหน้า `/dashboard` ได้

---

**ขั้นที่ 2 — ตรวจสอบ Dashboard Stats**

1. สังเกตค่าตัวเลขใน Widget "My Tasks", "Due Today", "Overdue" บนหน้า Dashboard
2. เรียก `GET http://localhost:8000/api/dashboard/stats` พร้อม Authorization: Bearer {token ของ Admin}
   - **Expected:** Response HTTP Status 200
   - **Expected:** ตัวเลขบน Widget "My Tasks" === `my_tasks_count` ใน response
   - **Expected:** ตัวเลขบน Widget "Due Today" === `due_today_count` ใน response
   - **Expected:** ตัวเลขบน Widget "Overdue" === `overdue_count` ใน response

---

**ขั้นที่ 3 — ดู Projects List**

1. คลิก "Projects" ใน Navbar
   - **Expected:** หน้าเปลี่ยนไปที่ `/projects`

2. รอให้ Project Card โหลด
   - **Expected:** แสดง Project Card ทั้งหมด 7 อัน (6 active + 1 archived)
   - **Expected:** มีปุ่ม "+ New Project" มุมขวาบน
   - **Expected:** "Project Archive One" มี Badge "Archived"
   - **Expected:** Project Alpha, Beta, Delta, Gamma, Iota, Kappa มี Badge "Active"

---

**ขั้นที่ 4 — Filter และ Search**

1. คลิก Dropdown filter Status
   - **Expected:** Dropdown เปิดออก แสดงตัวเลือก All, Active, Archived

2. เลือก "Active"
   - **Expected:** Project Card เหลือ 6 อัน ได้แก่ Project Alpha, Beta, Delta, Gamma, Iota, Kappa
   - **Expected:** "Project Archive One" หายไปจาก List

3. คลิก Dropdown filter Status อีกครั้ง แล้วเลือก "Archived"
   - **Expected:** Project Card เหลือ 1 อัน คือ "Project Archive One" เท่านั้น
   - **Expected:** Project Active ทั้ง 6 อันหายไปทั้งหมด

4. คลิก Dropdown filter Status อีกครั้ง แล้วเลือก "All"
   - **Expected:** Project Card กลับมาแสดงครบ 7 อัน (6 active + 1 archived)

5. คลิกที่ช่อง Search แล้วพิมพ์ "Alpha"
   - **Expected:** ขณะพิมพ์ Project Card ลดลงเหลือ 1 อัน คือ "Project Alpha"
   - **Expected:** Project อื่นหายไปทั้งหมดโดยไม่ต้องกด Enter

6. ลบ text "Alpha" ในช่อง Search ออกจนหมด
   - **Expected:** Project Card กลับมาแสดงครบ 7 อันอีกครั้ง

---

**ขั้นที่ 5 — สร้าง Project ใหม่**

1. คลิกปุ่ม "+ New Project"
   - **Expected:** Modal สร้าง Project เปิดขึ้นมา มีช่อง Name และ Description

2. กรอก Name: `Automation Test Project`
   - **Expected:** ช่อง Name แสดง `Automation Test Project`

3. กรอก Description: `Created during automation test`
   - **Expected:** ช่อง Description แสดง `Created during automation test`

4. คลิกปุ่ม Create
   - **Expected:** Modal ปิด
   - **Expected:** แสดง toast notification สำเร็จ
   - **Expected:** Project "Automation Test Project" ปรากฏใน Project List พร้อม Badge "Active"

---

**ขั้นที่ 6 — เข้า Board ของ Project Alpha**

1. คลิกที่ Card "Project Alpha"
   - **Expected:** หน้าเปลี่ยนไปที่ Board ของ Project Alpha
   - **Expected:** แสดง 4 คอลัมน์: To Do, In Progress, In Review, Done

2. เรียก `GET http://localhost:8000/api/projects/{project_id}/tickets` พร้อม Authorization: Bearer {token ของ Admin}
   - **Expected:** Response HTTP Status 200
   - **Expected:** นับ ticket ที่ `status = "todo"` จาก response === จำนวน card ในคอลัมน์ To Do บน UI (คาดว่าเป็น 3)
   - **Expected:** นับ ticket ที่ `status = "in_progress"` จาก response === จำนวน card ในคอลัมน์ In Progress บน UI (คาดว่าเป็น 2)
   - **Expected:** นับ ticket ที่ `status = "in_review"` จาก response === จำนวน card ในคอลัมน์ In Review บน UI (คาดว่าเป็น 1)
   - **Expected:** นับ ticket ที่ `status = "done"` จาก response === จำนวน card ในคอลัมน์ Done บน UI (คาดว่าเป็น 2)

---

**ขั้นที่ 7 — Quick Add Ticket**

1. คลิกปุ่ม "+ Add card" ใต้คอลัมน์ "To Do"
   - **Expected:** input field ปรากฏในคอลัมน์ To Do พร้อม placeholder

2. พิมพ์: `Automation quick add ticket`
   - **Expected:** ช่อง input แสดงข้อความที่พิมพ์

3. กด Enter
   - **Expected:** Card ใหม่ชื่อ "Automation quick add ticket" ปรากฏในคอลัมน์ To Do
   - **Expected:** จำนวน ticket ใน To Do เพิ่มจาก 3 เป็น 4

---

**ขั้นที่ 8 — เปิด Ticket Detail และแก้ไข Title**

1. คลิกที่ Card "Fix login validation bug"
   - **Expected:** หน้า Ticket Detail เปิดขึ้น แสดง Title, Status, Priority, Assignee, Due Date, Description, Comment

2. คลิกที่ Title "Fix login validation bug"
   - **Expected:** Title เปลี่ยนจาก text เป็น input field ที่มีข้อความเดิมอยู่

3. ลบข้อความเดิมออก แล้วพิมพ์: `Fix login validation bug (Reviewed)`
   - **Expected:** input field แสดง `Fix login validation bug (Reviewed)`

4. กด Enter
   - **Expected:** input field หายไป Title กลับเป็น text ปกติ
   - **Expected:** Title แสดงเป็น "Fix login validation bug (Reviewed)"
   - **Expected:** แสดง toast notification สำเร็จ

---

**ขั้นที่ 9 — เปลี่ยน Status, Priority และ Assignee**

1. คลิก Dropdown "Status" (ด้านขวาของหน้า)
   - **Expected:** Dropdown เปิด แสดงตัวเลือก To Do, In Progress, In Review, Done

2. เลือก "In Progress"
   - **Expected:** Dropdown ปิด Status แสดงเป็น "In Progress"
   - **Expected:** แสดง toast notification สำเร็จ

3. คลิก Dropdown "Priority"
   - **Expected:** Dropdown เปิด แสดงตัวเลือก Low, Medium, High, Critical

4. เลือก "Critical"
   - **Expected:** Dropdown ปิด Priority แสดงเป็น "Critical"
   - **Expected:** แสดง toast notification สำเร็จ

5. คลิก Dropdown "Assignee"
   - **Expected:** Dropdown เปิด แสดงช่อง Search และรายชื่อ Member ทั้งหมด

6. พิมพ์ "Manager" ในช่อง Search
   - **Expected:** รายชื่อกรองเหลือเฉพาะ "Manager User"

7. คลิกเลือก "Manager User"
   - **Expected:** Dropdown ปิด Assignee แสดงเป็น "Manager User"
   - **Expected:** แสดง toast notification สำเร็จ

---

**ขั้นที่ 10 — ตั้งค่า Due Date(Optional)**

1. คลิกที่ช่อง Due Date
   - **Expected:** ช่อง Date input พร้อมรับการกรอก

2. กรอก: `2026-12-31`
   - **Expected:** ช่อง Due Date แสดงวันที่ `2026-12-31`

3. คลิกออกนอกช่อง (หรือกด Tab)
   - **Expected:** แสดง toast notification สำเร็จ
   - **Expected:** Due Date ยังคงแสดง `2026-12-31`

---

**ขั้นที่ 11 — เพิ่ม Comment**

1. คลิกที่ช่อง Comment ด้านล่าง แล้วพิมพ์: `Admin reviewed this ticket`
   - **Expected:** ช่อง Comment แสดงข้อความที่พิมพ์

2. คลิกปุ่ม Add Comment
   - **Expected:** Comment "Admin reviewed this ticket" ปรากฏในรายการ Comment
   - **Expected:** ช่อง Comment ว่างเปล่า (cleared หลัง submit)
   - **Expected:** Comment แสดงชื่อ "Admin User" และวันที่ปัจจุบัน

---

**ขั้นที่ 12 — Logout**

1. คลิกที่ชื่อ User มุมขวาบน
   - **Expected:** Dropdown เปิด แสดง email ของ Admin และปุ่ม "Sign out"

2. คลิก "Sign out"
   - **Expected:** หน้าเปลี่ยนกลับไปที่ `/login`

3. พิมพ์ URL `/dashboard` ใน Browser โดยตรง
   - **Expected:** ระบบ Redirect กลับมา `/login` อัตโนมัติ ไม่สามารถเข้าหน้า Dashboard ได้

---
---

## Scenario 2: Developer ทำงาน Ticket ที่ได้รับมอบหมาย

**จุดประสงค์:** ทดสอบว่า Developer เห็นและแก้ไขได้เฉพาะสิ่งที่ควรเห็น

---

**ขั้นที่ 1 — Login เป็น Developer**

1. ไปที่หน้า Login (`/login`) แล้วกรอก Email: `dev1@taskforge.test` และ Password: `Dev1234!`
2. คลิก Sign in
   - **Expected:** Login สำเร็จ เข้าหน้า `/dashboard` ได้

---

**ขั้นที่ 2 — ตรวจสอบ Dashboard Stats**

1. สังเกตค่าตัวเลขใน Widget "My Tasks", "Due Today", "Overdue" บนหน้า Dashboard
2. เรียก `GET http://localhost:8000/api/dashboard/stats` พร้อม Authorization: Bearer {token ของ Dev One}
   - **Expected:** Response HTTP Status 200
   - **Expected:** ตัวเลขบน Widget "My Tasks" === `my_tasks_count` ใน response 
   - **Expected:** ตัวเลขบน Widget "Due Today" === `due_today_count` ใน response
   - **Expected:** ตัวเลขบน Widget "Overdue" === `overdue_count` ใน response

---

**ขั้นที่ 3 — เข้า Board และอัพเดต Status Ticket**

1. คลิก Projects ใน Navbar
   - **Expected:** หน้า Projects แสดง Project Card ทั้งหมด

2. คลิกที่ "Project Alpha"
   - **Expected:** หน้า Board ของ Project Alpha เปิดขึ้น แสดง 4 คอลัมน์

3. เรียก `GET http://localhost:8000/api/projects/{project_id}/tickets` พร้อม Authorization: Bearer {token ของ Dev One}
   - **Expected:** Response HTTP Status 200
   - **Expected:** นับ ticket ที่ `status = "todo"` จาก response === จำนวน card ในคอลัมน์ To Do บน UI
   - **Expected:** นับ ticket ที่ `status = "in_progress"` จาก response === จำนวน card ในคอลัมน์ In Progress บน UI
   - **Expected:** นับ ticket ที่ `status = "in_review"` จาก response === จำนวน card ในคอลัมน์ In Review บน UI
   - **Expected:** นับ ticket ที่ `status = "done"` จาก response === จำนวน card ในคอลัมน์ Done บน UI

4. คลิกที่ Card "Refactor authentication module" ในคอลัมน์ In Progress
   - **Expected:** หน้า Ticket Detail เปิดขึ้น แสดง Status ปัจจุบันเป็น "In Progress"

5. คลิก Dropdown "Status" แล้วเลือก "In Review"
   - **Expected:** Dropdown ปิด Status เปลี่ยนเป็น "In Review"
   - **Expected:** แสดง toast notification สำเร็จ

---

**ขั้นที่ 4 — เพิ่ม Comment อธิบายงาน**

1. คลิกที่ช่อง Comment แล้วพิมพ์: `Completed refactoring, ready for code review`
   - **Expected:** ช่อง Comment แสดงข้อความที่พิมพ์

2. คลิก Add Comment
   - **Expected:** Comment ปรากฏในรายการพร้อมชื่อ "Dev One" และวันที่
   - **Expected:** ช่อง Comment ว่างเปล่าหลัง submit

---

**ขั้นที่ 5 — Quick Add Ticket งานใหม่**

1. คลิก "← Back to Board" เพื่อกลับไปหน้า Board
   - **Expected:** หน้า Board ของ Project Alpha แสดงขึ้น

2. คลิก "+ Add card" ใต้คอลัมน์ "To Do"
   - **Expected:** input field ปรากฏในคอลัมน์ To Do

3. พิมพ์: `Write unit tests for auth module` แล้วกด Enter
   - **Expected:** Card ใหม่ชื่อ "Write unit tests for auth module" ปรากฏในคอลัมน์ To Do
   - **Expected:** จำนวน ticket ใน To Do เพิ่มขึ้น 1

---
---

## Scenario 3: Viewer เห็นข้อมูลแต่แก้ไขไม่ได้

**จุดประสงค์:** ทดสอบว่า Viewer ถูก Restrict ทุกจุดที่ควร

---

**ขั้นที่ 1 — Login เป็น Viewer**

1. ไปที่หน้า Login (`/login`) แล้วกรอก Email: `viewer@taskforge.test` และ Password: `Viewer1234!`
2. คลิก Sign in
   - **Expected:** Login สำเร็จ เข้าหน้า `/dashboard` ได้

---

**ขั้นที่ 2 — ตรวจสอบ Dashboard Stats**

1. สังเกตค่าตัวเลขใน Widget "My Tasks", "Due Today", "Overdue" บนหน้า Dashboard
2. เรียก `GET http://localhost:8000/api/dashboard/stats` พร้อม Authorization: Bearer {token ของ Viewer}
   - **Expected:** Response HTTP Status 200
   - **Expected:** ตัวเลขบน Widget "My Tasks" === `my_tasks_count` ใน response
   - **Expected:** ตัวเลขบน Widget "Due Today" === `due_today_count` ใน response
   - **Expected:** ตัวเลขบน Widget "Overdue" === `overdue_count` ใน response

---

**ขั้นที่ 3 — ตรวจสอบ Projects Page**

1. คลิก Projects ใน Navbar
   - **Expected:** หน้า Projects โหลดขึ้น แสดง Project Card ทั้งหมด 7 อัน
   - **Expected:** ไม่มีปุ่ม "+ New Project" ในหน้านี้เลย

---

**ขั้นที่ 4 — ตรวจสอบ Board**

1. คลิกที่ Card "Project Alpha"
   - **Expected:** หน้า Board ของ Project Alpha เปิดขึ้น แสดง ticket ครบทุกอัน
   - **Expected:** ไม่มีปุ่ม "+ Add card" ในทุกคอลัมน์ (To Do, In Progress, In Review, Done)

2. เรียก `GET http://localhost:8000/api/projects/{project_id}/tickets` พร้อม Authorization: Bearer {token ของ Viewer}
   - **Expected:** Response HTTP Status 200
   - **Expected:** นับ ticket ที่ `status = "todo"` จาก response === จำนวน card ในคอลัมน์ To Do บน UI
   - **Expected:** นับ ticket ที่ `status = "in_progress"` จาก response === จำนวน card ในคอลัมน์ In Progress บน UI
   - **Expected:** นับ ticket ที่ `status = "in_review"` จาก response === จำนวน card ในคอลัมน์ In Review บน UI
   - **Expected:** นับ ticket ที่ `status = "done"` จาก response === จำนวน card ในคอลัมน์ Done บน UI

---

**ขั้นที่ 5 — ตรวจสอบ Ticket Detail**

1. คลิกที่ Card "Fix login validation bug"
   - **Expected:** หน้า Ticket Detail เปิดขึ้น แสดงข้อมูล Title, Status, Priority, Assignee, Due Date, Description, Comment ได้ปกติ

2. คลิกที่ Title "Fix login validation bug"
   - **Expected:** Title ไม่เปลี่ยนเป็น input field ยังคงเป็น text อ่านอย่างเดียว

3. ตรวจสอบส่วน Status, Priority, Assignee ด้านขวา
   - **Expected:** แสดงเป็น text อ่านอย่างเดียว ไม่มี Dropdown ให้คลิก

4. ตรวจสอบส่วน Due Date
   - **Expected:** แสดงเป็น text ไม่มีช่อง input ให้แก้ไข

5. ตรวจสอบส่วน Comment ด้านล่าง
   - **Expected:** ไม่มีช่อง Comment input และไม่มีปุ่ม Add Comment
   - **Expected:** ยังเห็น Comment ที่มีอยู่แล้วได้ตามปกติ

---

**ขั้นที่ 6 — ตรวจสอบว่าเข้าหน้า Members ไม่ได้**

1. พิมพ์ URL `http://localhost:3000/workspace/members` ตรงๆ ใน Browser แล้วกด Enter
   - **Expected:** ระบบไม่แสดงหน้า Members ให้ Viewer (Redirect ออกหรือแสดงหน้าอื่น)

---
---

## Scenario 4: Admin จัดการสมาชิกใน Workspace

**จุดประสงค์:** ทดสอบ Members Management ทั้งหมด

---

**ขั้นที่ 1 — Login เป็น Admin และเข้าหน้า Members**

1. ไปที่หน้า Login (`/login`) แล้วกรอก Email: `admin@taskforge.test` และ Password: `Admin1234!` แล้วคลิก Sign in
   - **Expected:** Login สำเร็จ เข้าหน้า `/dashboard` ได้

2. คลิก "Members" ใน Navbar
   - **Expected:** หน้า Members เปิดขึ้น แสดงตาราง Members
   - **Expected:** ตารางมีสมาชิก 5 คน ครบทั้ง Admin User, Manager User, Dev One, Dev Two, Viewer User
   - **Expected:** ทุกคนมีสถานะ "Active"
   - **Expected:** แถวของ Admin User ไม่มีปุ่ม Remove (ไม่สามารถลบตัวเองได้)

---

**ขั้นที่ 2 — เรียงลำดับตาม Column**

1. คลิกหัวคอลัมน์ "Name"
   - **Expected:** รายชื่อเรียงตาม Name จาก A-Z

2. คลิกหัวคอลัมน์ "Name" อีกครั้ง
   - **Expected:** รายชื่อเรียงกลับจาก Z-A

3. คลิกหัวคอลัมน์ "Email"
   - **Expected:** รายชื่อเรียงตาม Email จาก A-Z

4. คลิกหัวคอลัมน์ "Role"
   - **Expected:** รายชื่อเรียงตาม Role (alphabetical)

---

**ขั้นที่ 3 — ค้นหาสมาชิก**

1. พิมพ์ "dev" ในช่อง Search
   - **Expected:** ตารางกรองเหลือเฉพาะ "Dev One" และ "Dev Two" เท่านั้น

2. ลบ text "dev" ออกจนหมด
   - **Expected:** ตารางกลับมาแสดงสมาชิกทั้ง 5 คนอีกครั้ง

---

**ขั้นที่ 4 — เปลี่ยน Role ของสมาชิก**

1. หาแถวของ "Dev Two" แล้วคลิก Dropdown Role ในแถวนั้น
   - **Expected:** Dropdown เปิด แสดงตัวเลือก Admin, Manager, Developer, Viewer

2. เลือก "Manager"
   - **Expected:** Dropdown ปิด Role ของ Dev Two เปลี่ยนเป็น "Manager"
   - **Expected:** แสดง toast notification สำเร็จ

---

**ขั้นที่ 5 — Remove สมาชิก**

1. คลิกปุ่ม "Remove" ในแถวของ "Dev Two"
   - **Expected:** Modal ยืนยันการลบขึ้นมา แสดงชื่อ "Dev Two" และปุ่ม Remove กับ Cancel

2. คลิกปุ่ม "Cancel"
   - **Expected:** Modal ปิด Dev Two ยังคงอยู่ในตาราง

3. คลิกปุ่ม "Remove" ในแถวของ "Dev Two" อีกครั้ง
   - **Expected:** Modal ยืนยันขึ้นมาอีกครั้ง

4. คลิกปุ่ม "Remove" ใน Modal เพื่อยืนยัน
   - **Expected:** Modal ปิด
   - **Expected:** แสดง toast notification สำเร็จ
   - **Expected:** Dev Two หายไปจากตาราง (หรือสถานะเปลี่ยนเป็น Inactive)

