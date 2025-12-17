# Dashboard API Requirements - Yêu cầu Backend APIs

## 🎯 Mục đích
Tài liệu này mô tả các API cần thiết để ghép nối màn hình Dashboard admin của hệ thống quản lý khách sạn.

## 📌 Các API cần triển khai

---

## 1️⃣ GET /Dashboard/stats (BẮT BUỘC - Ưu tiên cao nhất)

### Mô tả
Trả về toàn bộ thống kê tổng quan cho Dashboard, bao gồm dữ liệu về bookings, doanh thu, khách hàng, phòng và giao dịch.

### Request
```http
GET /Dashboard/stats
Authorization: Bearer {token}
```

### Response Schema
```typescript
{
  "data": {
    // === THỐNG KÊ BOOKING ===
    "totalBookings": number,          // Tổng số booking (all time)
    "bookingsThisMonth": number,      // Số booking tháng này
    "bookingsLastMonth": number,      // Số booking tháng trước
    "bookingsGrowth": number,         // % tăng trưởng (ví dụ: 15.8)

    // === THỐNG KÊ DOANH THU ===
    "totalRevenue": number,           // Tổng doanh thu (VNĐ) (all time)
    "revenueThisMonth": number,       // Doanh thu tháng này (VNĐ)
    "revenueLastMonth": number,       // Doanh thu tháng trước (VNĐ)
    "revenueGrowth": number,          // % tăng trưởng (ví dụ: 11.6)
    "averageRoomRate": number,        // Giá TB mỗi đêm (VNĐ)

    // === THỐNG KÊ KHÁCH HÀNG ===
    "totalCustomers": number,         // Tổng số khách hàng
    "newCustomersThisMonth": number,  // Khách mới tháng này
    "customersGrowth": number,        // % tăng trưởng (ví dụ: 6.5)

    // === THỐNG KÊ PHÒNG ===
    "totalRooms": number,             // Tổng số phòng trong hệ thống
    "availableRooms": number,         // Số phòng trống (available)
    "occupiedRooms": number,          // Số phòng đang sử dụng (occupied)
    "maintenanceRooms": number,       // Số phòng đang bảo trì (maintenance)
    "occupancyRate": number,          // Tỷ lệ lấp phòng % (ví dụ: 56.7)

    // === THỐNG KÊ GIAO DỊCH ===
    "totalTransactions": number,      // Tổng số giao dịch
    "completedPayments": number,      // Số giao dịch đã thanh toán
    "pendingPayments": number         // Số giao dịch chờ thanh toán
  },
  "success": true,
  "message": "Get statistics successfully"
}
```

### Response Example
```json
{
  "data": {
    "totalBookings": 95,
    "bookingsThisMonth": 22,
    "bookingsLastMonth": 19,
    "bookingsGrowth": 15.8,

    "totalRevenue": 12500000,
    "revenueThisMonth": 4800000,
    "revenueLastMonth": 4300000,
    "revenueGrowth": 11.6,
    "averageRoomRate": 850000,

    "totalCustomers": 28,
    "newCustomersThisMonth": 4,
    "customersGrowth": 6.5,

    "totalRooms": 30,
    "availableRooms": 10,
    "occupiedRooms": 17,
    "maintenanceRooms": 3,
    "occupancyRate": 56.7,

    "totalTransactions": 100,
    "completedPayments": 93,
    "pendingPayments": 7
  },
  "success": true,
  "message": "Get statistics successfully"
}
```

### Lưu ý tính toán
- `bookingsGrowth = ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100`
- `revenueGrowth = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100`
- `occupancyRate = (occupiedRooms / totalRooms) * 100`
- Các giá trị growth có thể âm (giảm so với tháng trước)

### Hiển thị trên UI
API này cung cấp dữ liệu cho:
- ✅ 4 StatCard chính (Tổng đặt phòng, Doanh thu, Khách hàng, Tỷ lệ lấp phòng)
- ✅ Card "Tình trạng phòng" (available, occupied, maintenance)
- ✅ Card "Giao dịch & Thanh toán"
- ✅ 3 Card thống kê bổ sung

### Caching
- Frontend sẽ tự động refetch mỗi **60 giây** (1 phút)
- Backend nên cache kết quả để tối ưu performance

---

## 2️⃣ GET /Booking/management (BẮT BUỘC - Ưu tiên cao)

### Mô tả
Lấy danh sách booking để hiển thị trong section "Đặt phòng gần đây" (5 booking mới nhất).

### Request
```http
GET /Booking/management?pageNumber=1&pageSize=10
Authorization: Bearer {token}
```

### Query Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| pageNumber | number | Yes | Số trang (default: 1) |
| pageSize | number | Yes | Số items mỗi trang (default: 10) |

### Response Schema
```typescript
{
  "data": {
    "items": [
      {
        "bookingId": number,
        "user": {
          "firstName": string,
          "lastName": string
        },
        "checkInDate": string,        // ISO 8601 format
        "checkOutDate": string,       // ISO 8601 format
        "totalAmount": number,        // VNĐ
        "status": "confirmed" | "pending" | "cancelled" | "completed"
      }
    ],
    "pageNumber": number,
    "pageSize": number,
    "totalPages": number,
    "totalCount": number
  },
  "success": true,
  "message": "Get bookings successfully"
}
```

### Response Example
```json
{
  "data": {
    "items": [
      {
        "bookingId": 1,
        "user": {
          "firstName": "Nguyễn",
          "lastName": "Văn A"
        },
        "checkInDate": "2024-01-15T00:00:00",
        "checkOutDate": "2024-01-18T00:00:00",
        "totalAmount": 2550000,
        "status": "confirmed"
      },
      {
        "bookingId": 2,
        "user": {
          "firstName": "Trần",
          "lastName": "Thị B"
        },
        "checkInDate": "2024-01-16T00:00:00",
        "checkOutDate": "2024-01-20T00:00:00",
        "totalAmount": 3400000,
        "status": "pending"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 1,
    "totalCount": 5
  },
  "success": true,
  "message": "Get bookings successfully"
}
```

### Booking Status Mapping
| Status | Tiếng Việt | Màu hiển thị |
|--------|-----------|--------------|
| `confirmed` | Đã xác nhận | Xanh lá (green) |
| `pending` | Chờ xác nhận | Vàng (yellow) |
| `cancelled` | Đã hủy | Đỏ (red) |
| `completed` | Hoàn thành | Xanh dương (blue) |

### Sắp xếp
- Sắp xếp theo thời gian tạo booking, **mới nhất trước** (DESC)
- Frontend sẽ chỉ lấy 5 items đầu tiên để hiển thị

### Hiển thị trên UI
- ✅ Component "Đặt phòng gần đây" (RecentBookings)
- Hiển thị: Tên khách, ngày check-in/out, tổng tiền, trạng thái

---

## 3️⃣ GET /Dashboard/room-status (OPTIONAL - Ưu tiên trung bình)

### Mô tả
Trả về thống kê chi tiết về tình trạng phòng. **Lưu ý:** Dữ liệu này có thể tính toán từ API `/Dashboard/stats`, nên không bắt buộc phải implement riêng.

### Request
```http
GET /Dashboard/room-status
Authorization: Bearer {token}
```

### Response Schema
```typescript
{
  "data": [
    {
      "status": "available" | "occupied" | "maintenance",
      "count": number,
      "percentage": number
    }
  ],
  "success": true,
  "message": "Get room status successfully"
}
```

### Response Example
```json
{
  "data": [
    {
      "status": "available",
      "count": 10,
      "percentage": 33.3
    },
    {
      "status": "occupied",
      "count": 17,
      "percentage": 56.7
    },
    {
      "status": "maintenance",
      "count": 3,
      "percentage": 10.0
    }
  ],
  "success": true,
  "message": "Get room status successfully"
}
```

### Caching
- Frontend sẽ tự động refetch mỗi **30 giây**

### Hiển thị trên UI
- ✅ Card "Tình trạng phòng"

**Ghi chú:** Hiện tại frontend đang dùng data từ `/Dashboard/stats` nên API này có thể skip trong giai đoạn đầu.

---

## 4️⃣ GET /Dashboard/revenue-by-month (OPTIONAL - Ưu tiên thấp)

### Mô tả
Lấy dữ liệu doanh thu theo từng tháng để vẽ biểu đồ. API này đã được tích hợp hook nhưng **chưa được sử dụng** trên UI hiện tại.

### Request
```http
GET /Dashboard/revenue-by-month?months=12
Authorization: Bearer {token}
```

### Query Parameters
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| months | number | 12 | Số tháng muốn lấy |

### Response Schema
```typescript
{
  "data": [
    {
      "month": string,      // "01", "02", ..., "12"
      "year": number,       // 2024
      "revenue": number,    // VNĐ
      "bookings": number    // Số booking trong tháng
    }
  ],
  "success": true,
  "message": "Get revenue by month successfully"
}
```

### Response Example
```json
{
  "data": [
    {
      "month": "12",
      "year": 2023,
      "revenue": 3500000,
      "bookings": 18
    },
    {
      "month": "01",
      "year": 2024,
      "revenue": 4800000,
      "bookings": 22
    },
    {
      "month": "02",
      "year": 2024,
      "revenue": 5200000,
      "bookings": 25
    }
  ],
  "success": true,
  "message": "Get revenue by month successfully"
}
```

### Sử dụng cho
- Biểu đồ doanh thu theo tháng (tính năng mở rộng trong tương lai)

---

## 5️⃣ GET /Dashboard/top-room-types (OPTIONAL - Ưu tiên thấp)

### Mô tả
Lấy danh sách các loại phòng có doanh thu cao nhất. API này đã được tích hợp hook nhưng **chưa được sử dụng** trên UI hiện tại.

### Request
```http
GET /Dashboard/top-room-types?limit=5
Authorization: Bearer {token}
```

### Query Parameters
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 5 | Số lượng loại phòng muốn lấy |

### Response Schema
```typescript
{
  "data": [
    {
      "roomTypeId": number,
      "typeName": string,
      "totalBookings": number,
      "totalRevenue": number,     // VNĐ
      "averagePrice": number      // VNĐ
    }
  ],
  "success": true,
  "message": "Get top room types successfully"
}
```

### Response Example
```json
{
  "data": [
    {
      "roomTypeId": 1,
      "typeName": "Deluxe",
      "totalBookings": 45,
      "totalRevenue": 6800000,
      "averagePrice": 850000
    },
    {
      "roomTypeId": 2,
      "typeName": "Suite",
      "totalBookings": 28,
      "totalRevenue": 5600000,
      "averagePrice": 1200000
    }
  ],
  "success": true,
  "message": "Get top room types successfully"
}
```

### Sắp xếp
- Sắp xếp theo `totalRevenue` giảm dần (DESC)

### Sử dụng cho
- Thống kê loại phòng phổ biến (tính năng mở rộng trong tương lai)

---

## 📊 Tổng kết mức độ ưu tiên

| API Endpoint | Trạng thái | Ưu tiên | Ghi chú |
|-------------|-----------|---------|---------|
| `GET /Dashboard/stats` | ✅ Đang dùng | **CAO NHẤT** | API chính, cung cấp toàn bộ stats |
| `GET /Booking/management` | ✅ Đang dùng | **CAO** | Hiển thị booking gần đây |
| `GET /Dashboard/room-status` | ⚠️ Đang dùng | TRUNG BÌNH | Có thể tính từ stats API |
| `GET /Dashboard/revenue-by-month` | ❌ Chưa dùng | THẤP | Cho biểu đồ (tương lai) |
| `GET /Dashboard/top-room-types` | ❌ Chưa dùng | THẤP | Cho thống kê (tương lai) |

---

## 🔐 Authentication

Tất cả các API đều yêu cầu:
- Header: `Authorization: Bearer {access_token}`
- Role: `Admin` hoặc `Manager`

---

## 🎨 UI Reference

### Màn hình hiện tại
- **Location:** `app/admin/dashboard/page.tsx`
- **Components:**
  - `StatCard` - Thẻ thống kê với icon và trend
  - `RecentBookings` - Danh sách booking gần đây
  - Card "Tình trạng phòng"
  - Card "Giao dịch & Thanh toán"

### Mock Data hiện tại
File `page.tsx` line 44-65 đang sử dụng mock data. Sau khi Backend hoàn thành API, mock data này sẽ được thay thế bằng data thật từ API.

---

## 🚀 Roadmap triển khai

### Phase 1 - MVP (Bắt buộc)
1. ✅ `GET /Dashboard/stats`
2. ✅ `GET /Booking/management`

### Phase 2 - Enhancement (Tùy chọn)
3. `GET /Dashboard/room-status`

### Phase 3 - Future Features (Trong tương lai)
4. `GET /Dashboard/revenue-by-month` - Cho biểu đồ
5. `GET /Dashboard/top-room-types` - Cho thống kê chi tiết

---

## 📞 Liên hệ

Nếu có thắc mắc về API spec, vui lòng liên hệ team Frontend để làm rõ.

**Code References:**
- Dashboard Page: [app/admin/dashboard/page.tsx](../app/admin/dashboard/page.tsx)
- API Client: [lib/api/dashboard.ts](../lib/api/dashboard.ts)
- Type Definitions: [lib/types/api.ts](../lib/types/api.ts)
