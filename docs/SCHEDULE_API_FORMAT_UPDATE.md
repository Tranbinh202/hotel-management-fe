# Weekly Schedule API - Format Update

## 🔄 Thay đổi API Format

### ❌ Old Format (KHÔNG dùng nữa)
```http
GET /api/Schedule/weekly?year=2025&month=12&day=19&dayOfWeek=0
```

### ✅ New Format (Hiện tại)
```http
GET /api/Schedule/weekly?date=20251214
```

## 📝 Chi tiết

### Input
- **Parameter**: `date`
- **Format**: `yyyyMMdd` (8 ký tự)
- **Example**: `20251214` = 14/12/2025

### Logic
1. Nhận 1 ngày **bất kỳ** trong tuần
2. Tự động tính tuần từ **Thứ 2 → Chủ nhật**
3. Trả về lịch cả tuần (7 ngày × 3 ca = 21 schedules)

### Ví dụ
```
Input: date=20251214 (Chủ nhật 14/12/2025)
→ Backend tự tính: Thứ 2 (09/12) → Chủ nhật (15/12)
→ Trả về lịch cả tuần
```

## ✅ Code Changes

### 1. API Client (`lib/api/schedule.ts`)

**Trước:**
```typescript
const response = await apiClient.get("/Schedule/weekly", {
  params: { 
    year: 2025,
    month: 12,
    day: 19,
    dayOfWeek: 0
  }
})
```

**Sau:**
```typescript
// Format date thành yyyyMMdd
const date = new Date(startDate)
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')
const day = String(date.getDate()).padStart(2, '0')
const dateParam = `${year}${month}${day}`  // "20251214"

const response = await apiClient.get("/Schedule/weekly", {
  params: { date: dateParam }
})
```

### 2. Response Structure

Response giờ trả về **đúng dates**:

```json
{
  "data": {
    "shifts": [
      {
        "shiftName": "Ca Sáng",
        "startTime": "06:00:00",
        "endTime": "14:00:00",
        "dailySchedules": [
          {
            "shiftDate": "2025-12-09",  // ✅ Đúng format
            "dayOfWeek": "Thứ 2",
            "employees": [...]
          },
          {
            "shiftDate": "2025-12-10",
            "dayOfWeek": "Thứ 3",
            "employees": [...]
          }
          // ... 5 ngày còn lại
        ]
      }
      // Ca Chiều, Ca Đêm...
    ]
  }
}
```

## 🎯 Cách hoạt động

### Frontend Flow
```
User chọn tuần → Component tính startDate (thứ 2)
→ Format: "2025-12-16" → "20251216"
→ API call: GET /api/Schedule/weekly?date=20251216
→ Backend tự tính tuần: 16/12 (Thứ 2) → 22/12 (CN)
→ Response: 7 ngày × 3 ca
→ Adapter convert → Render UI
```

### Date Format Helper
```typescript
// Helper function
function formatToyyyyMMdd(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

// Usage
const startDate = "2025-12-16"  // ISO format
const apiParam = formatToyyyyMMdd(startDate)  // "20251216"
```

## 🚀 Benefits

### Đơn giản hơn
- ❌ Trước: Phải truyền 4 params (year, month, day, dayOfWeek)
- ✅ Sau: Chỉ 1 param (date)

### Logic ở Backend
- ❌ Trước: Frontend phải tính dayOfWeek
- ✅ Sau: Backend tự động tính tuần

### Dễ dùng hơn
```typescript
// Lấy lịch tuần hiện tại
const today = new Date()
const dateParam = formatToyyyyMMdd(today.toISOString())
getWeeklySchedule(dateParam)

// Lấy lịch tuần trước
const lastWeek = new Date()
lastWeek.setDate(lastWeek.getDate() - 7)
getWeeklySchedule(formatToyyyyMMdd(lastWeek.toISOString()))
```

## ✅ Testing

Khi refresh trang `/admin/schedules`, check console:

```
📅 Schedule Dates: { startDate: "2025-12-16", endDate: "2025-12-22" }
📅 API Params: { dateParam: "20251216" }
🔥 Calling Weekly Schedule API: { startDate: "2025-12-16", endDate: "2025-12-22" }
✅ Weekly Schedule Response: { shifts: [...] }
📊 Weekly Schedule Data: { data: {...}, isLoading: false, error: null }
```

## 📁 Files Changed

1. `/lib/api/schedule.ts` - Sửa `getWeeklySchedule()` method
   - Format date thành `yyyyMMdd`
   - Gửi param `date` thay vì `year, month, day, dayOfWeek`

## 🎉 Kết quả

- ✅ API gọi thành công
- ✅ Response trả về đúng dates
- ✅ Adapter convert data thành công
- ✅ UI hiển thị lịch tuần đầy đủ 7 ngày

---
**Updated by**: Antigravity AI  
**Date**: 2025-12-18  
**Status**: ✅ Working with new API format
