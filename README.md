# BookingApps

ระบบจัดการแอปพลิเคชันการจอง (Booking Management System) พัฒนาด้วย **React + Vite + TypeScript** ควบคู่กับ **TailwindCSS** และ **Redux Toolkit** สำหรับตรวจสอบและติดตามสถานะการจอง

## 🌳 การจัดการ Branch (Branch Management Strategy)

โปรเจกต์นี้ใช้รูปแบบการจัดการ Branch (Git Flow) เพื่อความเป็นระเบียบเรียบร้อย ป้องกันโค้ดพังบน Production และช่วยให้ทำงานร่วมกันได้อย่างมีประสิทธิภาพ

### Branch หลัก (Main Branches)

*   **`main`**
    *   เป็น Branch สำหรับ **Production** เท่านั้น (โค้ดที่รันจริงบน Vercel/Server)
    *   **ห้าม** Push โค้ดหรือทำงานลงบน `main` โดยตรง
    *   โค้ดในนี้ต้องสเถียร ผ่านการทดสอบ (CI/CD ผ่าน 100%) และพร้อมใช้งานเสมอ
*   **`develop`** (หรือ `dev`)
    *   เป็น Branch หลักสำหรับการทำงานร่วมกัน (Development / Staging)
    *   ฟีเจอร์ใหม่ทั้งหมดเมื่อทำเสร็จต้องถูกนำมารวม (Merge) ไว้ที่นี่ เพื่อทดสอบการทำงานร่วมกับฟีเจอร์อื่นๆ ก่อนที่จะนำไปรวมกับ `main`

### Branch ชั่วคราว (Supporting Branches)

เวลาที่คุณจะเริ่มเขียนโค้ด ให้แตก Branch ใหม่ทุกครั้งจาก `develop` โดยใช้โครงสร้างชื่อดังนี้:

*   **`feature/<ชื่อฟีเจอร์>`**
    *   ใช้สำหรับพัฒนาฟีเจอร์ใหม่
    *   **แตกจาก**: `develop`
    *   **รวมกลับไปยัง**: `develop`
    *   *ตัวอย่าง*: `feature/login-system`, `feature/add-booking-modal`
*   **`bugfix/<ชื่อบั๊ก>`**
    *   ใช้สำหรับแก้ไขบั๊กหรือข้อผิดพลาดทั่วไปที่พบขณะกำลังพัฒนา
    *   **แตกจาก**: `develop`
    *   **รวมกลับไปยัง**: `develop`
    *   *ตัวอย่าง*: `bugfix/fix-calendar-overlap`, `bugfix/table-sort-error`
*   **`hotfix/<ชื่อเรื่องด่วน>`**
    *   ใช้สำหรับ **แก้บั๊กด่วนบน Production** ที่รอรวมรอบปกติไม่ได้!
    *   **แตกจาก**: `main` (เน้นย้ำว่าแตกจาก main เท่านั้น)
    *   **รวมกลับไปยัง**: `main` และ `develop` (ต้องอัปเดตทั้งคู่ ป้องกันบั๊กเดิมกลับมาหลอกหลอน)
    *   *ตัวอย่าง*: `hotfix/fix-login-crash`

---

## 🚀 ขั้นตอนการนำโค้ดขึ้น (Workflow Example)

1. **อัปเดตโค้ดล่าสุดจากเซิร์ฟเวอร์ก่อนเสมอ**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **สร้าง Branch ย่อยเพื่อทำงาน**
   ```bash
   git checkout -b feature/login-page
   ```

3. **เขียนโค้ดและ Commit ลง Branch ตัวเอง**
   ```bash
   git add .
   git commit -m "feat: design login UI and connect to authSlice"
   ```

4. **รวมและส่งโค้ด (Push) ตอนทำเสร็จ**
   ```bash
   git push origin feature/login-page
   ```
   *หลังจากนั้นให้ไปเปิด Pull Request (PR) ใน GitHub เพื่อขอรวมเข้า `develop`*

---

## 📝 รูปแบบการเขียน Commit Message (Conventional Commits)
เพื่อให้ประวัติการแก้ไขอ่านง่าย แนะนำให้ขึ้นต้นข้อความ Commit ด้วยคำเหล่านี้:

*   `feat: ` - เพิ่มฟีเจอร์ใหม่ (เช่น `feat: add user profile page`)
*   `fix: ` - แก้ไขบั๊ก (เช่น `fix: resolve button click issue`)
*   `ui: ` - แก้ไขหน้าตาเว็บ (เช่น `ui: adjust button color to primary`)
*   `refactor: ` - จัดการโครงสร้างโค้ดใหม่ โดยที่การทำงานยังเหมือนเดิม
*   `docs: ` - แก้ไขแค่พวกไฟล์เอกสาร เช่น README.md
*   `test: ` - เพิ่มหรือแก้ไขโค้ดทดสอบ (unit tests)
*   `chore: ` - อัปเดตแพ็กเกจ เพิ่ม/ลบ dependencies, แก้ไขตั้งค่า (เช่น `chore: update vite plugin`)

---

## 📦 การรันโปรเจกต์ในเครื่อง (Local Setup)

1. ติดตั้งแพ็กเกจ
   ```bash
   npm install
   ```

2. รันโหมดนักพัฒนา
   ```bash
   npm run dev
   ```

3. รันตรวจสอบโค้ด และ Build โค้ด
   ```bash
   npm run lint
   npx tsc --noEmit
   npm run build
   ```

*ออกแบบและดูแลระบบอย่างดี! ปลอดภัยไว้ก่อน :)*
