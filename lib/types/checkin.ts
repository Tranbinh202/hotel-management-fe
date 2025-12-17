// Check-in booking response
export interface CheckInBookingResponse {
    isSuccess: boolean
    statusCode: number
    message: string
    data?: {
        bookingId: number
        checkInTime: string
        roomNumbers: string[]
        customerName: string
        checkOutDate: string
    }
}
