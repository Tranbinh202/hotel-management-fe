# Phân tích luồng Booking - Các vấn đề cần sửa

## Tổng quan
Sau khi kiểm tra toàn bộ luồng booking của client theo docs API v2, đã phát hiện một số vấn đề quan trọng cần sửa để đảm bảo tương thích với backend.

---

## 1. ❌ CRITICAL: API Response Structure không khớp

### Vấn đề
API `POST /api/Booking/guest` trả về response với cấu trúc:
```json
{
  "isSuccess": true,
  "statusCode": 201,
  "message": "...",
  "data": {
    "booking": { ... },
    "bookingToken": "...",
    "qrPayment": { ... },
    "paymentDeadline": "..."
  }
}
```

Nhưng code client đang expect:
```typescript
// lib/api/bookings.ts line 41-44
createByGuest: async (
  data: CreateGuestBookingRequest
): Promise<GuestBookingResponse> => {
  return apiClient.post<GuestBookingResponse>("/Booking/guest", data);
},
```

### Giải pháp
Type `GuestBookingResponse` đã được định nghĩa đúng (lines 893-925 trong api.ts), nhưng cần kiểm tra xem `apiClient.post` có unwrap response hay không.

---

## 2. ❌ CRITICAL: Guest Booking Flow - Redirect sai

### Vấn đề
Trong `app/(client)/booking/page.tsx` (lines 266-269):
```typescript
if (guestResponse.isSuccess) {
  // Redirect to tracking page with token
  router.push(`/booking/track?token=${guestResponse.data.bookingToken}`)
}
```

### Theo docs (Step 2 - Create booking):
- Backend trả về `qrPayment` và `paymentDeadline` 
- Client cần hiển thị QR code để user thanh toán trong 15 phút
- Booking sẽ tự động cancel nếu không thanh toán

### Giải pháp cần làm
Sau khi tạo guest booking thành công, cần:
1. Redirect đến trang hiển thị QR payment (giống như `/booking/success`)
2. Truyền đầy đủ thông tin: `bookingId`, `token`, `qrPayment`, `paymentDeadline`
3. Hiển thị countdown 15 phút
4. Cho phép user xác nhận đã thanh toán hoặc hủy booking

---

## 3. ❌ Authenticated User Booking Flow - Missing QR Payment

### Vấn đề
Trong `app/(client)/booking/page.tsx` (lines 222-242):
```typescript
if (isAuthenticated && user?.profileDetails && "customerId" in user.profileDetails) {
  response = await bookingsApi.create({
    customerId: user.profileDetails.customerId,
    roomTypes: [...],
    checkInDate: checkInDate.toISOString(),
    checkOutDate: checkOutDate.toISOString(),
    specialRequests: ...
  })

  if (response.isSuccess && response.data.paymentUrl) {
    router.push(response.data.paymentUrl)
  }
}
```

### Theo docs:
API `POST /api/Booking` trả về:
```json
{
  "data": {
    "booking": { ... },
    "bookingToken": "{token-string}",
    "qrPayment": { ... },
    "paymentDeadline": "2025-12-09T10:15:00Z"
  }
}
```

- Backend KHÔNG trả về `paymentUrl` trong response
- Backend trả về `qrPayment` và `paymentDeadline`
- Client cần hiển thị QR code, KHÔNG redirect đến payment URL

### Giải pháp
Sửa logic để:
1. Nhận `qrPayment` từ response
2. Redirect đến trang hiển thị QR payment
3. Hiển thị countdown 15 phút
4. Cho phép xác nhận thanh toán

---

## 4. ❌ Type Mismatch: BookingResponse vs GuestBookingResponse

### Vấn đề
```typescript
// lib/types/api.ts lines 371-388
export interface BookingResponse {
  isSuccess: boolean;
  data: {
    bookingId: number;
    customerId: number;
    customerName: string;
    roomNames: string[];
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    depositAmount: number;
    paymentUrl: string;  // ❌ Backend KHÔNG trả về field này
    paymentStatus: string;
    depositStatus: string;
    bookingType: string;
  };
  message: string;
}
```

### Theo docs:
Backend trả về:
- `bookingToken`
- `qrPayment` object
- `paymentDeadline`
- KHÔNG có `paymentUrl`

### Giải pháp
Cập nhật `BookingResponse` type để khớp với API response thực tế.

---

## 5. ⚠️ Missing: Payment Confirmation Flow

### Vấn đề
Sau khi user chuyển khoản, cần gọi API để thông báo:
```
POST /api/Booking/confirm-payment
{
  "bookingId": 123,
  "isCancel": false
}
```

### Hiện tại
- File `booking/success/page.tsx` đã implement flow này (lines 40-73)
- Nhưng flow này chỉ được dùng cho success page, không được dùng sau guest booking

### Giải pháp
Cần tạo một trang QR payment chung cho cả:
1. Guest booking
2. Authenticated user booking

Trang này cần:
- Hiển thị QR code
- Countdown 15 phút
- Button "Tôi đã chuyển khoản" → gọi `confirm-payment` với `isCancel: false`
- Button "Hủy booking" → gọi `confirm-payment` với `isCancel: true`

---

## 6. ⚠️ Booking Details Page - Missing Fields

### Vấn đề
`app/(client)/booking/[key]/page.tsx` hiển thị booking details nhưng:
- Không hiển thị `roomTypeDetails` (quantity, price per room type)
- Không hiển thị `orderCode`
- Không hiển thị `customerEmail`, `customerPhone` (backend không populate)

### Theo docs:
Backend response có field `roomTypeDetails`:
```json
"roomTypeDetails": [
  {
    "roomTypeId": 1,
    "roomTypeName": "Standard",
    "roomTypeCode": "STD",
    "quantity": 2,
    "pricePerNight": 500000,
    "subTotal": 2000000
  }
]
```

### Giải pháp
Cập nhật UI để hiển thị đầy đủ thông tin room types và pricing breakdown.

---

## 7. ⚠️ Track Booking Page - Status Field Mismatch

### Vấn đề
`app/(client)/booking/track/page.tsx` line 103:
```typescript
{getStatusBadge(booking.status)}
```

Nhưng `BookingDetails` type không có field `status`, chỉ có `paymentStatus` và `bookingType`.

### Giải pháp
Sửa để dùng `paymentStatus` hoặc thêm field `status` vào type nếu backend có trả về.

---

## 8. ✅ Good: Check Availability API

API `POST /api/Booking/check-availability` được implement đúng:
- Request structure đúng
- Response handling đúng
- Type definitions đúng

---

## 9. ✅ Good: Cancel Booking API

API `DELETE /api/Booking/{bookingId}` được implement đúng trong:
- `lib/api/bookings.ts` lines 117-123
- `lib/hooks/use-bookings.ts` lines 83-103

---

## 10. ✅ Good: My Bookings API

API `GET /api/Booking/my-bookings` được implement đúng:
- Hook `useMyBookings()` đã được tạo
- Type definitions đúng

---

## Tóm tắt các action items cần làm

### Priority 1 (CRITICAL)
1. ✅ Sửa `BookingResponse` type - loại bỏ `paymentUrl`, thêm `bookingToken`, `qrPayment`, `paymentDeadline`
2. ✅ Tạo trang QR Payment chung cho cả guest và authenticated user
3. ✅ Sửa redirect flow sau khi create booking (cả guest và authenticated)

### Priority 2 (HIGH)
4. ✅ Implement payment confirmation flow đầy đủ
5. ✅ Thêm countdown timer 15 phút
6. ✅ Hiển thị đầy đủ `roomTypeDetails` trong booking details page

### Priority 3 (MEDIUM)
7. ⚠️ Fix status field trong track booking page
8. ⚠️ Kiểm tra và fix các field còn thiếu (customerEmail, customerPhone)

---

## Luồng đúng theo docs

### Guest Booking Flow:
1. User chọn phòng → `/booking` page
2. Nhập thông tin → Submit
3. Call `POST /api/Booking/guest`
4. Backend trả về: `{ booking, bookingToken, qrPayment, paymentDeadline }`
5. Redirect đến `/booking/payment?token={bookingToken}`
6. Hiển thị QR code + countdown 15 phút
7. User chuyển khoản → Click "Tôi đã chuyển khoản"
8. Call `POST /api/Booking/confirm-payment` với `isCancel: false`
9. Backend set status = `PendingConfirmation`
10. Hiển thị message: "Quản lý sẽ kiểm tra và xác nhận"

### Authenticated User Booking Flow:
1. User đăng nhập → chọn phòng → `/booking` page
2. Thông tin tự động fill từ profile
3. Submit → Call `POST /api/Booking`
4. Backend trả về: `{ booking, bookingToken, qrPayment, paymentDeadline }`
5. **GIỐNG GUEST FLOW** từ bước 5 trở đi

### Cancel Flow:
- User click "Hủy booking"
- Call `POST /api/Booking/confirm-payment` với `isCancel: true`
- Backend set status = `Cancelled`
- Hoặc dùng `DELETE /api/Booking/{bookingId}` nếu đã đăng nhập
