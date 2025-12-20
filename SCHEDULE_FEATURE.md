# Tính năng Quản lý Lịch Làm Việc Nhân Viên

## Tổng quan
Màn hình quản lý lịch làm việc cho phép Admin lên lịch và quản lý ca làm việc của nhân viên theo tuần với giao diện thời khóa biểu trực quan.

## Định nghĩa 3 ca cố định

| Ca | Thời gian | Màu sắc |
|---|---|---|
| Ca Sáng | 06:00 - 14:00 | Xanh dương |
| Ca Chiều | 14:00 - 22:00 | Cam |
| Ca Đêm | 22:00 - 06:00 | Tím |

## Tính năng chính

### 1. Giao diện thời khóa biểu
- **Dạng bảng 7x3**: 7 ngày (T2-CN) x 3 ca
- **Highlight ngày hiện tại**: Nền màu xanh nhạt
- **Navigation tuần**: Chuyển tuần trước/sau, về tuần hiện tại

### 2. Hiển thị thông tin nhân viên
Mỗi card nhân viên trong lịch hiển thị:
- ✅ **Avatar**: Ảnh đại diện hoặc chữ cái đầu tên
- ✅ **Tên nhân viên**: Họ và tên đầy đủ
- ✅ **Vai trò**: Chức vụ (Receptionist, Housekeeper, etc.)
- ✅ **Trạng thái**: Badge màu (Đã lên lịch/Hoàn thành/Vắng mặt/Đã hủy)
- ✅ **Ghi chú**: Hiển thị 1 dòng nếu có

### 3. Tương tác
- **Click vào card**: Mở dialog edit với thông tin đầy đủ
- **Hover card**: Hiển thị nút Edit/Delete ở góc phải
- **Click nút "Thêm"**: Thêm nhân viên mới vào ca

### 4. Form thêm/sửa lịch
Dialog form bao gồm:
- Dropdown chọn nhân viên (hiển thị tên + vai trò)
- Date picker chọn ngày
- Dropdown chọn ca (Sáng/Chiều/Đêm với giờ)
- Textarea ghi chú

## Cấu trúc dữ liệu API

### Employee
```typescript
{
  employeeId: number
  fullName: string
  role: string
  avatarUrl?: string  // URL ảnh đại diện
  email: string
  phoneNumber: string
  isActive: boolean
}
```

### EmployeeSchedule
```typescript
{
  scheduleId: number
  employeeId: number
  employeeName: string
  employeeRole: string
  employeeAvatar?: string  // URL ảnh đại diện
  date: string  // ISO format
  shiftType: "morning" | "afternoon" | "night"
  status: "Scheduled" | "Completed" | "Absent" | "Cancelled"
  notes?: string
}
```

## API Endpoints

```
GET  /api/Schedule?startDate={date}&endDate={date}  - Lấy lịch theo khoảng thời gian
POST /api/Schedule                                   - Tạo lịch mới
PUT  /api/Schedule/{id}                             - Cập nhật lịch
DELETE /api/Schedule/{id}                           - Xóa lịch
GET  /api/Employee/active                           - Lấy danh sách nhân viên active
```

## Ví dụ Response API

### GET /api/Schedule
```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "scheduleId": 1,
        "employeeId": 5,
        "employeeName": "Nguyễn Văn A",
        "employeeRole": "Receptionist",
        "employeeAvatar": "https://example.com/avatar1.jpg",
        "date": "2025-01-15T00:00:00Z",
        "shiftType": "morning",
        "shiftName": "Ca Sáng",
        "startTime": "06:00",
        "endTime": "14:00",
        "status": "Scheduled",
        "notes": "Ca đầu tuần"
      }
    ]
  }
}
```

### GET /api/Employee/active
```json
{
  "isSuccess": true,
  "data": [
    {
      "employeeId": 5,
      "fullName": "Nguyễn Văn A",
      "role": "Receptionist",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "email": "nva@hotel.com",
      "phoneNumber": "0901234567",
      "isActive": true
    }
  ]
}
```

## Cách sử dụng

1. **Truy cập**: `/admin/schedules` trên menu sidebar
2. **Xem lịch tuần**: Mặc định hiển thị tuần hiện tại
3. **Điều hướng**: Dùng nút "Tuần trước/sau" hoặc "Tuần này"
4. **Thêm lịch**: Click "Thêm" ở ô muốn thêm nhân viên
5. **Sửa lịch**: Click vào card nhân viên hoặc nút Edit
6. **Xóa lịch**: Hover vào card → Click nút Trash

## UI/UX Features

### Avatar Display
- Nếu có `employeeAvatar`: Hiển thị ảnh tròn 32x32px
- Nếu không có: Hiển thị chữ cái đầu tên với gradient màu

### Click Event
- Toàn bộ card nhân viên có thể click
- Hover hiển thị shadow và nút Edit/Delete
- Click vào card → Mở dialog edit ngay lập tức

### Color Coding
- **Ca Sáng**: Background xanh nhạt
- **Ca Chiều**: Background cam nhạt
- **Ca Đêm**: Background tím nhạt
- **Ngày hiện tại**: Cột có nền highlight

### Responsive
- Bảng có scroll ngang trên mobile
- Sticky header và cột đầu tiên
- Min-width cho mỗi ô: 180px

## Files liên quan

- `/lib/types/api.ts` - Type definitions
- `/lib/api/schedule.ts` - API functions và shift definitions
- `/lib/hooks/use-schedule.ts` - React Query hooks
- `/components/admin/employee-schedule-management.tsx` - Main component
- `/app/admin/schedules/page.tsx` - Page wrapper
- `/app/admin/layout.tsx` - Navigation menu

## Troubleshooting

**Q: Avatar không hiển thị?**
A: Kiểm tra API response có field `employeeAvatar` trong EmployeeSchedule hoặc `avatarUrl` trong Employee

**Q: Click vào card không mở dialog?**
A: Kiểm tra hàm `handleEditSchedule` và `onClick` event của card

**Q: Lịch không load?**
A: Kiểm tra API endpoint `/api/Schedule` và params `startDate`/`endDate`
