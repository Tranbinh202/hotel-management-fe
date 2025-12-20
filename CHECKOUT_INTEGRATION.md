# ✅ Checkout Integration - Complete

## 🎯 Tóm tắt

Checkout functionality đã được tích hợp hoàn chỉnh vào:
- ✅ **Admin Bookings** - [app/admin/bookings/page.tsx](app/admin/bookings/page.tsx)
- ✅ **Receptionist Bookings** - [app/receptionist/bookings/page.tsx](app/receptionist/bookings/page.tsx)

---

## ⚡ Quick Start

### **Cách sử dụng:**

1. Login với role `Receptionist` hoặc `Admin`
2. Vào trang **Bookings**
3. Tìm booking có status **"CheckedIn"**
4. Click dropdown menu (⋮) > **"Check-out"**
5. Modal hiển thị:
   - Thông tin khách hàng
   - Chi tiết phòng
   - Chi tiết dịch vụ
   - Tổng tiền & còn phải trả
6. Chọn **phương thức thanh toán**
7. Click **"Xác nhận checkout"**
8. ✅ Done! Transaction được tạo, booking completed

---

## 📊 API Endpoints

### 1. Preview Checkout
```http
GET /api/Checkout/preview/{bookingId}?estimatedCheckOutDate=2024-01-20T12:00:00
```
**Mục đích:** Xem trước hóa đơn

### 2. Process Checkout
```http
POST /api/Checkout
{
  "bookingId": 123,
  "actualCheckOutDate": "2024-01-20T12:00:00",
  "paymentMethodId": 15,
  "paymentNote": "Thanh toán tiền mặt",
  "transactionReference": null
}
```
**Mục đích:** Thực hiện checkout & thanh toán

---

## 🗂️ Files Created/Modified

### **New Files:**
```
✅ lib/api/checkout.ts
✅ lib/hooks/use-checkout.ts
✅ components/features/checkout/checkout-modal.tsx
✅ docs/CHECKOUT_INTEGRATION.md
```

### **Modified Files:**
```
✅ lib/types/api.ts (added checkout types)
✅ app/admin/bookings/page.tsx (added checkout modal)
✅ app/receptionist/bookings/page.tsx (added checkout modal)
```

---

## ✨ Features

### **Preview Checkout:**
- ✅ Hiển thị chi tiết tiền phòng
- ✅ Hiển thị chi tiết dịch vụ
- ✅ Tính toán tự động (room charges + service charges - deposit)
- ✅ Hỗ trợ checkout sớm/muộn

### **Process Checkout:**
- ✅ Chọn ngày checkout thực tế
- ✅ Chọn payment method (Cash, Card, QR, PayOS)
- ✅ Nhập mã giao dịch
- ✅ Ghi chú thanh toán
- ✅ Tạo transaction
- ✅ Update booking status → "CheckedOut"
- ✅ Update room status → "Available"

### **UI/UX:**
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Format tiền VND
- ✅ Format date tiếng Việt

---

## 🔧 Backend Requirements

### **API #1: GET /Checkout/preview/{bookingId}** (Ưu tiên CAO)

**Response cần có:**
```typescript
{
  bookingId: number
  customer: { fullName, email, phoneNumber }
  roomCharges: [{
    roomName: string
    pricePerNight: number
    actualNights: number
    subTotal: number
  }]
  serviceCharges: [{
    serviceName: string
    pricePerUnit: number
    quantity: number
    subTotal: number
  }]
  totalRoomCharges: number
  totalServiceCharges: number
  depositPaid: number
  amountDue: number  // subTotal - depositPaid
}
```

**Business Logic:**
```
totalRoomCharges = sum(all room subtotals)
totalServiceCharges = sum(all service subtotals)
subTotal = totalRoomCharges + totalServiceCharges
amountDue = subTotal - depositPaid
```

---

### **API #2: POST /Checkout** (Ưu tiên CAO NHẤT)

**Request:**
```typescript
{
  bookingId: number
  actualCheckOutDate: string  // ISO 8601
  paymentMethodId: number
  paymentNote?: string
  transactionReference?: string
}
```

**Xử lý:**
1. Validate booking status = "CheckedIn"
2. Tính số đêm thực tế
3. Tính tổng tiền (room + service - deposit)
4. Tạo Transaction:
   - TotalAmount = subTotal
   - PaidAmount = amountDue
   - PaymentMethodId from request
   - PaymentStatusId = "Paid"
5. Update Booking:
   - Status = "CheckedOut"
   - ActualCheckOutDate
6. Update Rooms → status "Available"

**Response:**
```typescript
{
  bookingId: number
  transactionId: number
  totalAmount: number
  amountDue: number
  paymentMethod: string
  checkoutProcessedAt: string
  processedBy: string
}
```

---

## 🧪 Test với cURL

### **Test Preview:**
```bash
TOKEN="your_access_token"
BOOKING_ID=1

curl -X GET "http://localhost:8080/api/Checkout/preview/$BOOKING_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### **Test Checkout:**
```bash
curl -X POST "http://localhost:8080/api/Checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "actualCheckOutDate": "2024-01-20T12:00:00",
    "paymentMethodId": 15,
    "paymentNote": "Cash payment",
    "transactionReference": null
  }'
```

---

## 🐛 Common Issues

### **Issue 1: "Không thể tải thông tin checkout"**
**Fix:**
- Check Backend running
- Check API endpoint implemented
- Check token valid

### **Issue 2: "Checkout thất bại"**
**Fix:**
- Booking phải có status "CheckedIn"
- Payment method phải tồn tại trong CommonCode
- Check Backend logs

### **Issue 3: Button disabled**
**Fix:**
- Phải chọn payment method
- Phải có checkout date

---

## 📚 Documentation

**Chi tiết đầy đủ:**
- [CHECKOUT_INTEGRATION.md](docs/CHECKOUT_INTEGRATION.md) - Integration guide đầy đủ
- [Checkout API Documentation](#) - API spec từ Backend team

**Quick Links:**
- [Admin Bookings](app/admin/bookings/page.tsx#L36-L37) - Checkout integration
- [Receptionist Bookings](app/receptionist/bookings/page.tsx#L36-L37) - Checkout integration
- [CheckoutModal Component](components/features/checkout/checkout-modal.tsx) - UI component
- [Checkout API](lib/api/checkout.ts) - API functions
- [Checkout Hooks](lib/hooks/use-checkout.ts) - React Query hooks

---

## ✅ Checklist

### Frontend (Complete)
- [x] Types & interfaces
- [x] API client functions
- [x] React Query hooks
- [x] Checkout modal component
- [x] Admin page integration
- [x] Receptionist page integration
- [x] Error handling
- [x] Loading states
- [x] Form validation
- [x] Toast notifications

### Backend (Pending)
- [ ] `GET /Checkout/preview/{bookingId}` endpoint
- [ ] `POST /Checkout` endpoint
- [ ] Transaction creation logic
- [ ] Booking status update logic
- [ ] Room status update logic
- [ ] Authorization (Receptionist/Manager/Admin)

---

## 🚀 Ready to Use

**Frontend:** 🟢 Complete
**Backend:** 🟡 Waiting for APIs

Khi Backend hoàn thành 2 APIs, checkout sẽ hoạt động ngay lập tức!

---

**Last Updated:** 2024-12-16
**Status:** Frontend ready, waiting for Backend implementation
