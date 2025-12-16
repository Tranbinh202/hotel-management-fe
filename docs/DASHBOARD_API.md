# API Dashboard - Danh sách các endpoint cần thiết

## Tổng quan
Màn hình Dashboard hiển thị thống kê tổng quan về hoạt động của khách sạn, bao gồm: booking, doanh thu, khách hàng, tình trạng phòng và giao dịch.

## 1. API Thống kê Dashboard
**Endpoint:** `GET /Dashboard/stats`

**Mô tả:** Lấy toàn bộ thống kê tổng quan cho dashboard

**Response:**
```json
{
  "data": {
    "totalBookings": 95,
    "totalRevenue": 12500000,
    "totalCustomers": 28,
    "newCustomersThisMonth": 4,
    "totalRooms": 30,
    "availableRooms": 10,
    "occupiedRooms": 17,
    "maintenanceRooms": 3,
    "occupancyRate": 56.7,
    "averageRoomRate": 850000,
    "totalTransactions": 100,
    "pendingPayments": 7,
    "completedPayments": 93,
    "revenueThisMonth": 4800000,
    "revenueLastMonth": 4300000,
    "revenueGrowth": 11.6,
    "bookingsThisMonth": 22,
    "bookingsLastMonth": 19,
    "bookingsGrowth": 15.8,
    "customersGrowth": 6.5
  },
  "success": true,
  "message": "Get statistics successfully"
}
```

**Các trường dữ liệu:**

### Thống kê Booking
- `totalBookings`: Tổng số booking tất cả thời gian
- `bookingsThisMonth`: Số booking tháng hiện tại
- `bookingsLastMonth`: Số booking tháng trước
- `bookingsGrowth`: % tăng trưởng booking so với tháng trước

### Thống kê Doanh thu
- `totalRevenue`: Tổng doanh thu tất cả thời gian (VNĐ)
- `revenueThisMonth`: Doanh thu tháng hiện tại (VNĐ)
- `revenueLastMonth`: Doanh thu tháng trước (VNĐ)
- `revenueGrowth`: % tăng trưởng doanh thu so với tháng trước
- `averageRoomRate`: Giá phòng trung bình mỗi đêm (VNĐ)

### Thống kê Khách hàng
- `totalCustomers`: Tổng số khách hàng
- `newCustomersThisMonth`: Số khách hàng mới tháng này
- `customersGrowth`: % tăng trưởng khách hàng

### Thống kê Phòng
- `totalRooms`: Tổng số phòng
- `availableRooms`: Số phòng trống (sẵn sàng)
- `occupiedRooms`: Số phòng đang sử dụng
- `maintenanceRooms`: Số phòng đang bảo trì
- `occupancyRate`: Tỷ lệ lấp phòng (%)

### Thống kê Giao dịch
- `totalTransactions`: Tổng số giao dịch
- `completedPayments`: Số giao dịch đã thanh toán
- `pendingPayments`: Số giao dịch chờ thanh toán

**Sử dụng cho:**
- 4 StatCard chính (Tổng đặt phòng, Doanh thu tháng, Khách hàng, Tỷ lệ lấp phòng)
- Card "Tình trạng phòng"
- Card "Giao dịch & Thanh toán"
- 3 Card thống kê bổ sung (Giá phòng TB, Booking tháng này, Lợi nhuận tháng)

**Auto refetch:** Mỗi 60 giây (1 phút)

---

## 2. API Tình trạng phòng
**Endpoint:** `GET /Dashboard/room-status`

**Mô tả:** Lấy tổng hợp tình trạng phòng theo từng trạng thái

**Response:**
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

**Các trạng thái phòng:**
- `available`: Phòng trống, sẵn sàng cho khách
- `occupied`: Phòng đang có khách sử dụng
- `maintenance`: Phòng đang bảo trì

**Sử dụng cho:** Card "Tình trạng phòng" (hiện tại đang dùng data từ `/Dashboard/stats`)

**Auto refetch:** Mỗi 30 giây

---

## 3. API Danh sách Booking gần đây
**Endpoint:** `GET /Booking/management`

**Query Parameters:**
- `pageNumber`: 1
- `pageSize`: 10 (lấy 5 booking mới nhất để hiển thị)

**Mô tả:** Lấy danh sách các booking gần đây để hiển thị trong section "Đặt phòng gần đây"

**Response:**
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

**Các trạng thái booking:**
- `confirmed`: Đã xác nhận (màu xanh lá)
- `pending`: Chờ xác nhận (màu vàng)
- `cancelled`: Đã hủy (màu đỏ)
- `completed`: Hoàn thành (màu xanh dương)

**Sử dụng cho:** Component `RecentBookings` - hiển thị 5 booking mới nhất

---

## 4. API Doanh thu theo tháng (Optional - Chưa sử dụng)
**Endpoint:** `GET /Dashboard/revenue-by-month?months=12`

**Query Parameters:**
- `months`: Số tháng muốn lấy (default: 12)

**Mô tả:** Lấy dữ liệu doanh thu theo từng tháng để vẽ biểu đồ

**Response:**
```json
{
  "data": [
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

**Sử dụng cho:** Biểu đồ doanh thu theo tháng (có thể bổ sung trong tương lai)

---

## 5. API Top loại phòng (Optional - Chưa sử dụng)
**Endpoint:** `GET /Dashboard/top-room-types?limit=5`

**Query Parameters:**
- `limit`: Số lượng loại phòng muốn lấy (default: 5)

**Mô tả:** Lấy danh sách các loại phòng có doanh thu cao nhất

**Response:**
```json
{
  "data": [
    {
      "roomTypeId": 1,
      "typeName": "Deluxe",
      "totalBookings": 45,
      "totalRevenue": 6800000,
      "averagePrice": 850000
    }
  ],
  "success": true,
  "message": "Get top room types successfully"
}
```

**Sử dụng cho:** Thống kê loại phòng phổ biến (có thể bổ sung trong tương lai)

---

## Tổng kết

### API đang được sử dụng:
1. ✅ `GET /Dashboard/stats` - Thống kê tổng quan (BẮT BUỘC)
2. ✅ `GET /Booking/management` - Danh sách booking gần đây (BẮT BUỘC)
3. ⚠️ `GET /Dashboard/room-status` - Tình trạng phòng (Optional, có thể dùng data từ stats)

### API đã tích hợp nhưng chưa sử dụng:
4. `GET /Dashboard/revenue-by-month` - Doanh thu theo tháng
5. `GET /Dashboard/top-room-types` - Top loại phòng

### Thứ tự ưu tiên triển khai Backend:
1. **Cao nhất:** `GET /Dashboard/stats` (Cung cấp toàn bộ số liệu chính)
2. **Cao:** `GET /Booking/management` (Hiển thị danh sách booking gần đây)
3. **Trung bình:** `GET /Dashboard/room-status` (Có thể tính từ stats)
4. **Thấp:** `GET /Dashboard/revenue-by-month` (Cho tính năng mở rộng)
5. **Thấp:** `GET /Dashboard/top-room-types` (Cho tính năng mở rộng)

---

## Code Reference

**Components:**
- [stat-card.tsx](../components/features/dashboard/stat-card.tsx) - Component hiển thị thẻ thống kê
- [recent-bookings.tsx](../components/features/dashboard/recent-bookings.tsx) - Component danh sách booking gần đây
- [page.tsx](../app/admin/dashboard/page.tsx:1-310) - Dashboard page chính

**Hooks:**
- [use-dashboard.ts](../lib/hooks/use-dashboard.ts) - React Query hooks cho dashboard

**API:**
- [dashboard.ts](../lib/api/dashboard.ts) - Dashboard API functions
