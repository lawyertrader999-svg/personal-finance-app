# Personal Finance App 💰

แอปพลิเคชันวางแผนการเงินส่วนบุคคล (MVP) ที่พัฒนาด้วย Next.js, Tailwind CSS และ Supabase

## ✨ ฟีเจอร์หลัก

### 🔐 ระบบผู้ใช้
- สมัครสมาชิกและเข้าสู่ระบบด้วย Supabase Auth
- การจัดการ profile ผู้ใช้
- ความปลอดภัยด้วย Row Level Security (RLS)

### 💸 บันทึกรายรับ-รายจ่าย
- เพิ่ม แก้ไข และลบรายการธุรกรรม
- จัดหมวดหมู่รายรับและรายจ่าย
- กรองข้อมูลตามเดือน
- แสดงสรุปยอดรวมแบบ real-time

### 🎯 ตั้งงบประมาณรายเดือน
- กำหนดงบประมาณสำหรับแต่ละหมวดหมู่
- ติดตามการใช้จ่ายด้วย Progress Bar
- แจ้งเตือนเมื่อใกล้หมดงบประมาณหรือเกินงบ
- แสดงสถานะด้วยสีที่แตกต่างกัน

### 📊 แดชบอร์ดและรายงาน
- สรุปภาพรวมการเงินรายเดือน
- กราฟแท่งเปรียบเทียบรายรับ vs รายจ่าย
- กราฟวงกลมแสดงสัดส่วนรายจ่ายตามหมวดหมู่
- แสดงรายการธุรกรรมล่าสุด
- ความคืบหน้างบประมาณแบบ visual

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น
- Node.js 18+ 
- npm หรือ yarn
- บัญชี Supabase

### ขั้นตอนการติดตั้ง

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd personal-finance-app
   ```

2. **ติดตั้ง dependencies**
   ```bash
   npm install
   ```

3. **ตั้งค่า Environment Variables**
   
   สร้างไฟล์ `.env.local` และเพิ่มข้อมูลต่อไปนี้:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **ตั้งค่าฐานข้อมูล**
   
   รัน SQL script ใน `database.sql` ใน Supabase SQL Editor

5. **รันแอปพลิเคชัน**
   ```bash
   npm run dev
   ```

   เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── budgets/           # Budget management
│   ├── transactions/      # Transaction management
│   └── page.tsx           # Dashboard (home page)
├── components/            # Reusable components
│   ├── AuthForm.tsx
│   ├── Layout.tsx
│   ├── TransactionForm.tsx
│   ├── BudgetList.tsx
│   └── ...
├── contexts/              # React contexts
│   └── AuthContext.tsx
└── lib/                   # Utilities and configurations
    ├── supabase.ts
    └── utils.ts
```

## 🗄️ โครงสร้างฐานข้อมูล

### ตารางหลัก
- **profiles**: ข้อมูลผู้ใช้เพิ่มเติม
- **categories**: หมวดหมู่รายรับ-รายจ่าย
- **transactions**: บันทึกธุรกรรมทั้งหมด
- **budgets**: งบประมาณรายเดือน

### ความสัมพันธ์
- ผู้ใช้หนึ่งคนมีได้หลาย categories, transactions, budgets
- Transaction แต่ละรายการเชื่อมโยงกับ category หนึ่งรายการ
- Budget แต่ละรายการเชื่อมโยงกับ category หนึ่งรายการ

## 🔒 ความปลอดภัย

- **Row Level Security (RLS)**: ผู้ใช้เข้าถึงได้เฉพาะข้อมูลของตนเอง
- **Authentication**: ใช้ Supabase Auth สำหรับการจัดการผู้ใช้
- **API Protection**: API routes ตรวจสอบ user authentication

## 🎨 UI/UX Features

- **Responsive Design**: ใช้งานได้ทั้งเดสก์ท็อปและมือถือ
- **Loading States**: แสดงสถานะการโหลดข้อมูล
- **Error Handling**: จัดการข้อผิดพลาดอย่างเหมาะสม
- **Animations**: เอฟเฟกต์การเคลื่อนไหวที่นุ่มนวล
- **Color-coded Status**: ใช้สีแสดงสถานะต่างๆ

## 📱 การใช้งาน

1. **สมัครสมาชิก/เข้าสู่ระบบ**
2. **ดูแดชบอร์ด**: ภาพรวมการเงินรายเดือน
3. **เพิ่มรายการ**: บันทึกรายรับ-รายจ่าย
4. **ตั้งงบประมาณ**: กำหนดงบประมาณสำหรับแต่ละหมวดหมู่
5. **ติดตามผล**: ดูความคืบหน้าและรายงาน

## 🚀 Deployment

แอปพลิเคชันนี้พร้อม deploy บน Vercel:

1. Push code ไปยัง GitHub repository
2. เชื่อมต่อ repository กับ Vercel
3. ตั้งค่า Environment Variables ใน Vercel
4. Deploy อัตโนมัติ

## 🔮 แผนพัฒนาต่อ (Future Enhancements)

- 📈 รายงานและกราฟเพิ่มเติม
- 🎯 เป้าหมายการออม
- 📊 การวิเคราะห์แนวโน้ม
- 📱 Progressive Web App (PWA)
- 🌙 Dark mode
- 📤 Export ข้อมูลเป็น CSV/PDF
- 🔔 การแจ้งเตือนผ่าน email
- 💳 เชื่อมต่อกับธนาคาร (Open Banking)

## 📄 License

MIT License - ดูรายละเอียดใน LICENSE file

## 🤝 Contributing

ยินดีรับ contributions! กรุณา:
1. Fork repository
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push ไปยัง branch
5. เปิด Pull Request

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาเปิด issue ใน GitHub repository

---

**สร้างด้วย ❤️ โดยใช้ Next.js และ Supabase**
