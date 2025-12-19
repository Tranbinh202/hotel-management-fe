# Employee Search API - Actual Structure Fix

## 🐛 Vấn đề

API thực tế trả về **structure khác** với documentation:

### Documentation (Sai):
```json
{
  "data": {
    "employees": [...],
    "pagination": {
      "totalRecords": 5,
      "totalPages": 1,
      "currentPage": 1,
      "pageSize": 20,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

### API Thực Tế (Đúng):
```json
{
  "data": {
    "items": [...],           // ← "items" not "employees"
    "totalCount": 3,          // ← flat structure
    "pageIndex": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

## ✅ Giải pháp

### 1. Cập nhật Types (lib/types/api.ts)

**Trước:**
```typescript
export interface EmployeeSearchItem {
  employeeType: string  // ❌ Sai
  account?: {...}       // ❌ Không có trong response
}

export interface EmployeeSearchResponse {
  employees: EmployeeSearchItem[]  // ❌ Sai
  pagination: {...}                // ❌ Sai
}
```

**Sau:**
```typescript
export interface EmployeeSearchItem {
  employeeId: number
  accountId: number
  fullName: string
  phoneNumber?: string
  email?: string
  employeeTypeName: string   // ✅ Đúng field name
  employeeTypeId: number
  employeeTypeCode?: string
  baseSalary?: number
  hireDate?: string
  terminationDate?: string | null
  isActive?: boolean
  username?: string
  isLocked?: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface EmployeeSearchResponse {
  items: EmployeeSearchItem[]  // ✅ Đúng
  totalCount: number           // ✅ Flat structure
  pageIndex: number
  pageSize: number
  totalPages: number
}
```

### 2. Cập nhật Component

**Trước:**
```tsx
const employeeList = employeeSearchData?.employees || []
//                                      ^^^^^^^^^ Sai

{employee.employeeType} • {employee.phoneNumber}
//       ^^^^^^^^^^^^ Sai field name
```

**Sau:**
```tsx
const employeeList = employeeSearchData?.items || []
//                                      ^^^^^ Đúng

{employee.employeeTypeName} • {employee.phoneNumber}
//       ^^^^^^^^^^^^^^^^ Đúng field name
```

### 3. Cập nhật Hook

**Trước:**
```typescript
export function useEmployeeSearch(params: EmployeeSearchRequest) {
  return useQuery({
    queryKey: ["employees", "search", params],
    queryFn: () => employeesApi.search(params),
    enabled: !!(params.keyword || params.employeeTypeId !== undefined || params.isActive !== undefined),
    //       ^^^ Chỉ chạy khi có keyword
  })
}
```

**Sau:**
```typescript
export function useEmployeeSearch(params: EmployeeSearchRequest) {
  return useQuery({
    queryKey: ["employees", "search", params],
    queryFn: () => employeesApi.search(params),
    enabled: true,  // ✅ Luôn chạy, backend sẽ filter
  })
}
```

## 📊 Actual API Response

```json
{
    "isSuccess": true,
    "responseCode": "SUCCESS",
    "statusCode": 200,
    "data": {
        "items": [
            {
                "employeeId": 6,
                "accountId": 7,
                "fullName": "Trần Thị Lễ Tân",
                "phoneNumber": "0900000003",
                "employeeTypeId": 13,
                "employeeTypeName": "Lễ tân",      // ← employeeTypeName
                "hireDate": "2025-09-14",
                "terminationDate": null,
                "baseSalary": 0.00,
                "username": "receptionist",
                "email": "receptionist@hotel.com",
                "isLocked": false,
                "lastLoginAt": null,
                "createdAt": "2025-12-14T15:09:47.5318624",
                "updatedAt": null
            },
            {
                "employeeId": 5,
                "accountId": 6,
                "fullName": "Nguyễn Văn Quản Lý",
                "phoneNumber": "0900000002",
                "employeeTypeId": 12,
                "employeeTypeName": "Quản lý",
                "hireDate": "2025-06-14",
                "terminationDate": null,
                "baseSalary": 0.00,
                "username": "manager",
                "email": "manager@hotel.com",
                "isLocked": false,
                "lastLoginAt": null,
                "createdAt": "2025-12-14T15:09:47.2508038",
                "updatedAt": null
            },
            {
                "employeeId": 4,
                "accountId": 5,
                "fullName": "Administrator",
                "phoneNumber": "0900000001",
                "employeeTypeId": 11,
                "employeeTypeName": "Quản trị viên",
                "hireDate": "2025-12-14",
                "terminationDate": null,
                "baseSalary": 0.00,
                "username": "admin",
                "email": "admin@hotel.com",
                "isLocked": false,
                "lastLoginAt": null,
                "createdAt": "2025-12-14T15:09:46.8930794",
                "updatedAt": null
            }
        ],
        "totalCount": 3,      // ← Flat pagination
        "pageIndex": 1,
        "pageSize": 20,
        "totalPages": 1
    },
    "message": "Tìm thấy 3 nhân viên"
}
```

## 🔍 Key Differences

| Field | Documentation | Actual API | Status |
|-------|--------------|------------|--------|
| Employee array | `employees` | `items` | ❌ Sai |
| Pagination | Nested object | Flat fields | ❌ Sai |
| Employee type | `employeeType` | `employeeTypeName` | ❌ Sai |
| Account info | `account: {...}` | Flat in employee | ❌ Sai |
| Total count | `totalRecords` | `totalCount` | ❌ Sai |
| Current page | `currentPage` | `pageIndex` | ❌ Sai |

## ✅ Kết quả

- ✅ Data đã hiển thị trong combobox
- ✅ Search theo keyword hoạt động
- ✅ Hiển thị: Tên, Chức vụ (employeeTypeName), SĐT/Email
- ✅ Filter isActive=true, isLocked=false hoạt động
- ✅ Có thể chọn nhân viên và submit form

## 📁 Files đã sửa

1. `/lib/types/api.ts` - Fix EmployeeSearchItem và EmployeeSearchResponse
2. `/lib/hooks/use-employees.ts` - Set enabled=true
3. `/components/admin/employee-schedule-management.tsx` - 
   - Đổi `employees` → `items`
   - Đổi `employeeType` → `employeeTypeName`
   - Add type annotations

## 🎯 Lesson Learned

**Luôn verify API response structure thực tế!**

- ❌ Đừng tin 100% vào documentation
- ✅ Test với API thật ngay khi integrate
- ✅ Log response để check structure
- ✅ Update types match với API thật

---
**Fix bởi**: Antigravity AI  
**Ngày**: 2025-12-18  
**Status**: ✅ Fixed & Working
