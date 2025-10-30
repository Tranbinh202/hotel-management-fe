import { z } from "zod"

const bookingDatesBase = z.object({
  checkInDate: z.date({
    required_error: "Vui lòng chọn ngày nhận phòng",
    invalid_type_error: "Ngày nhận phòng không hợp lệ",
  }),
  checkOutDate: z.date({
    required_error: "Vui lòng chọn ngày trả phòng",
    invalid_type_error: "Ngày trả phòng không hợp lệ",
  }),
  quantity: z
    .number({
      required_error: "Vui lòng nhập số lượng phòng",
      invalid_type_error: "Số lượng phòng phải là số",
    })
    .int("Số lượng phòng phải là số nguyên")
    .min(1, "Số lượng phòng phải ít nhất là 1")
    .max(10, "Số lượng phòng tối đa là 10"),
})

export const bookingDatesSchema = bookingDatesBase
  .refine((d) => d.checkInDate >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Ngày nhận phòng phải từ hôm nay trở đi",
    path: ["checkInDate"],
  })
  .refine((d) => !d.checkInDate || !d.checkOutDate || d.checkOutDate > d.checkInDate, {
    message: "Ngày trả phòng phải sau ngày nhận phòng",
    path: ["checkOutDate"],
  })
  .refine(
    (d) => {
      if (!d.checkInDate || !d.checkOutDate) return true
      const diffDays = (d.checkOutDate.getTime() - d.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays >= 1
    },
    {
      message: "Phải đặt ít nhất 1 đêm",
      path: ["checkOutDate"],
    },
  )

export const guestInfoSchema = z.object({
  fullName: z
    .string({ required_error: "Vui lòng nhập họ tên" })
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Họ tên chỉ được chứa chữ cái và khoảng trắng"),
  email: z
    .string({ required_error: "Vui lòng nhập email" })
    .email("Email không hợp lệ")
    .max(100, "Email không được quá 100 ký tự"),
  phoneNumber: z
    .string({ required_error: "Vui lòng nhập số điện thoại" })
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (VD: 0123456789 hoặc +84123456789)"),
  identityCard: z
    .string()
    .regex(/^[0-9]{9,12}$/, "CMND/CCCD phải có 9-12 chữ số")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "Địa chỉ không được quá 200 ký tự").optional().or(z.literal("")),
  specialRequests: z.string().max(500, "Yêu cầu đặc biệt không được quá 500 ký tự").optional().or(z.literal("")),
})

export const completeBookingSchema = bookingDatesBase.merge(guestInfoSchema).superRefine((d, ctx) => {
  // Copy validation rules from bookingDatesSchema
  const today0 = new Date(new Date().setHours(0, 0, 0, 0))
  if (d.checkInDate < today0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày nhận phòng phải từ hôm nay trở đi",
      path: ["checkInDate"],
    })
  }
  if (d.checkOutDate && d.checkInDate && d.checkOutDate <= d.checkInDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày trả phòng phải sau ngày nhận phòng",
      path: ["checkOutDate"],
    })
  }
  if (d.checkOutDate && d.checkInDate) {
    const diffDays = (d.checkOutDate.getTime() - d.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phải đặt ít nhất 1 đêm",
        path: ["checkOutDate"],
      })
    }
  }
})

export type BookingDatesFormData = z.infer<typeof bookingDatesSchema>
export type GuestInfoFormData = z.infer<typeof guestInfoSchema>
export type CompleteBookingFormData = z.infer<typeof completeBookingSchema>
