# Dashboard API Integration Guide

## ✅ Hoàn tất ghép API

Dashboard đã được tích hợp API thành công! Mock data đã được thay thế bằng dữ liệu thật từ Backend.

---

## 📋 Các thay đổi đã thực hiện

### 1. Component Updates

#### ✅ [stat-card.tsx](../components/features/dashboard/stat-card.tsx)
- Thêm prop `description` để hiển thị thông tin bổ sung dưới giá trị
- Không thay đổi layout, chỉ thêm tính năng

#### ✅ [page.tsx](../app/admin/dashboard/page.tsx)
- **Xóa mock data** (lines 44-65)
- Sử dụng data trực tiếp từ API thông qua hooks
- Thêm error handling với UI thân thiện
- Thêm empty state khi không có data
- Giữ nguyên layout và giao diện

### 2. API Integration

#### API Endpoints đang sử dụng:

**1. GET /Dashboard/stats** (Ưu tiên cao)
- Hook: `useDashboardStats()`
- Refetch: Mỗi 60 giây
- Sử dụng cho: Tất cả thẻ thống kê (StatCard) và các cards

**2. GET /Booking/management** (Ưu tiên cao)
- Hook: `useBookingManagement(bookingParams)`
- Params: `{ pageNumber: 1, pageSize: 10 }`
- Sử dụng cho: Component "Đặt phòng gần đây"

**3. GET /Dashboard/room-status** (Optional)
- Hook: `useRoomStatusSummary()`
- Refetch: Mỗi 30 giây
- Hiện tại chưa dùng (data tính từ stats)

---

## 🔧 Cấu hình

### 1. Environment Variables

Đảm bảo file `.env.local` có cấu hình đúng:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**Lưu ý:**
- Thay đổi URL nếu Backend chạy ở port khác
- Production: Thay bằng URL thật của API server

### 2. Kiểm tra API Client

File [lib/api/client.ts](../lib/api/client.ts) đã được cấu hình:
- Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5001/api"`
- Timeout: 10 seconds
- Auto refresh token khi hết hạn
- Error handling đầy đủ

---

## 🧪 Hướng dẫn Test

### Test 1: Khởi động Frontend

```bash
# Install dependencies (nếu chưa)
npm install

# Start development server
npm run dev
```

Mở trình duyệt: `http://localhost:3000/admin/dashboard`

### Test 2: Kiểm tra API Calls

**1. Mở DevTools (F12) > Network tab**

**2. Reload trang dashboard**

**3. Kiểm tra các API calls:**

✅ `GET /Dashboard/stats` - Should return 200 OK
```json
{
  "data": {
    "totalBookings": 95,
    "totalRevenue": 12500000,
    ...
  },
  "success": true
}
```

✅ `GET /Booking/management?pageNumber=1&pageSize=10` - Should return 200 OK
```json
{
  "data": {
    "items": [...],
    "pageNumber": 1,
    "totalCount": 5
  },
  "success": true
}
```

### Test 3: Kiểm tra Loading States

**Các loading states đã được implement:**

1. **Initial Loading:**
   - Hiển thị spinner khi đang tải data lần đầu
   - Component: `<LoadingSpinner size="lg" />`

2. **Error State:**
   - Hiển thị thông báo lỗi với nút "Tải lại"
   - Xuất hiện khi API call fail

3. **Empty State:**
   - Hiển thị "Không có dữ liệu" khi API trả về null/undefined

### Test 4: Kiểm tra Auto Refresh

Dashboard tự động refresh data:
- Stats: Mỗi **60 giây**
- Room Status: Mỗi **30 giây**

**Test:**
1. Mở dashboard
2. Chờ 60 giây
3. Kiểm tra Network tab - Should see new API call to `/Dashboard/stats`

---

## 🐛 Troubleshooting

### Lỗi 1: "Không thể tải dữ liệu dashboard"

**Nguyên nhân:**
- Backend API chưa chạy
- API URL sai
- Backend API trả về error

**Giải pháp:**
1. Kiểm tra Backend đang chạy: `http://localhost:8080/api/Dashboard/stats`
2. Kiểm tra `.env.local` có đúng URL không
3. Kiểm tra Console log để xem error chi tiết
4. Kiểm tra token authentication

### Lỗi 2: "401 Unauthorized"

**Nguyên nhân:**
- Chưa đăng nhập
- Token hết hạn
- Token không hợp lệ

**Giải pháp:**
1. Đăng nhập lại
2. Clear localStorage: `localStorage.clear()`
3. Refresh trang

### Lỗi 3: "403 Forbidden"

**Nguyên nhân:**
- User không có quyền Manager/Admin

**Giải pháp:**
1. Đăng nhập với account có role Manager hoặc Admin
2. Kiểm tra role trong token

### Lỗi 4: CORS Error

**Nguyên nhân:**
- Backend chưa cấu hình CORS

**Giải pháp:**
Backend cần enable CORS cho origin `http://localhost:3000`

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

### Lỗi 5: Data không hiển thị đúng

**Nguyên nhân:**
- Backend response format không đúng
- Missing fields trong response

**Giải pháp:**
1. Mở DevTools > Network > Click vào API call
2. Xem Response tab
3. So sánh với [DASHBOARD_API_REQUIREMENTS.md](./DASHBOARD_API_REQUIREMENTS.md)
4. Đảm bảo response có đủ 25 fields trong DashboardStats

---

## 📊 Data Flow

```
User visits Dashboard
        ↓
React Query calls API
        ↓
useQuery → useDashboardStats()
        ↓
dashboardApi.getStats()
        ↓
apiClient.get("/Dashboard/stats")
        ↓
Backend API
        ↓
Response: { data: {...}, success: true }
        ↓
Parse: response.data.data
        ↓
statsData = DashboardStats object
        ↓
Render Dashboard with statsData
```

---

## 🎯 Checklist Integration

### Frontend Checklist

- [x] ✅ Xóa mock data
- [x] ✅ Sử dụng hooks để fetch data
- [x] ✅ Implement loading states
- [x] ✅ Implement error handling
- [x] ✅ Implement empty states
- [x] ✅ Auto refresh setup (60s)
- [x] ✅ Giữ nguyên layout/giao diện

### Backend Checklist

Để dashboard hoạt động đầy đủ, Backend cần:

- [ ] **REQUIRED** - Implement `GET /Dashboard/stats`
  - [ ] 25 fields trong response
  - [ ] Tính toán đúng growth percentages
  - [ ] Response time < 500ms
  - [ ] Cache data để tối ưu

- [ ] **REQUIRED** - Endpoint `GET /Booking/management` đã có
  - [ ] Trả về object `user` với `firstName`, `lastName`
  - [ ] Sắp xếp DESC (mới nhất trước)
  - [ ] Pagination hoạt động

- [ ] Optional - Implement `GET /Dashboard/room-status`
  - [ ] 3 status: available, occupied, maintenance
  - [ ] Tính phần trăm đúng

- [ ] CORS configuration
  - [ ] Allow origin: `http://localhost:3000` (dev)
  - [ ] Allow origin: Production URL (prod)
  - [ ] Allow credentials

- [ ] Authentication & Authorization
  - [ ] Require Bearer token
  - [ ] Check role: Manager or Admin

---

## 🔐 Security Notes

### Token Handling

- Access token được lưu trong `localStorage`
- Token tự động thêm vào header: `Authorization: Bearer {token}`
- Auto refresh token khi hết hạn
- Redirect về `/login` khi refresh token fail

### API Security

Tất cả Dashboard APIs yêu cầu:
- ✅ Valid JWT token
- ✅ Role: `Manager` hoặc `Admin`
- ✅ Token chưa hết hạn

---

## 📝 Code Examples

### Xem data trong Console

```javascript
// Mở Console (F12)
// Paste code này để xem data

// 1. Check if user is logged in
console.log('Access Token:', localStorage.getItem('access_token'));

// 2. Manually call API
fetch('http://localhost:8080/api/Dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log('Stats:', data));
```

### Test với cURL

```bash
# Replace YOUR_TOKEN với access token của bạn
TOKEN="YOUR_TOKEN"

# Test stats endpoint
curl -X GET "http://localhost:8080/api/Dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test bookings endpoint
curl -X GET "http://localhost:8080/api/Booking/management?pageNumber=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🚀 Next Steps

### Sau khi Backend hoàn thành APIs:

1. **Test Integration đầy đủ:**
   - Login với account Admin/Manager
   - Truy cập dashboard
   - Verify tất cả số liệu hiển thị đúng
   - Test auto-refresh (chờ 60s)

2. **Performance Testing:**
   - Kiểm tra response time < 500ms
   - Verify caching hoạt động
   - Test với concurrent users

3. **Error Scenarios:**
   - Test khi Backend down
   - Test khi token expire
   - Test khi không có quyền

4. **Deploy to Staging/Production:**
   - Update `.env.production` với API URL production
   - Test trên môi trường production
   - Monitor API calls và errors

---

## 📞 Support

**Frontend Issues:**
- Check [DASHBOARD_API_REQUIREMENTS.md](./DASHBOARD_API_REQUIREMENTS.md) for API spec
- Check [DASHBOARD_API_CHECKLIST.md](./DASHBOARD_API_CHECKLIST.md) for implementation checklist

**Backend Issues:**
- Verify response format matches documentation
- Check authentication and authorization
- Check CORS configuration

---

## 📅 Change Log

### 2024-01-16
- ✅ Removed mock data from dashboard page
- ✅ Integrated real API calls
- ✅ Added error handling UI
- ✅ Added loading states
- ✅ Updated StatCard component with description prop
- ✅ Maintained original layout and design

---

**Status:** ✅ Frontend Ready - Chờ Backend APIs
**Priority:** API #1 (stats) và API #2 (bookings) cần được implement để dashboard hoạt động
