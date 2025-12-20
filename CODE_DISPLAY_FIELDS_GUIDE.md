# 📋 Code vs Display Fields - Usage Guide

## 🎯 Tổng quan

Frontend đã được cập nhật để phân biệt rõ ràng giữa:
- **Logic Fields** (Code): Giá trị tiếng Anh dùng cho điều kiện, so sánh, filter
- **Display Fields**: Giá trị tiếng Việt dùng hiển thị UI cho người dùng

---

## 🔑 Nguyên tắc quan trọng

### ✅ ĐÚNG: Dùng Code fields cho Logic
```typescript
// ✅ Dùng English code cho điều kiện if/else
if (booking.bookingTypeCode === 'Online') {
  showDepositInfo();
} else if (booking.bookingTypeCode === 'WalkIn') {
  hideDepositInfo();
}

// ✅ Dùng English code cho filter
const standardRooms = rooms.filter(r => r.roomTypeCode === 'Standard');

// ✅ Dùng English code cho switch case
switch (booking.depositStatusName) {
  case 'CheckedIn':
    showCheckoutButton();
    break;
  case 'CheckedOut':
    hideCheckoutButton();
    break;
}
```

### ❌ SAI: Dùng Display fields cho Logic
```typescript
// ❌ KHÔNG dùng Vietnamese cho điều kiện
if (booking.bookingType === 'Đặt trực tuyến') { // SAI!
  // Logic sẽ bị break nếu backend đổi text
}

// ❌ KHÔNG dùng Vietnamese cho filter
const standardRooms = rooms.filter(r =>
  r.roomTypeName === 'Phòng Tiêu Chuẩn' // SAI!
);
```

### ✅ ĐÚNG: Dùng Display fields cho UI
```typescript
// ✅ Hiển thị Vietnamese cho user
<div>Loại booking: {booking.bookingType}</div>  // "Đặt tại quầy"
<div>Loại phòng: {room.roomTypeName}</div>      // "Phòng Tiêu Chuẩn"
<div>Dịch vụ: {service.serviceName}</div>       // "Giặt ủi"
```

---

## 📚 TypeScript Interfaces

### BookingDetails & BookingManagementDetails
```typescript
interface BookingDetails {
  // Display fields (Vietnamese)
  paymentStatus: string          // "Đã thanh toán", "Đã nhận phòng"
  depositStatus: string          // "Đã đặt cọc", "Đã nhận phòng"
  bookingType: string            // "Đặt tại quầy", "Đặt trực tuyến"

  // Logic fields (English codes) - OPTIONAL for backward compatibility
  paymentStatusName?: string     // "Paid", "CheckedIn", "CheckedOut"
  depositStatusName?: string     // "Deposited", "CheckedIn"
  bookingTypeCode?: string       // "WalkIn", "Online"
}
```

### Checkout API Types

#### PreviewCheckoutResponse & CheckoutResponse
```typescript
interface PreviewCheckoutResponse {
  bookingType: string            // Display: "Đặt tại quầy"
  bookingTypeCode?: string       // Logic: "WalkIn", "Online"
  roomCharges: RoomChargeDetail[]
  serviceCharges: ServiceChargeDetail[]
  // ... other fields
}
```

#### RoomChargeDetail
```typescript
interface RoomChargeDetail {
  roomTypeName: string           // Display: "Phòng Tiêu Chuẩn"
  roomTypeCode?: string          // Logic: "Standard", "Deluxe"
  // ... other fields
}
```

#### ServiceChargeDetail
```typescript
interface ServiceChargeDetail {
  serviceName: string            // Display: "Giặt ủi", "Massage"
  serviceCode?: string           // Logic: "Laundry", "Massage"
  // ... other fields
}
```

---

## 🔍 Pattern cho Logic Code

### 1. Ưu tiên Code field, fallback về Display field
```typescript
// ✅ Best practice - Backward compatible
const statusCode = booking.depositStatusName || booking.depositStatus;
if (statusCode?.includes('CheckedIn')) {
  // Logic here
}
```

### 2. Example trong BookingDetailModal
```typescript
{/* Show checkout button when checked in */}
{((booking.depositStatusName || booking.depositStatus)?.includes("CheckedIn") ||
  (booking.paymentStatusName || booking.paymentStatus)?.includes("CheckedIn")) && (
  <Button onClick={handleCheckoutClick}>
    Checkout & Thanh toán
  </Button>
)}
```

### 3. Example trong filtering
```typescript
// Filter bookings by type - use CODE field
const onlineBookings = bookings.filter(b =>
  (b.bookingTypeCode || b.bookingType)?.includes('Online')
);

// Filter rooms by type - use CODE field
const deluxeRooms = rooms.filter(r =>
  r.roomTypeCode === 'Deluxe'
);
```

---

## 📊 Field Mapping Table

| Entity | Display Field | Logic Field | Display Values | Logic Values |
|--------|--------------|-------------|----------------|--------------|
| **Booking Type** | `bookingType` | `bookingTypeCode` | "Đặt tại quầy"<br>"Đặt trực tuyến" | "WalkIn"<br>"Online" |
| **Payment Status** | `paymentStatus` | `paymentStatusName` | "Đã thanh toán"<br>"Đã nhận phòng" | "Paid"<br>"CheckedIn"<br>"CheckedOut" |
| **Deposit Status** | `depositStatus` | `depositStatusName` | "Đã đặt cọc"<br>"Đã nhận phòng" | "Deposited"<br>"CheckedIn" |
| **Room Type** | `roomTypeName` | `roomTypeCode` | "Phòng Tiêu Chuẩn"<br>"Phòng Cao Cấp" | "Standard"<br>"Deluxe" |
| **Service** | `serviceName` | `serviceCode` | "Giặt ủi"<br>"Massage" | "Laundry"<br>"Massage" |

---

## 🎨 UI Display Examples

### Hiển thị booking info
```tsx
function BookingCard({ booking }: { booking: BookingManagementDetails }) {
  return (
    <div>
      <div>Loại: {booking.bookingType}</div>           {/* "Đặt tại quầy" */}
      <div>Thanh toán: {booking.paymentStatus}</div>   {/* "Đã nhận phòng" */}

      {/* Logic check using CODE field */}
      {(booking.depositStatusName || booking.depositStatus)?.includes('CheckedIn') && (
        <CheckoutButton />
      )}
    </div>
  );
}
```

### Hiển thị room charges
```tsx
function RoomChargesList({ rooms }: { rooms: RoomChargeDetail[] }) {
  return (
    <div>
      {rooms.map(room => (
        <div key={room.bookingRoomId}>
          <div>{room.roomName} - {room.roomTypeName}</div>  {/* "106 - Phòng Tiêu Chuẩn" */}

          {/* Logic grouping using CODE field */}
          {room.roomTypeCode === 'Deluxe' && (
            <Badge>Premium</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Hard-code Vietnamese in logic
```typescript
// ❌ BAD - Will break if backend changes text
if (booking.bookingType === 'Đặt tại quầy') {
  // ...
}

// ✅ GOOD - Use English code
if (booking.bookingTypeCode === 'WalkIn') {
  // ...
}
```

### ❌ Mistake 2: Use includes() with Vietnamese
```typescript
// ❌ BAD - Fragile
if (booking.paymentStatus?.includes('Đã nhận')) {
  // ...
}

// ✅ GOOD - Use exact English code
if ((booking.paymentStatusName || booking.paymentStatus)?.includes('CheckedIn')) {
  // ...
}
```

### ❌ Mistake 3: Display English code to user
```typescript
// ❌ BAD - User sees English
<div>Status: {booking.paymentStatusName}</div>  // "CheckedIn"

// ✅ GOOD - User sees Vietnamese
<div>Status: {booking.paymentStatus}</div>       // "Đã nhận phòng"
```

---

## 🔧 Backend Requirements

Backend cần đảm bảo trả về **CẢ HAI** fields:

### Booking APIs
- ✅ `bookingType` (Vietnamese) + `bookingTypeCode` (English)
- ✅ `paymentStatus` (Vietnamese) + `paymentStatusName` (English)
- ✅ `depositStatus` (Vietnamese) + `depositStatusName` (English)

### Checkout APIs
- ✅ `bookingType` + `bookingTypeCode`
- ✅ `roomTypeName` + `roomTypeCode` (trong roomCharges)
- ✅ `serviceName` + `serviceCode` (trong serviceCharges)

---

## 📝 Migration Checklist

Khi cập nhật code cũ:

- [ ] Tìm tất cả `if/else` dùng display fields (Vietnamese)
- [ ] Thay thế bằng code fields (English)
- [ ] Thêm fallback cho backward compatibility
- [ ] Kiểm tra UI vẫn hiển thị Vietnamese
- [ ] Test với cả backend cũ và mới

---

## 🚀 Best Practices Summary

1. **LUÔN dùng Code fields cho logic** - if/else, switch, filter, comparison
2. **LUÔN dùng Display fields cho UI** - render text, labels, badges
3. **LUÔN có fallback** - `field.codeField || field.displayField`
4. **KHÔNG hard-code Vietnamese** trong điều kiện logic
5. **KHÔNG hiển thị English codes** cho người dùng

---

**Last Updated:** 2024-12-16
**Status:** ✅ Implemented and Tested
