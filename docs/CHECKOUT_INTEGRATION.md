# ✅ Checkout API Integration - HOÀN TẤT

## 🎯 Tổng quan

Checkout functionality đã được tích hợp hoàn chỉnh vào hệ thống quản lý bookings cho:
- ✅ **Admin** - Trang quản lý booking
- ✅ **Receptionist** - Trang quản lý booking lễ tân
- ✅ **Manager** - Có thể sử dụng trang Admin

---

## 🚀 Tính năng đã triển khai

### 1. **Preview Checkout** (Xem trước hóa đơn)
- Hiển thị chi tiết tiền phòng theo từng phòng
- Hiển thị chi tiết dịch vụ đã sử dụng
- Tính toán tự động:
  - Tổng tiền phòng
  - Tổng tiền dịch vụ
  - Tiền cọc đã trả
  - Số tiền còn phải trả
- Hỗ trợ checkout sớm/muộn (tính lại số đêm)

### 2. **Process Checkout** (Thực hiện checkout)
- Chọn ngày checkout thực tế
- Chọn phương thức thanh toán (Cash, Card, QR, PayOS)
- Nhập mã giao dịch (nếu thanh toán qua ngân hàng)
- Thêm ghi chú thanh toán
- Tạo transaction tự động
- Cập nhật trạng thái booking thành "Completed"
- Cập nhật trạng thái phòng về "Available"

### 3. **UI/UX Features**
- ✅ Loading states với spinner
- ✅ Error handling với thông báo chi tiết
- ✅ Validation form inputs
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Preview trước khi xác nhận
- ✅ Format tiền tệ VND
- ✅ Format ngày tháng tiếng Việt

---

## 📁 Các file đã tạo

### **Types & Interfaces**
```
lib/types/api.ts (updated)
├── CustomerCheckoutInfo
├── RoomChargeDetail
├── ServiceChargeDetail
├── PreviewCheckoutResponse
├── CheckoutRequest
├── CheckoutResponse
└── BookingCheckoutInfo
```

### **API Layer**
```
lib/api/checkout.ts (new)
├── previewCheckout()
├── processCheckout()
└── getBookingCheckoutInfo()
```

### **React Query Hooks**
```
lib/hooks/use-checkout.ts (new)
├── usePreviewCheckout()
├── useBookingCheckoutInfo()
└── useProcessCheckout()
```

### **Components**
```
components/features/checkout/checkout-modal.tsx (new)
└── CheckoutModal component
```

### **Pages Updated**
```
app/admin/bookings/page.tsx (updated)
└── Added checkout functionality

app/receptionist/bookings/page.tsx (updated)
└── Added checkout functionality
```

---

## 🔧 Cách sử dụng

### **Từ Admin/Receptionist Bookings Page:**

1. **Tìm booking cần checkout:**
   - Booking phải có status "CheckedIn"
   - Dropdown menu > "Check-out"

2. **Modal checkout hiển thị:**
   - Thông tin khách hàng
   - Chi tiết phòng đã thuê
   - Chi tiết dịch vụ đã sử dụng
   - Tổng tiền và số còn phải trả

3. **Điền thông tin thanh toán:**
   - Chọn ngày checkout (mặc định: hôm nay)
   - Chọn phương thức thanh toán (bắt buộc)
   - Nhập mã giao dịch (tùy chọn)
   - Thêm ghi chú (tùy chọn)

4. **Xác nhận checkout:**
   - Click "Xác nhận checkout"
   - Hệ thống xử lý:
     - Tạo transaction
     - Cập nhật booking status
     - Cập nhật room status
   - Hiển thị thông báo thành công
   - Tự động refresh danh sách bookings

---

## 📊 API Endpoints được sử dụng

### 1. GET /Checkout/preview/{bookingId}
**Mục đích:** Preview hóa đơn trước khi checkout

**Request:**
```http
GET /api/Checkout/preview/123?estimatedCheckOutDate=2024-01-20T12:00:00
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": {
    "bookingId": 123,
    "customer": { ... },
    "roomCharges": [ ... ],
    "serviceCharges": [ ... ],
    "totalRoomCharges": 8500000,
    "totalServiceCharges": 750000,
    "subTotal": 9250000,
    "depositPaid": 2000000,
    "amountDue": 7250000
  },
  "isSuccess": true
}
```

### 2. POST /Checkout
**Mục đích:** Thực hiện checkout và thanh toán

**Request:**
```http
POST /api/Checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": 123,
  "actualCheckOutDate": "2024-01-20T12:00:00",
  "paymentMethodId": 15,
  "paymentNote": "Thanh toán bằng tiền mặt",
  "transactionReference": null
}
```

**Response:**
```json
{
  "data": {
    "bookingId": 123,
    "transactionId": 456,
    "totalAmount": 9250000,
    "amountDue": 7250000,
    "paymentMethod": "Cash",
    "checkoutProcessedAt": "2024-01-20T12:05:30",
    "processedBy": "Nguyễn Thị B (Receptionist)"
  },
  "isSuccess": true
}
```

### 3. GET /Checkout/booking/{bookingId} (Optional)
**Mục đích:** Lấy thông tin booking để chuẩn bị checkout

---

## 🧪 Testing Guide

### **Test Case 1: Checkout thành công**

**Bước:**
1. Login với role Receptionist/Admin
2. Vào trang Bookings
3. Tìm booking có status "CheckedIn"
4. Click dropdown menu > "Check-out"
5. Modal hiển thị với đầy đủ thông tin
6. Chọn payment method "Cash"
7. Click "Xác nhận checkout"
8. Thông báo thành công hiển thị
9. Booking status chuyển sang "CheckedOut"

**Expected:** ✅ Checkout thành công, transaction được tạo

---

### **Test Case 2: Checkout với checkout date khác**

**Bước:**
1. Mở checkout modal
2. Thay đổi "Ngày checkout thực tế" thành ngày khác
3. Quan sát số đêm và tổng tiền thay đổi
4. Click "Xác nhận checkout"

**Expected:** ✅ Số tiền được tính lại đúng theo số đêm mới

---

### **Test Case 3: Validation**

**Bước:**
1. Mở checkout modal
2. Không chọn payment method
3. Click "Xác nhận checkout"

**Expected:** ✅ Button bị disable, không thể submit

---

### **Test Case 4: Error handling**

**Bước:**
1. Tắt Backend API server
2. Mở checkout modal

**Expected:** ✅ Hiển thị message "Không thể tải thông tin checkout"

---

## 🐛 Troubleshooting

### **Lỗi: "Không thể tải thông tin checkout"**

**Nguyên nhân:**
- Backend API chưa chạy
- API endpoint `/Checkout/preview/{bookingId}` chưa implement
- Token hết hạn

**Giải pháp:**
1. Kiểm tra Backend đang chạy
2. Test API với cURL:
```bash
curl -X GET "http://localhost:8080/api/Checkout/preview/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### **Lỗi: "Checkout thất bại"**

**Nguyên nhân:**
- Booking không ở trạng thái CheckedIn
- Payment method không tồn tại
- Backend validation fail

**Giải pháp:**
1. Kiểm tra booking status
2. Kiểm tra payment methods trong CommonCode
3. Xem response error từ Backend

---

### **Lỗi: "Access denied"**

**Nguyên nhân:**
- User không có role Receptionist/Manager/Admin

**Giải pháp:**
1. Đăng nhập với account có role phù hợp
2. Kiểm tra role trong token

---

## 📝 Backend Requirements

### **BẮT BUỘC implement:**

#### 1. ✅ GET /Checkout/preview/{bookingId}
- [x] Tính toán roomCharges từ BookingRoom
- [x] Tính toán serviceCharges từ RoomService + BookingService
- [x] Tính depositPaid từ Transactions
- [x] Tính amountDue = subTotal - depositPaid
- [x] Hỗ trợ query param `estimatedCheckOutDate`

#### 2. ✅ POST /Checkout
- [x] Validate booking status = CheckedIn
- [x] Validate payment method tồn tại
- [x] Tạo Transaction mới:
  - TotalAmount = subTotal
  - PaidAmount = amountDue
  - PaymentMethodId từ request
  - PaymentStatusId = "Paid"
- [x] Update Booking:
  - Status = "CheckedOut"
  - ActualCheckOutDate = actualCheckOutDate
- [x] Update Rooms:
  - Set tất cả rooms về status "Available"
- [x] Return CheckoutResponse với đầy đủ thông tin

#### 3. ⚠️ GET /Checkout/booking/{bookingId} (Optional)
- [ ] Lấy booking info
- [ ] Check canCheckout = true nếu status = CheckedIn

---

## 🔒 Authorization

### **Required Roles:**
- ✅ `Receptionist` - Có thể checkout
- ✅ `Manager` - Có thể checkout
- ✅ `Admin` - Có thể checkout
- ❌ `Customer` - Không có quyền

### **API Authorization:**
```http
Authorization: Bearer {access_token}
```

---

## 💡 Best Practices

### **1. Luôn preview trước khi checkout**
Frontend tự động gọi preview API khi mở modal để hiển thị chi tiết hóa đơn.

### **2. Validate inputs**
- Payment method: Required
- Checkout date: Required, phải >= checkInDate
- Transaction reference: Optional

### **3. Error messages thân thiện**
```typescript
toast({
  title: "Checkout thất bại",
  description: error?.message || "Đã xảy ra lỗi khi checkout",
  variant: "destructive",
})
```

### **4. Auto refresh sau checkout**
```typescript
const handleCheckoutSuccess = () => {
  refetch() // Refresh booking list
  setCheckoutBookingId(null)
}
```

---

## 📈 Future Enhancements

### **Có thể bổ sung sau:**

1. **Print Receipt** - In hóa đơn
   - Export PDF hóa đơn
   - In trực tiếp từ browser
   - Email hóa đơn cho khách

2. **Partial Payment** - Thanh toán một phần
   - Cho phép khách trả dần
   - Ghi nhận nhiều transactions
   - Hiển thị lịch sử thanh toán

3. **Refund** - Hoàn tiền
   - Xử lý hoàn tiền khi cần
   - Ghi nhận refund transaction
   - Update booking và payment status

4. **Early Checkout Charges** - Phí checkout sớm
   - Tính phí nếu checkout trước thời gian
   - Cấu hình % phí trong settings
   - Hiển thị cảnh báo cho khách

5. **Late Checkout** - Checkout muộn
   - Tính phí nếu checkout muộn
   - Auto-calculate additional charges
   - Send notification

---

## 🎯 Checklist Integration

### Frontend ✅
- [x] Types & interfaces
- [x] API functions
- [x] React Query hooks
- [x] CheckoutModal component
- [x] Admin page integration
- [x] Receptionist page integration
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] Form validation

### Backend (Chờ implement)
- [ ] GET /Checkout/preview/{bookingId}
- [ ] POST /Checkout
- [ ] GET /Checkout/booking/{bookingId}
- [ ] Authorization middleware
- [ ] Transaction creation logic
- [ ] Booking status update
- [ ] Room status update
- [ ] Error handling

---

## 📞 Support

**Frontend:** ✅ Complete
**Backend:** ⏳ Pending implementation

**Tài liệu tham khảo:**
- [Checkout API Documentation](./CHECKOUT_API_DOCUMENTATION.md)
- [API Setup Guide](./API_SETUP.md)

---

**Last Updated:** 2024-12-16
**Status:** 🟢 Frontend Ready - Waiting for Backend APIs
