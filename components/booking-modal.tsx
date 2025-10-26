"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { bookingsApi, type BookingRequest } from "@/lib/api/bookings"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface BookingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    room: {
        roomId: number
        roomType: string
        pricePerNight: number
    }
}

export function BookingModal({ open, onOpenChange, room }: BookingModalProps) {
    const { toast } = useToast()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Step 1: Dates and quantity
    const [checkInDate, setCheckInDate] = useState<Date>()
    const [checkOutDate, setCheckOutDate] = useState<Date>()
    const [quantity, setQuantity] = useState(1)

    // Step 2: Personal information
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [identityCard, setIdentityCard] = useState("")
    const [address, setAddress] = useState("")
    const [specialRequests, setSpecialRequests] = useState("")

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const calculateNights = () => {
        if (!checkInDate || !checkOutDate) return 0
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const calculateTotal = () => {
        const nights = calculateNights()
        return nights * room.pricePerNight * quantity
    }

    const handleNext = () => {
        if (step === 1) {
            if (!checkInDate || !checkOutDate) {
                toast({
                    title: "Thiếu thông tin",
                    description: "Vui lòng chọn ngày nhận và trả phòng",
                    variant: "destructive",
                })
                return
            }
            if (checkOutDate <= checkInDate) {
                toast({
                    title: "Ngày không hợp lệ",
                    description: "Ngày trả phòng phải sau ngày nhận phòng",
                    variant: "destructive",
                })
                return
            }
            setStep(2)
        } else if (step === 2) {
            if (!fullName || !email || !phoneNumber || !identityCard || !address) {
                toast({
                    title: "Thiếu thông tin",
                    description: "Vui lòng điền đầy đủ thông tin cá nhân",
                    variant: "destructive",
                })
                return
            }
            setStep(3)
        }
    }

    const handleBack = () => {
        setStep(step - 1)
    }

    const handleSubmit = async () => {
        if (!checkInDate || !checkOutDate) return

        setIsSubmitting(true)
        try {
            const bookingData: BookingRequest = {
                fullName,
                email,
                phoneNumber,
                identityCard,
                address,
                roomTypes: [
                    {
                        roomTypeId: room.roomId,
                        quantity,
                    },
                ],
                checkInDate: checkInDate.toISOString(),
                checkOutDate: checkOutDate.toISOString(),
                specialRequests: specialRequests || undefined,
            }

            const response = await bookingsApi.create(bookingData)

            if (response.isSuccess) {
                toast({
                    title: "Đặt phòng thành công!",
                    description: `Mã đặt phòng: ${response.data.bookingCode}`,
                })
                onOpenChange(false)
                // Reset form
                setStep(1)
                setCheckInDate(undefined)
                setCheckOutDate(undefined)
                setQuantity(1)
                setFullName("")
                setEmail("")
                setPhoneNumber("")
                setIdentityCard("")
                setAddress("")
                setSpecialRequests("")
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể đặt phòng. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Đặt phòng - {room.roomType}</DialogTitle>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                                    step >= s ? "bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] text-white" : "bg-gray-200 text-gray-500",
                                )}
                            >
                                {s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={cn(
                                        "flex-1 h-1 mx-2 transition-colors",
                                        step > s ? "bg-gradient-to-r from-[#ff5e7e] to-[#ff4569]" : "bg-gray-200",
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Dates and Quantity */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ngày nhận phòng</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !checkInDate && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {checkInDate ? format(checkInDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={checkInDate}
                                            onSelect={setCheckInDate}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Ngày trả phòng</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !checkOutDate && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {checkOutDate ? format(checkOutDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={checkOutDate}
                                            onSelect={setCheckOutDate}
                                            disabled={(date) => date < new Date() || (checkInDate ? date <= checkInDate : false)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Số lượng phòng</Label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={quantity}
                                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                            />
                        </div>

                        {checkInDate && checkOutDate && (
                            <div className="bg-gradient-to-br from-[#ff5e7e]/10 to-[#a78bfa]/10 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Số đêm:</span>
                                    <span className="font-semibold">{calculateNights()} đêm</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Giá mỗi đêm:</span>
                                    <span className="font-semibold">{formatPrice(room.pricePerNight)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Số phòng:</span>
                                    <span className="font-semibold">{quantity}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between">
                                    <span className="font-semibold">Tổng cộng:</span>
                                    <span className="text-xl font-bold text-[#ff5e7e]">{formatPrice(calculateTotal())}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Personal Information */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Họ và tên *</Label>
                            <Input placeholder="Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Số điện thoại *</Label>
                                <Input
                                    type="tel"
                                    placeholder="0123456789"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>CMND/CCCD *</Label>
                            <Input
                                placeholder="001234567890"
                                value={identityCard}
                                onChange={(e) => setIdentityCard(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Địa chỉ *</Label>
                            <Input
                                placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Yêu cầu đặc biệt (tùy chọn)</Label>
                            <Textarea
                                placeholder="Ví dụ: Tầng cao, view đẹp, giường đôi..."
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#ff5e7e]/10 to-[#a78bfa]/10 rounded-lg p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Thông tin đặt phòng</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Loại phòng:</span>
                                    <span className="font-medium">{room.roomType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nhận phòng:</span>
                                    <span className="font-medium">
                                        {checkInDate && format(checkInDate, "dd/MM/yyyy", { locale: vi })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Trả phòng:</span>
                                    <span className="font-medium">
                                        {checkOutDate && format(checkOutDate, "dd/MM/yyyy", { locale: vi })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Số đêm:</span>
                                    <span className="font-medium">{calculateNights()} đêm</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Số phòng:</span>
                                    <span className="font-medium">{quantity}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="font-semibold text-lg mb-2">Thông tin khách hàng</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Họ tên:</span>
                                        <span className="font-medium">{fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Điện thoại:</span>
                                        <span className="font-medium">{phoneNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">CMND/CCCD:</span>
                                        <span className="font-medium">{identityCard}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Địa chỉ:</span>
                                        <span className="font-medium text-right max-w-[60%]">{address}</span>
                                    </div>
                                    {specialRequests && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Yêu cầu:</span>
                                            <span className="font-medium text-right max-w-[60%]">{specialRequests}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-lg font-semibold">Tổng thanh toán:</span>
                                <span className="text-2xl font-bold text-[#ff5e7e]">{formatPrice(calculateTotal())}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                    {step > 1 && (
                        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button
                            onClick={handleNext}
                            className="ml-auto bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] hover:from-[#ff4569] hover:to-[#ff2d54] text-white"
                        >
                            Tiếp tục
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="ml-auto bg-gradient-to-r from-[#ff5e7e] to-[#ff4569] hover:from-[#ff4569] hover:to-[#ff2d54] text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận đặt phòng"
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
