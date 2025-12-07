"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSearchCustomer, useCheckAvailableRooms, useCreateOfflineBooking } from "@/lib/hooks/use-offline-bookings"
import { toast } from "@/hooks/use-toast"
import { Search, Loader2, User, Calendar, Hotel, CreditCard, CheckCircle2, X, Copy, Printer } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { CustomerSearchResult, CreateOfflineBookingDto, OfflineBookingResponse } from "@/lib/types/api"

interface SelectedRoom {
    roomId: number
    roomName: string
    roomTypeName: string
    pricePerNight: number
    maxOccupancy: number
    images: string[]
}

export default function NewOfflineBookingPage() {
    const router = useRouter()

    // Search state
    const [searchKey, setSearchKey] = useState("")
    const [debouncedSearchKey, setDebouncedSearchKey] = useState("")
    const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([])

    // Form state
    const [formData, setFormData] = useState<CreateOfflineBookingDto>({
        customerId: null,
        fullName: "",
        email: "",
        phoneNumber: "",
        identityCard: "",
        address: "",
        roomIds: [],
        checkInDate: "",
        checkOutDate: "",
        specialRequests: "",
        paymentMethod: "Cash",
        paymentNote: "",
    })

    // Room search state
    const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([])
    const [shouldSearchRooms, setShouldSearchRooms] = useState(false)

    // Booking state
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [bookingResult, setBookingResult] = useState<OfflineBookingResponse | null>(null)

    // Debounce search key
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchKey(searchKey)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchKey])

    // React Query hooks
    const { data: customerSearchData, isLoading: isSearching } = useSearchCustomer(debouncedSearchKey)

    const checkAvailableRoomsMutation = useCheckAvailableRooms()

    const createBookingMutation = useCreateOfflineBooking()

    // Handle customer search results
    useEffect(() => {
        if (customerSearchData?.isSuccess && customerSearchData.data.length > 0) {
            setSearchResults(customerSearchData.data)

            // Don't auto-fill if multiple results - let user choose
            // Only auto-fill if exactly one result
            // if (customerSearchData.data.length === 1) {
            //     handleSelectCustomer(customerSearchData.data[0])
            // }
        } else if (debouncedSearchKey.length >= 3 && customerSearchData?.isSuccess && customerSearchData.data.length === 0) {
            // Only show "not found" toast if user typed at least 3 characters
            toast({
                title: "Không tìm thấy",
                description: "Không tìm thấy khách hàng. Vui lòng nhập thông tin mới.",
            })
            setSearchResults([])

            // Pre-fill phone if it looks like a phone number
            if (/^\d{10,11}$/.test(debouncedSearchKey)) {
                setFormData(prev => ({ ...prev, phoneNumber: debouncedSearchKey }))
            }
        }
    }, [customerSearchData, debouncedSearchKey])

    // Select customer from search results
    const handleSelectCustomer = (customer: CustomerSearchResult) => {
        setFormData(prev => ({
            ...prev,
            customerId: customer.customerId,
            fullName: customer.fullName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            identityCard: customer.identityCard || "",
            address: customer.address || "",
        }))

        toast({
            title: "Đã chọn khách hàng",
            description: `${customer.fullName} - Đã đặt ${customer.totalBookings} lần`,
        })

        setSearchResults([])
        setSearchKey("")
    }

    // Search available rooms
    const handleSearchRooms = () => {
        if (!formData.checkInDate || !formData.checkOutDate) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn ngày nhận phòng và trả phòng",
                variant: "destructive",
            })
            return
        }

        checkAvailableRoomsMutation.mutate(
            {
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate,
                pageSize: 50,
            },
            {
                onSuccess: (response) => {
                    if (response.isSuccess) {
                        // availableRooms is now from mutation data
                        toast({
                            title: "Tìm thấy phòng",
                            description: `Có ${response.data.totalCount} phòng trống`,
                        })
                    }
                },
                onError: (error: any) => {
                    toast({
                        title: "Lỗi tìm phòng",
                        description: error.message || "Không thể tìm phòng trống",
                        variant: "destructive",
                    })
                },
            }
        )
    }

    // Toggle room selection
    const handleToggleRoom = (room: any) => {
        const isSelected = selectedRooms.some(r => r.roomId === room.roomId)

        if (isSelected) {
            setSelectedRooms(prev => prev.filter(r => r.roomId !== room.roomId))
            setFormData(prev => ({
                ...prev,
                roomIds: prev.roomIds.filter(id => id !== room.roomId),
            }))
        } else {
            const newRoom: SelectedRoom = {
                roomId: room.roomId,
                roomName: room.roomName,
                roomTypeName: room.roomTypeName,
                pricePerNight: room.pricePerNight,
                maxOccupancy: room.maxOccupancy,
                images: room.images || [],
            }
            setSelectedRooms(prev => [...prev, newRoom])
            setFormData(prev => ({
                ...prev,
                roomIds: [...prev.roomIds, room.roomId],
            }))
        }
    }

    // Calculate total
    const calculateTotal = () => {
        if (!formData.checkInDate || !formData.checkOutDate || selectedRooms.length === 0) {
            return { nights: 0, totalAmount: 0, depositAmount: 0 }
        }

        const checkIn = new Date(formData.checkInDate)
        const checkOut = new Date(formData.checkOutDate)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

        const totalAmount = selectedRooms.reduce((sum, room) => sum + (room.pricePerNight * nights), 0)
        const depositAmount = Math.round(totalAmount * 0.3)

        return { nights, totalAmount, depositAmount }
    }

    // Submit booking
    const handleConfirmBooking = () => {
        // Validation
        if (!formData.fullName.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập họ tên khách hàng",
                variant: "destructive",
            })
            return
        }

        if (!formData.email.trim() || !formData.email.includes("@")) {
            toast({
                title: "Lỗi",
                description: "Email không hợp lệ",
                variant: "destructive",
            })
            return
        }

        if (!formData.phoneNumber.trim() || formData.phoneNumber.trim().length < 10) {
            toast({
                title: "Lỗi",
                description: "Số điện thoại không hợp lệ",
                variant: "destructive",
            })
            return
        }

        if (selectedRooms.length === 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn ít nhất một phòng",
                variant: "destructive",
            })
            return
        }

        createBookingMutation.mutate(formData, {
            onSuccess: (response) => {
                if (response.isSuccess) {
                    setBookingResult(response.data)
                    setShowSuccessModal(true)

                    toast({
                        title: "Đặt phòng thành công",
                        description: `Mã booking: #${response.data.booking.bookingId}`,
                    })
                }
            },
            onError: (error: any) => {
                toast({
                    title: "Đặt phòng thất bại",
                    description: error.message || "Không thể tạo booking",
                    variant: "destructive",
                })
            },
        })
    }

    // Reset form
    const handleReset = () => {
        setFormData({
            customerId: null,
            fullName: "",
            email: "",
            phoneNumber: "",
            identityCard: "",
            address: "",
            roomIds: [],
            checkInDate: "",
            checkOutDate: "",
            specialRequests: "",
            paymentMethod: "Cash",
            paymentNote: "",
        })
        setSelectedRooms([])
        setSearchResults([])
        setSearchKey("")
    }

    // Copy to clipboard
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Đã sao chép",
            description: `Đã sao chép ${label}`,
        })
    }

    const { nights, totalAmount, depositAmount } = calculateTotal()

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">📝 Đặt Phòng Tại Quầy</h1>
                <p className="text-slate-600 mt-2">Tạo booking cho khách hàng đến trực tiếp</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Tìm kiếm khách hàng
                            </CardTitle>
                            <CardDescription>
                                Nhập số điện thoại, email hoặc tên để tìm khách hàng có sẵn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Số điện thoại / Email / Tên (tự động tìm)"
                                    value={searchKey}
                                    onChange={(e) => setSearchKey(e.target.value)}
                                />
                                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Kết quả tìm kiếm ({searchResults.length} khách hàng):</Label>
                                    {searchResults.map((customer) => (
                                        <Card
                                            key={customer.customerId}
                                            className="cursor-pointer hover:bg-slate-50 transition-colors border-l-4 border-l-blue-500"
                                            onClick={() => handleSelectCustomer(customer)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold text-lg">{customer.fullName}</p>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {customer.matchedBy === "Name" ? "Tên" : customer.matchedBy === "Phone" ? "SĐT" : "Email"}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-1 text-sm text-slate-600">
                                                            <p>
                                                                📞 {customer.phoneNumber || <span className="text-slate-400">Chưa có SĐT</span>}
                                                            </p>
                                                            <p>
                                                                📧 {customer.email || <span className="text-slate-400">Chưa có email</span>}
                                                            </p>
                                                            {customer.identityCard && (
                                                                <p>🆔 {customer.identityCard}</p>
                                                            )}
                                                            {customer.address && (
                                                                <p>📍 {customer.address}</p>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                                ✓ Đã đặt {customer.totalBookings} lần
                                                            </Badge>
                                                            {customer.lastBookingDate && (
                                                                <span className="text-xs text-slate-500">
                                                                    Lần cuối: {format(new Date(customer.lastBookingDate), "dd/MM/yyyy", { locale: vi })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Họ tên *</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="0901234567"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="identityCard">CMND/CCCD</Label>
                                    <Input
                                        id="identityCard"
                                        placeholder="001234567890"
                                        value={formData.identityCard}
                                        onChange={(e) => setFormData({ ...formData, identityCard: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    placeholder="123 Đường ABC, TP.HCM"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Thông tin đặt phòng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="checkInDate">Ngày nhận phòng *</Label>
                                    <Input
                                        id="checkInDate"
                                        type="datetime-local"
                                        value={formData.checkInDate}
                                        onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="checkOutDate">Ngày trả phòng *</Label>
                                    <Input
                                        id="checkOutDate"
                                        type="datetime-local"
                                        value={formData.checkOutDate}
                                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSearchRooms}
                                disabled={checkAvailableRoomsMutation.isPending || !formData.checkInDate || !formData.checkOutDate}
                                className="w-full"
                            >
                                {checkAvailableRoomsMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang tìm phòng...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Tìm phòng trống
                                    </>
                                )}
                            </Button>

                            {/* Available Rooms */}
                            {checkAvailableRoomsMutation.data?.data.rooms && checkAvailableRoomsMutation.data.data.rooms.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Chọn phòng ({checkAvailableRoomsMutation.data.data.rooms.length} phòng trống):</Label>
                                    <div className="grid gap-2 max-h-96 overflow-y-auto">
                                        {checkAvailableRoomsMutation.data.data.rooms.map((room) => {
                                            const isSelected = selectedRooms.some(r => r.roomId === room.roomId)
                                            return (
                                                <Card
                                                    key={room.roomId}
                                                    className={`cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-slate-50"
                                                        }`}
                                                    onClick={() => handleToggleRoom(room)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <Checkbox checked={isSelected} />
                                                            <div className="flex-1">
                                                                <p className="font-semibold">{room.roomName} - {room.roomTypeName}</p>
                                                                <p className="text-sm text-slate-600">
                                                                    {room.pricePerNight.toLocaleString("vi-VN")} VNĐ/đêm • {room.maxOccupancy} người
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Thanh toán & Ghi chú
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Phương thức thanh toán *</Label>
                                <RadioGroup
                                    value={formData.paymentMethod}
                                    onValueChange={(value: "Cash" | "Card" | "Transfer") =>
                                        setFormData({ ...formData, paymentMethod: value })
                                    }
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Cash" id="cash" />
                                        <Label htmlFor="cash" className="cursor-pointer">💵 Tiền mặt</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Card" id="card" />
                                        <Label htmlFor="card" className="cursor-pointer">💳 Thẻ</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Transfer" id="transfer" />
                                        <Label htmlFor="transfer" className="cursor-pointer">🏦 Chuyển khoản</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
                                <Textarea
                                    id="specialRequests"
                                    placeholder="Ví dụ: Phòng tầng cao, view đẹp..."
                                    value={formData.specialRequests}
                                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentNote">Ghi chú thanh toán</Label>
                                <Input
                                    id="paymentNote"
                                    placeholder="Ví dụ: Đã thanh toán tiền mặt..."
                                    value={formData.paymentNote}
                                    onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Tóm tắt đặt phòng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Selected Rooms */}
                            {selectedRooms.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Phòng đã chọn:</Label>
                                    {selectedRooms.map((room) => (
                                        <div key={room.roomId} className="flex items-start justify-between text-sm">
                                            <div className="flex-1">
                                                <p className="font-medium">{room.roomName}</p>
                                                <p className="text-slate-600">{room.roomTypeName}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleRoom(room)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator />

                            {/* Pricing */}
                            {nights > 0 && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Số đêm:</span>
                                        <span className="font-medium">{nights} đêm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Số phòng:</span>
                                        <span className="font-medium">{selectedRooms.length} phòng</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-base">
                                        <span className="font-semibold">Tổng cộng:</span>
                                        <span className="font-bold text-blue-600">
                                            {totalAmount.toLocaleString("vi-VN")} VNĐ
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tiền cọc (30%):</span>
                                        <span className="font-medium text-orange-600">
                                            {depositAmount.toLocaleString("vi-VN")} VNĐ
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button
                                onClick={handleConfirmBooking}
                                disabled={createBookingMutation.isPending || selectedRooms.length === 0}
                                className="w-full bg-linear-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
                                size="lg"
                            >
                                {createBookingMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Xác nhận đặt phòng
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="w-full"
                            >
                                Làm mới
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                            Đặt phòng thành công!
                        </DialogTitle>
                        <DialogDescription>
                            Booking đã được tạo và xác nhận thành công
                        </DialogDescription>
                    </DialogHeader>

                    {bookingResult && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-600">Mã booking:</p>
                                    <p className="font-bold text-lg">#{bookingResult.booking.bookingId}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Khách hàng:</p>
                                    <p className="font-semibold">{bookingResult.booking.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Phòng:</p>
                                    <p className="font-medium">{bookingResult.booking.roomNames.join(", ")}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Tổng tiền:</p>
                                    <p className="font-bold text-blue-600">
                                        {bookingResult.booking.totalAmount.toLocaleString("vi-VN")} VNĐ
                                    </p>
                                </div>
                            </div>

                            {bookingResult.qrPayment && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Thông tin chuyển khoản</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={bookingResult.qrPayment.qrCodeUrl}
                                                alt="QR Code"
                                                className="w-48 h-48 border-2 border-slate-200 rounded"
                                            />
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Ngân hàng:</span>
                                                <span className="font-medium">{bookingResult.qrPayment.bankName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Số tài khoản:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{bookingResult.qrPayment.accountNumber}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            copyToClipboard(bookingResult.qrPayment!.accountNumber, "số tài khoản")
                                                        }
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Số tiền:</span>
                                                <span className="font-bold text-blue-600">
                                                    {bookingResult.qrPayment.amount.toLocaleString("vi-VN")} VNĐ
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Print functionality would go here
                                toast({
                                    title: "In hóa đơn",
                                    description: "Chức năng in đang được phát triển",
                                })
                            }}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            In hóa đơn
                        </Button>
                        <Button
                            onClick={() => {
                                setShowSuccessModal(false)
                                handleReset()
                                router.push("/receptionist/bookings")
                            }}
                        >
                            Hoàn tất
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
