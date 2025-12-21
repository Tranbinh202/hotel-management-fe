# Employee Search API Integration

## 📝 Tóm tắt

Đã tích hợp **Employee Search API** vào trang quản lý lịch làm việc để cải thiện UX khi thêm/sửa lịch cho nhân viên.

## ✅ Cải tiến

### 1. **Tìm kiếm nhân viên thông minh**
- ✅ Thay thế dropdown tĩnh bằng Combobox có search
- ✅ Tìm kiếm theo tên, số điện thoại, email realtime
- ✅ Chỉ hiển thị nhân viên đang làm việc (isActive=true)
- ✅ Lọc nhân viên không bị khóa tài khoản (isLocked=false)
- ✅ Hiện thị thông tin: Tên, Chức vụ, SĐT/Email

### 2. **Hiển thị ngày rõ ràng**
- ✅ Fix date display: Ngày bị lệch khi click "Thêm"
- ✅ Modal header hiện: "Tạo lịch làm việc mới cho ngày 18/12/2025"
- ✅ Hiển thị ca làm việc: "Ca Sáng (08:00:00 - 16:00:00)"
- ✅ User biết chính xác đang thêm lịch cho ngày nào, ca nào

## 🔧 Thay đổi kỹ thuật

### 1. Types (lib/types/api.ts)
```typescript
// Employee Search Request
export interface EmployeeSearchRequest {
  keyword?: string              // Tìm theo tên, SĐT, email
  employeeTypeId?: number      // Lọc theo loại nhân viên
  isActive?: boolean           // Chỉ lấy nhân viên đang làm
  isLocked?: boolean           // Lọc theo trạng thái khóa
  pageIndex?: number
  pageSize?: number
}

// Employee Search Response
export interface EmployeeSearchResponse {
  employees: EmployeeSearchItem[]
  pagination: {
    totalRecords: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
```

### 2. API Client (lib/api/employees.ts)
```typescript
export const employeesApi = {
  // ...existing methods
  
  // NEW: Search employees with filters
  search: async (params: EmployeeSearchRequest): Promise<EmployeeSearchResponse> => {
    const response = await apiClient.get<ApiResponse<EmployeeSearchResponse>>(
      "/Employee/search",
      { params: queryParams }
    );
    return response.data;
  },
}
```

### 3. Hook (lib/hooks/use-employees.ts)
```typescript
// NEW: Hook for employee search
export function useEmployeeSearch(params: EmployeeSearchRequest) {
  return useQuery({
    queryKey: ["employees", "search", params],
    queryFn: () => employeesApi.search(params),
    enabled: !!(params.keyword || params.employeeTypeId !== undefined || params.isActive !== undefined),
  })
}
```

### 4. Component Updates

#### State thêm vào:
```typescript
const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
const [employeeSearchKeyword, setEmployeeSearchKeyword] = useState("")
```

#### Sử dụng Employee Search:
```typescript
const { data: employeeSearchData, isLoading: isSearchingEmployees } = useEmployeeSearch({
  keyword: employeeSearchKeyword,
  isActive: true,
  isLocked: false,
  pageSize: 20,
})

const employeeList = employeeSearchData?.employees || []
```

#### Searchable Combobox UI:
```tsx
<Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox">
      {formData.employeeId
        ? employeeList.find(emp => emp.employeeId === formData.employeeId)?.fullName
        : "Tìm kiếm nhân viên..."}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput 
        placeholder="Tìm theo tên, số điện thoại..."
        value={employeeSearchKeyword}
        onValueChange={setEmployeeSearchKeyword}
      />
      <CommandList>
        {employeeList.map((employee) => (
          <CommandItem onSelect={() => setFormData({...formData, employeeId: employee.employeeId})}>
            <div className="flex flex-col">
              <span className="font-medium">{employee.fullName}</span>
              <span className="text-xs text-muted-foreground">
                {employee.employeeType} • {employee.phoneNumber || employee.email}
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

## 📊 API Endpoint

**Endpoint**: `GET /api/Employee/search`

**Query Parameters**:
- `keyword` - Tìm theo tên, SĐT, email, username
- `employeeTypeId` - Lọc theo loại nhân viên
- `isActive` - true = đang làm việc, false = đã nghỉ
- `isLocked` - true = bị khóa, false = không khóa
- `pageIndex` - Trang (mặc định: 1)
- `pageSize` - Số bản ghi (mặc định: 10, tối đa: 100)

**Example Request**:
```http
GET /api/Employee/search?keyword=nguyen&isActive=true&isLocked=false&pageSize=20
Authorization: Bearer {token}
```

**Example Response**:
```json
{
  "isSuccess": true,
  "data": {
    "employees": [
      {
        "employeeId": 5,
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0987654321",
        "email": "nguyenvana@hotel.com",
        "employeeType": "Lễ tân",
        "employeeTypeId": 3,
        "employeeTypeCode": "Receptionist",
        "isActive": true,
        "avatar": "https://..."
      }
    ],
    "pagination": {
      "totalRecords": 5,
      "currentPage": 1,
      "pageSize": 20,
      "hasNextPage": false
    }
  }
}
```

## 🎯 Use Cases

### Case 1: Tìm nhân viên theo tên
```typescript
useEmployeeSearch({
  keyword: "nguyen",
  isActive: true,
  pageSize: 10
})
```

### Case 2: Tìm Lễ tân đang làm việc
```typescript
useEmployeeSearch({
  employeeTypeId: 3,  // Lễ tân
  isActive: true,
  isLocked: false
})
```

### Case 3: Tìm theo số điện thoại
```typescript
useEmployeeSearch({
  keyword: "0987654321",
  isActive: true
})
```

## 🌟 Cải thiện UX

### Trước:
- ❌ Dropdown tĩnh với tất cả nhân viên
- ❌ Khó tìm nhân viên khi danh sách dài
- ❌ Không biết đang thêm lịch cho ngày nào
- ❌ Hiển thị cả nhân viên đã nghỉ, bị khóa

### Sau:
- ✅ Combobox có search realtime
- ✅ Tìm kiếm nhanh theo tên/SĐT
- ✅ Modal header hiển thị rõ: "Ngày 18/12/2025 - Ca Sáng"
- ✅ Chỉ hiển thị nhân viên đang làm việc, không bị khóa
- ✅ Hiện thông tin chi tiết: Chức vụ, SĐT/Email

## 📁 Files thay đổi

1. `/lib/types/api.ts` - Thêm EmployeeSearchRequest, EmployeeSearchResponse
2. `/lib/api/employees.ts` - Thêm search() method
3. `/lib/hooks/use-employees.ts` - Thêm useEmployeeSearch() hook
4. `/components/admin/employee-schedule-management.tsx` - UI updates:
   - Thêm employee search combobox
   - Fix date display
   - Hiển thị ngày/ca trong modal header

## 🚀 Demo

### Tìm kiếm nhân viên:
```
User gõ: "nguyen" 
→ API call: GET /api/Employee/search?keyword=nguyen&isActive=true&isLocked=false
→ Results: Hiện danh sách nhân viên có tên chứa "nguyen"
→ User chọn → Form cập nhật employeeId
```

### Hiển thị ngày:
```
User click nút "Thêm" ở ô 18/12/2025 - Ca Sáng
→ Modal mở với header: 
   "Tạo lịch làm việc mới cho ngày 18/12/2025"
   "Ca Sáng (08:00:00 - 16:00:00)"
→ User biết rõ đang thêm lịch cho ai, ngày nào, ca nào
```

## ✅ Testing

### Test cases đã verify:
- [x] Search nhân viên theo tên hoạt động
- [x] Search theo số điện thoại hoạt động
- [x] Chỉ hiện nhân viên isActive=true
- [x] Không hiện nhân viên bị khóa
- [x] Date hiển thị đúng format DD/MM/YYYY
- [x] Modal header hiện đúng ngày và ca
- [x] Combobox có thể đóng/mở
- [x] Selected employee hiển thị đúng
- [x] Submit form với employee đã chọn

---
**Tích hợp bởi**: Antigravity AI  
**Ngày**: 2025-12-18  
**Status**: ✅ Complete & Ready for Production
