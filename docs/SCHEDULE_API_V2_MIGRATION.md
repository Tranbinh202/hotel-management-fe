# Schedule API v2.0 - Breaking Changes

## 🔄 API Version Update

### Old API (v1.0) - KHÔNG DÙNG NỮA
```
GET /api/Schedule/weekly?date=20251214
```

### New API (v2.0) - HIỆN TẠI
```
POST /api/schedule/schedules
Content-Type: multipart/form-data

fromDate=20251216
toDate=20251222
```

## 📝 Chi tiết thay đổi

### 1. HTTP Method
- ❌ Old: `GET`
- ✅ New: `POST`

### 2. Endpoint Path
- ❌ Old: `/api/Schedule/weekly`
- ✅ New: `/api/schedule/schedules`

### 3. Request Format
- ❌ Old: Query params - single `date`
- ✅ New: Form-data - `fromDate` và `toDate`

### 4. Date Format
- ✅ Giữ nguyên: `yyyyMMdd` (VD: `20251216`)

### 5. Logic
- ❌ Old: Backend tự tính tuần từ 1 ngày
- ✅ New: Frontend gửi cả `fromDate` và `toDate`

## ✅ Code Changes

### API Client (`lib/api/schedule.ts`)

**Trước (v1.0)**:
```typescript
getWeeklySchedule: async (startDate: string, endDate: string) => {
  const date = new Date(startDate)
  const dateParam = `${year}${month}${day}` // 20251214
  
  const response = await apiClient.get("/Schedule/weekly", {
    params: { date: dateParam }
  })
  return response.data
}
```

**Sau (v2.0)**:
```typescript
getWeeklySchedule: async (startDate: string, endDate: string) => {
  // Format both dates
  const fromDate = formatDate(startDate)  // 20251216
  const toDate = formatDate(endDate)      // 20251222
  
  // Create form-data
  const formData = new FormData()
  formData.append('fromDate', fromDate)
  formData.append('toDate', toDate)
  
  // POST request
  const response = await apiClient.post("/schedule/schedules", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}
```

### Helper Function
```typescript
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}
```

## 📊 Request/Response Examples

### Request
```bash
curl -X POST "http://localhost:8080/api/schedule/schedules" \
  -H "Authorization: Bearer TOKEN" \
  -F "fromDate=20251216" \
  -F "toDate=20251222"
```

### Response (Unchanged)
Response structure giữ nguyên:
```json
{
  "isSuccess": true,
  "data": {
    "shifts": [
      {
        "shiftName": "Ca Sáng (06:00 - 14:00)",
        "startTime": "06:00:00",
        "endTime": "14:00:00",
        "dailySchedules": [
          {
            "shiftDate": "2025-12-16",
            "dayOfWeek": "Thứ 2",
            "employees": [...]
          }
        ]
      }
    ]
  }
}
```

## 🎯 Component Usage

Component **KHÔNG CẦN THAY ĐỔI**:

```typescript
// Component vẫn truyền startDate và endDate như cũ
const startDate = weekDates[0].toISOString().split("T")[0]  // "2025-12-16"
const endDate = weekDates[6].toISOString().split("T")[0]    // "2025-12-22"

// Hook vẫn dùng như cũ
const { data } = useWeeklySchedule(startDate, endDate)

// API client tự động format và gọi đúng endpoint mới
```

## 🔍 Why This Change?

### Benefits of v2.0
1. **Linh hoạt hơn**: Có thể lấy lịch cho bất kỳ khoảng thời gian nào (không chỉ tuần)
2. **Rõ ràng hơn**: Frontend control cả startDate và endDate
3. **Mở rộng**: Có thể query theo tháng, quý, v.v.

### Migration Impact
- ✅ **Component**: Không cần sửa
- ✅ **Hook**: Không cần sửa
- ✅ **API Client**: Đã update
- ✅ **Adapter**: Vẫn dùng được

## 🚀 Testing

### Console Logs
Khi refresh trang, sẽ thấy:
```
📅 Schedule Dates: { startDate: "2025-12-16", endDate: "2025-12-22" }
📅 API Params: { fromDate: "20251216", toDate: "20251222" }
🔥 Calling Schedule API: { startDate: "2025-12-16", endDate: "2025-12-22" }
✅ Schedule Response: { shifts: [...] }
```

### Network Tab
```
Request URL: http://localhost:8080/api/schedule/schedules
Request Method: POST
Content-Type: multipart/form-data

Form Data:
  fromDate: 20251216
  toDate: 20251222
```

## ⚠️ Breaking Changes Summary

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| Method | GET | POST |
| Endpoint | /Schedule/weekly | /schedule/schedules |
| Param | date (single) | fromDate & toDate |
| Format | Query string | Form-data |
| Logic | Backend tính tuần | Frontend control range |

## 📁 Files Changed

1. `/lib/api/schedule.ts` - Completely rewritten `getWeeklySchedule()`
   - Changed from GET to POST
   - Changed endpoint path
   - Use FormData instead of query params
   - Format both startDate and endDate

## ✅ Verification

Để verify migration thành công:

1. **Check console logs** - Thấy "📅 API Params: { fromDate: ..., toDate: ... }"
2. **Check network tab** - Request là POST với form-data
3. **Check data** - Lịch hiển thị đầy đủ 7 ngày
4. **Test navigation** - Chuyển tuần hoạt động OK

---
**Updated by**: Antigravity AI  
**Date**: 2025-12-18  
**Version**: 2.0  
**Status**: ✅ Updated & Working
