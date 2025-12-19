# Employee Type Filter - Implementation

## ✅ Feature Added

Thêm filter theo loại nhân viên (Employee Type) vào trang quản lý lịch làm việc.

## 🎯 Functionality

User có thể lọc lịch làm việc theo loại nhân viên:
- **Tất cả** - Hiển thị tất cả nhân viên
- **Lễ tân** - Chỉ hiển thị lịch của Lễ tân
- **Quản lý** - Chỉ hiển thị lịch của Quản lý
- **Quản trị viên** - Chỉ hiển thị lịch của Quản trị viên
- ...và các loại khác từ CommonCode

## 📦 Changes Made

### 1. API Layer (`lib/api/schedule.ts`)
```typescript
// Added employeeTypeId parameter
getWeeklySchedule: async (
  startDate: string, 
  endDate: string, 
  employeeTypeId?: number  // ← NEW
): Promise<WeeklyScheduleData> => {
  const formData = new FormData()
  formData.append('fromDate', fromDate)
  formData.append('toDate', toDate)
  if (employeeTypeId) {
    formData.append('employeeTypeId', employeeTypeId.toString())
  }
  // ...
}
```

### 2. Hook Layer (`lib/hooks/use-schedule.ts`)
```typescript
// Updated hook signature
export function useWeeklySchedule(
  startDate: string, 
  endDate: string, 
  employeeTypeId?: number  // ← NEW
) {
  return useQuery({
    queryKey: ["weekly-schedule", startDate, endDate, employeeTypeId],
    queryFn: () => scheduleApi.getWeeklySchedule(startDate, endDate, employeeTypeId),
    enabled: !!startDate && !!endDate,
  })
}
```

### 3. UI Component (`components/admin/employee-schedule-management.tsx`)

#### Added State:
```typescript
const [selectedEmployeeTypeId, setSelectedEmployeeTypeId] = useState<number | undefined>(undefined)
```

#### Fetch Employee Types:
```typescript
const { data: employeeTypes = [] } = useQuery({
  queryKey: ["commonCodes", "EmployeeType"],
  queryFn: async () => {
    const { commonCodeApi } = await import("@/lib/api/common-code")
    return commonCodeApi.getByType("EmployeeType", true)
  },
  staleTime: 5 * 60 * 1000,
})
```

#### Pass Filter to API:
```typescript
const { data: weeklyScheduleData } = useWeeklySchedule(
  startDate, 
  endDate,
  selectedEmployeeTypeId  // ← Filter applied
)
```

#### Filter UI:
```tsx
<div className="flex items-center gap-3">
  <label className="text-sm font-medium">Lọc theo loại nhân viên:</label>
  <Select
    value={selectedEmployeeTypeId?.toString() || "all"}
    onValueChange={(value) => 
      setSelectedEmployeeTypeId(value === "all" ? undefined : parseInt(value))
    }
  >
    <SelectTrigger className="w-[200px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tất cả</SelectItem>
      {employeeTypes.map((type) => (
        <SelectItem key={type.commonCodeId} value={type.commonCodeId.toString()}>
          {type.commonCodeValue}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

## 🔄 How It Works

1. **Component loads** → Fetch employee types từ CommonCode API
2. **User selects filter** → `selectedEmployeeTypeId` được update
3. **useWeeklySchedule re-runs** → Gọi API với `employeeTypeId`
4. **Backend filters** → Chỉ trả về schedules của employee type đó
5. **UI updates** → Calendar chỉ hiển thị schedules đã filter

## 📊 API Request Example

### Without Filter (All employees):
```http
POST /api/schedule/schedules
Content-Type: multipart/form-data

fromDate: 20251216
toDate: 20251222
```

### With Filter (Only "Lễ tân"):
```http
POST /api/schedule/schedules
Content-Type: multipart/form-data

fromDate: 20251216
toDate: 20251222
employeeTypeId: 13  ← Filter parameter
```

## 🎯 User Flow

```
User opens /admin/schedules
  ↓
Sees dropdown: "Lọc theo loại nhân viên: Tất cả"
  ↓
Clicks dropdown → Sees: Tất cả, Lễ tân, Quản lý, Quản trị viên
  ↓
Selects "Lễ tân"
  ↓
API called với employeeTypeId = 13
  ↓
Calendar refreshes → Chỉ hiện schedules của Lễ tân
  ↓
User selects "Tất cả"
  ↓
API called không có employeeTypeId
  ↓
Calendar hiện tất cả schedules
```

## ✅ Benefits

1. **Better Visibility** - Dễ xem lịch một loại nhân viên cụ thể
2. **Faster Navigation** - Không bị distract bởi schedules không liên quan
3. **Backend Filtering** - Không cần filter ở client, performance tốt hơn
4. **Dynamic Options** - Dropdown tự động populate từ CommonCode

## 🧪 Testing

### Test Cases:
- [x] Dropdown hiển thị tất cả employee types
- [x] Select "Tất cả" → Hiển thị tất cả schedules
- [x] Select specific type → Chỉ hiển thị schedules của type đó
- [x] API gửi đúng employeeTypeId
- [x] Backend filter hoạt động
- [x] Switch giữa các filters → UI update ngay lập tức

### Console Logs:
```
📅 Schedule Dates: { 
  startDate: "2025-12-16", 
  endDate: "2025-12-22", 
  employeeTypeId: 13 
}
📅 API Params: { 
  fromDate: "20251216", 
  toDate: "20251222", 
  employeeTypeId: 13 
}
```

## 📁 Files Modified

1. `/lib/api/schedule.ts` - Added employeeTypeId param
2. `/lib/hooks/use-schedule.ts` - Updated hook signature
3. `/components/admin/employee-schedule-management.tsx` - Added filter UI & state

## 🚀 Production Ready

- ✅ Type-safe with TypeScript
- ✅ React Query caching
- ✅ Dynamic CommonCode integration
- ✅ Clean UI/UX
- ✅ Backend filtering (performant)

---
**Feature by**: Antigravity AI  
**Date**: 2025-12-18  
**Status**: ✅ Complete & Working
