# Booking Flow - Các thay đổi đã thực hiện

## Tổng quan
Đã cập nhật toàn bộ luồng booking của client để phù hợp với API documentation v2. Các thay đổi chính bao gồm việc sửa type definitions, tạo trang QR payment mới, và cập nhật redirect flow.

---

## ✅ Đã hoàn thành

### 1. Cập nhật Type Definitions

#### File: `lib/types/api.ts`

**BookingResponse** (lines 371-413)
- ✅ Thêm `statusCode` field
- ✅ Restructure `data` object với nested `booking` object
- ✅ Thêm các field mới trong `booking`:
  - `customerEmail`, `customerPhone`
  - `roomIds`, `roomTypeDetails`
  - `depositStatus`, `specialRequests`
  - `createdAt`, `orderCode`
- ✅ Loại bỏ `paymentUrl` (backend không trả về)
- ✅ Thêm `bookingToken` (string)
- ✅ Thêm `qrPayment` object với các field:
  - `qrCodeUrl`, `bankName`, `bankCode`
  - `accountNumber`, `accountName`
  - `amount`, `description`, `transactionRef`
  - `qrDataText` (optional)
- ✅ Thêm `paymentDeadline` (string - ISO datetime)

**GuestBookingResponse** (lines 892-956)
- ✅ Cập nhật để match với `BookingResponse` structure
- ✅ Thêm tất cả các field còn thiếu trong `booking` object
- ✅ Thêm `qrDataText` field (optional) trong `qrPayment`
- ✅ Set `qrPayment` có thể null (`| null`)

### 2. Tạo trang QR Payment mới

#### File: `app/(client)/booking/qr-payment/page.tsx` (MỚI)

**Features:**
- ✅ Countdown timer 15 phút (tự động tính từ `paymentDeadline`)
- ✅ Hiển thị QR code từ backend
- ✅ Hiển thị thông tin chuyển khoản:
  - Ngân hàng, Chủ tài khoản, Số tài khoản
  - Số tiền (deposit amount)
  - Nội dung chuyển khoản
- ✅ Copy to clipboard cho tất cả thông tin
- ✅ Button "Tôi đã chuyển khoản":
  - Gọi `POST /api/Booking/confirm-payment` với `isCancel: false`
  - Set status → `PendingConfirmation`
  - Hiển thị message xác nhận
- ✅ Button "Hủy booking":
  - Confirm dialog trước khi hủy
  - Gọi `POST /api/Booking/confirm-payment` với `isCancel: true`
  - Set status → `Cancelled`
- ✅ Auto-cancel khi hết thời gian (countdown = 0)
- ✅ 3 states:
  - `pending`: Hiển thị QR + countdown
  - `confirmed`: Hiển thị success message
  - `cancelled`: Hiển thị cancelled message
- ✅ Link "Xem chi tiết booking" → redirect to `/booking/{token}`
- ✅ Responsive design với Tailwind CSS
- ✅ Loading states cho tất cả actions
- ✅ Error handling với toast notifications

**URL Parameters:**
```
/booking/qr-payment?
  bookingId=123
  &token={bookingToken}
  &amount={depositAmount}
  &deadline={paymentDeadline}
  &qrCode={qrCodeUrl}
  &accountNo={accountNumber}
  &accountName={accountName}
  &bankName={bankName}
  &description={description}
```

### 3. Cập nhật Booking Page

#### File: `app/(client)/booking/page.tsx`

**handleFinalSubmit function** (lines 212-310)

**Authenticated User Flow:**
```typescript
const response = await bookingsApi.create({...})
if (response.isSuccess && response.data) {
  const params = new URLSearchParams({
    bookingId: response.data.booking.bookingId.toString(),
    token: response.data.bookingToken,
    amount: response.data.booking.depositAmount.toString(),
    deadline: response.data.paymentDeadline,
  })
  
  if (response.data.qrPayment) {
    params.append("qrCode", response.data.qrPayment.qrCodeUrl)
    params.append("accountNo", response.data.qrPayment.accountNumber)
    params.append("accountName", response.data.qrPayment.accountName)
    params.append("bankName", response.data.qrPayment.bankName)
    params.append("description", response.data.qrPayment.description)
  }
  
  router.push(`/booking/qr-payment?${params.toString()}`)
}
```

**Guest User Flow:**
- ✅ Tương tự authenticated flow
- ✅ Gọi `bookingsApi.createByGuest()` thay vì `create()`
- ✅ Redirect đến cùng trang QR payment

**Thay đổi:**
- ❌ Loại bỏ: `router.push(response.data.paymentUrl)` (không còn tồn tại)
- ❌ Loại bỏ: `router.push(/booking/track?token=...)` (không đúng flow)
- ✅ Thêm: Redirect đến `/booking/qr-payment` với đầy đủ params

### 4. Sửa Track Booking Page

#### File: `app/(client)/booking/track/page.tsx`

**Vấn đề:** Sử dụng `booking.status` field không tồn tại

**Sửa:** (lines 98-110)
```typescript
// Before:
<p>Trạng thái booking</p>
{getStatusBadge(booking.status)}  // ❌ field không tồn tại

// After:
<p>Trạng thái thanh toán</p>
{getPaymentStatusBadge(booking.paymentStatus)}  // ✅

<p>Loại booking</p>
<Badge variant="outline">{booking.bookingType}</Badge>  // ✅
```

### 5. Code Quality Improvements

#### File: `app/(client)/booking/qr-payment/page.tsx`
- ✅ Fixed Tailwind CSS deprecation warnings:
  - `bg-gradient-to-br` → `bg-linear-to-br`
  - `flex-shrink-0` → `shrink-0`
- ✅ Proper TypeScript types
- ✅ Suspense wrapper cho async components
- ✅ Loading fallback states

---

## 📋 Luồng hoàn chỉnh theo docs

### Guest Booking:
1. User chọn phòng → `/booking` page
2. Nhập thông tin → Submit
3. ✅ Call `POST /api/Booking/guest`
4. ✅ Backend trả về: `{ booking, bookingToken, qrPayment, paymentDeadline }`
5. ✅ Redirect đến `/booking/qr-payment?token={bookingToken}&...`
6. ✅ Hiển thị QR code + countdown 15 phút
7. User chuyển khoản → Click "Tôi đã chuyển khoản"
8. ✅ Call `POST /api/Booking/confirm-payment` với `isCancel: false`
9. ✅ Backend set status = `PendingConfirmation`
10. ✅ Hiển thị message: "Quản lý sẽ kiểm tra và xác nhận"
11. ✅ User có thể xem chi tiết booking qua link

### Authenticated User Booking:
1. User đăng nhập → chọn phòng → `/booking` page
2. Thông tin tự động fill từ profile
3. Submit → ✅ Call `POST /api/Booking`
4. ✅ Backend trả về: `{ booking, bookingToken, qrPayment, paymentDeadline }`
5. ✅ **GIỐNG GUEST FLOW** từ bước 5 trở đi

### Cancel Flow:
- ✅ User click "Hủy booking" trong QR payment page
- ✅ Confirm dialog
- ✅ Call `POST /api/Booking/confirm-payment` với `isCancel: true`
- ✅ Backend set status = `Cancelled`
- ✅ Hiển thị cancelled message

### Auto-cancel Flow:
- ✅ Countdown timer đếm ngược từ `paymentDeadline`
- ✅ Khi hết thời gian (15 phút), tự động set `paymentStatus = "cancelled"`
- ✅ Hiển thị expired message
- ✅ Backend cũng tự động cancel qua `BookingTimeoutChecker`

---

## 🔍 API Endpoints được sử dụng

### 1. Check Availability (AllowAnonymous)
```
POST /api/Booking/check-availability
```
✅ Đã implement đúng

### 2. Create Authenticated Booking (Authorize)
```
POST /api/Booking
```
✅ Đã cập nhật redirect flow

### 3. Create Guest Booking (AllowAnonymous)
```
POST /api/Booking/guest
```
✅ Đã cập nhật redirect flow

### 4. Get Booking by Token (AllowAnonymous)
```
GET /api/Booking/mybooking/{token}
```
✅ Đã sử dụng trong track page

### 5. Confirm Payment / Cancel (AllowAnonymous)
```
POST /api/Booking/confirm-payment
Body: { bookingId, isCancel }
```
✅ Đã implement trong QR payment page

### 6. Get My Bookings (Authorize)
```
GET /api/Booking/my-bookings
```
✅ Hook đã tồn tại

### 7. Cancel Booking Shortcut (Authorize)
```
DELETE /api/Booking/{bookingId}
```
✅ Hook đã tồn tại

---

## ⚠️ Lưu ý quan trọng

### Backend Response Structure
Backend trả về response với structure:
```json
{
  "isSuccess": true,
  "statusCode": 201,
  "message": "...",
  "data": {
    "booking": { ... },
    "bookingToken": "...",
    "qrPayment": { ... } | null,
    "paymentDeadline": "..."
  }
}
```

**Quan trọng:**
- `qrPayment` có thể là `null` nếu QR generation fails
- Client cần handle case này (hiển thị thông tin manual transfer)
- `paymentDeadline` là ISO datetime string, cần parse để tính countdown

### Payment Confirmation Flow
- User click "Tôi đã chuyển khoản" → status = `PendingConfirmation`
- Manager cần vào admin panel để confirm payment
- Sau khi manager confirm → status = `Paid` hoặc `Confirmed`
- Email confirmation sẽ được gửi tự động

### Timeout Mechanism
- Backend schedule auto-cancel sau 15 phút
- Frontend countdown timer chỉ là UI indicator
- Nếu user refresh page, countdown sẽ recalculate từ `paymentDeadline`
- Backend là source of truth cho timeout

---

## 📝 Files đã thay đổi

1. ✅ `lib/types/api.ts` - Updated type definitions
2. ✅ `app/(client)/booking/qr-payment/page.tsx` - NEW file
3. ✅ `app/(client)/booking/page.tsx` - Updated redirect flow
4. ✅ `app/(client)/booking/track/page.tsx` - Fixed status field
5. ✅ `.analysis/booking-flow-issues.md` - Analysis document

---

## 🚀 Testing Checklist

### Guest Booking Flow:
- [ ] Tạo booking mới với guest info
- [ ] Verify redirect đến QR payment page
- [ ] Verify QR code hiển thị đúng
- [ ] Verify countdown timer hoạt động
- [ ] Click "Tôi đã chuyển khoản" → verify API call
- [ ] Verify success message hiển thị
- [ ] Click "Hủy booking" → verify confirmation dialog
- [ ] Verify cancel API call
- [ ] Test auto-cancel khi hết thời gian

### Authenticated Booking Flow:
- [ ] Login với user account
- [ ] Tạo booking → verify thông tin auto-fill
- [ ] Verify redirect đến QR payment page
- [ ] Verify tất cả features giống guest flow

### Track Booking:
- [ ] Access `/booking/track?token={token}`
- [ ] Verify booking details hiển thị đúng
- [ ] Verify payment status badge
- [ ] Verify booking type badge

### Edge Cases:
- [ ] QR payment = null → verify fallback UI
- [ ] Invalid token → verify error message
- [ ] Expired booking → verify expired message
- [ ] Network error → verify error handling

---

## 🔄 Các vấn đề còn lại (không liên quan đến booking flow)

Có một số lint errors trong `app/(client)/booking/page.tsx` nhưng đây là các vấn đề pre-existing không liên quan đến booking flow changes:
- Duplicate property names trong `amenityIcons` object (lines 57-58)
- Type issues với `Room` type definition
- Các issues này tồn tại từ trước và nằm ngoài scope của task này

---

## 📚 Tài liệu tham khảo

- API Documentation: Booking API Flow v2
- Backend endpoints: `/api/Booking/*`
- QR Payment Helper: `QRPaymentHelper.GenerateQRPaymentInfoAsync`
- Booking Timeout: `BookingTimeoutChecker.ScheduleTimeoutCheck`
