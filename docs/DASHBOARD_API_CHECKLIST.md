# Dashboard API - Backend Checklist

## ✅ Checklist triển khai API cho Dashboard

### 🔥 PRIORITY 1 - Bắt buộc (MVP)

#### [ ] API 1: GET /Dashboard/stats
**Mô tả:** Trả về toàn bộ thống kê Dashboard

**Response cần có 25 fields:**
```json
{
  "data": {
    // Booking (4 fields)
    "totalBookings": 95,
    "bookingsThisMonth": 22,
    "bookingsLastMonth": 19,
    "bookingsGrowth": 15.8,

    // Revenue (5 fields)
    "totalRevenue": 12500000,
    "revenueThisMonth": 4800000,
    "revenueLastMonth": 4300000,
    "revenueGrowth": 11.6,
    "averageRoomRate": 850000,

    // Customers (3 fields)
    "totalCustomers": 28,
    "newCustomersThisMonth": 4,
    "customersGrowth": 6.5,

    // Rooms (5 fields)
    "totalRooms": 30,
    "availableRooms": 10,
    "occupiedRooms": 17,
    "maintenanceRooms": 3,
    "occupancyRate": 56.7,

    // Transactions (3 fields)
    "totalTransactions": 100,
    "completedPayments": 93,
    "pendingPayments": 7
  }
}
```

**Test cases:**
- [ ] Tất cả 25 fields có trong response
- [ ] Tính toán đúng % growth (có thể âm)
- [ ] occupancyRate = (occupiedRooms / totalRooms) * 100
- [ ] availableRooms + occupiedRooms + maintenanceRooms = totalRooms
- [ ] Response time < 500ms (nên cache)

---

#### [ ] API 2: GET /Booking/management
**Mô tả:** Danh sách booking (dùng cho "Đặt phòng gần đây")

**Params:**
- `pageNumber=1`
- `pageSize=10`

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
  }
}
```

**Test cases:**
- [ ] Có object `user` với `firstName`, `lastName`
- [ ] Status là 1 trong: `confirmed`, `pending`, `cancelled`, `completed`
- [ ] Sắp xếp theo thời gian tạo DESC (mới nhất trước)
- [ ] Pagination hoạt động đúng
- [ ] Date format ISO 8601

---

### 🟡 PRIORITY 2 - Tùy chọn

#### [ ] API 3: GET /Dashboard/room-status
**Mô tả:** Chi tiết tình trạng phòng (có thể skip, tính từ API #1)

```json
{
  "data": [
    { "status": "available", "count": 10, "percentage": 33.3 },
    { "status": "occupied", "count": 17, "percentage": 56.7 },
    { "status": "maintenance", "count": 3, "percentage": 10.0 }
  ]
}
```

---

### 🔵 PRIORITY 3 - Tương lai (Chưa dùng trên UI)

#### [ ] API 4: GET /Dashboard/revenue-by-month?months=12
**Mô tả:** Doanh thu theo tháng (cho biểu đồ)

```json
{
  "data": [
    { "month": "01", "year": 2024, "revenue": 4800000, "bookings": 22 }
  ]
}
```

---

#### [ ] API 5: GET /Dashboard/top-room-types?limit=5
**Mô tả:** Top loại phòng theo doanh thu

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
  ]
}
```

---

## 🧪 Testing Guide

### Để test API Dashboard:

1. **Setup:**
   ```bash
   # Frontend sẽ gọi API với:
   Base URL: http://localhost:8080/api
   Headers: Authorization: Bearer {token}
   ```

2. **Test API #1 (Stats):**
   ```bash
   curl -X GET "http://localhost:8080/api/Dashboard/stats" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

   **Expected:** Response với 25 fields, không có field nào null/undefined

3. **Test API #2 (Bookings):**
   ```bash
   curl -X GET "http://localhost:8080/api/Booking/management?pageNumber=1&pageSize=10" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

   **Expected:** Array of bookings, sắp xếp mới nhất trước

---

## 🔍 Common Issues & Solutions

### Issue 1: Growth calculation âm
**Giải pháp:** Growth có thể âm khi tháng này ít hơn tháng trước, đây là hành vi đúng.
```javascript
growth = ((thisMonth - lastMonth) / lastMonth) * 100
// Ví dụ: (19 - 22) / 22 * 100 = -13.6
```

### Issue 2: occupancyRate không khớp
**Giải pháp:** Đảm bảo công thức:
```javascript
occupancyRate = (occupiedRooms / totalRooms) * 100
```

### Issue 3: Pagination không hoạt động
**Giải pháp:** Đảm bảo response có đầy đủ:
- `pageNumber`, `pageSize`, `totalPages`, `totalCount`

### Issue 4: Missing user info trong booking
**Giải pháp:** Phải include/join bảng User khi query Booking:
```json
"user": {
  "firstName": "Nguyễn",
  "lastName": "Văn A"
}
```

---

## 📋 Acceptance Criteria

Dashboard page được coi là hoàn thành khi:

- [x] **Frontend:** Components đã sẵn sàng
- [x] **Frontend:** Hooks đã được tích hợp
- [ ] **Backend:** API #1 (stats) hoạt động 100%
- [ ] **Backend:** API #2 (bookings) hoạt động 100%
- [ ] **Integration:** Frontend hiển thị data thật (không còn mock)
- [ ] **Integration:** Không có lỗi console
- [ ] **Integration:** Loading states hoạt động
- [ ] **Integration:** Error handling hoạt động
- [ ] **Integration:** Auto-refresh mỗi 60s (stats)

---

## 📚 Tài liệu tham khảo

- **Chi tiết API:** [DASHBOARD_API_REQUIREMENTS.md](./DASHBOARD_API_REQUIREMENTS.md)
- **API đầy đủ:** [DASHBOARD_API.md](./DASHBOARD_API.md)
- **Setup guide:** [API_SETUP.md](./API_SETUP.md)

---

## 🎯 Quick Start cho Backend Dev

1. Đọc file này để biết cần làm gì
2. Đọc [DASHBOARD_API_REQUIREMENTS.md](./DASHBOARD_API_REQUIREMENTS.md) để biết chi tiết từng API
3. Implement API #1 và #2 trước (PRIORITY 1)
4. Test với curl hoặc Postman
5. Notify Frontend team để integration test

---

**Last updated:** 2024-01-16
**Contact:** Frontend Team
