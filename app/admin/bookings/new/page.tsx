"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { offlineBookingApi } from "@/lib/api/offline-bookings"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { CustomerSearchResult, AvailableRoom, CreateOfflineBookingRequest } from "@/lib/types/api"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

const STORAGE_KEY = "new_booking_form"

export default function NewOfflineBookingPage() {
  const router = useRouter()
  // const queryClient = useQueryClient() // Removed as it's not used in the updates
  // const [currentDraftId, setCurrentDraftId] = useState<string | null>(null) // Removed as drafts are not supported in updates
  // const [availableDrafts, setAvailableDrafts] = useState<Array<{ id: string; timestamp: number; preview: string }>>([]) // Removed as drafts are not supported in updates
  // const [draftToDelete, setDraftToDelete] = useState<string | null>(null) // Removed as drafts are not supported in updates

  const [searchKey, setSearchKey] = useState("")
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const [formData, setFormData] = useState<CreateOfflineBookingRequest>({
    customerId: null,
    fullName: "",
    email: "",
    phoneNumber: "",
    identityCard: "",
    address: "",
    checkInDate: "",
    checkOutDate: "",
    specialRequests: "",
    paymentMethod: "Cash",
    paymentNote: "",
  })

  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)

  const [showQRDialog, setShowQRDialog] = useState(false)
  const [qrPaymentData, setQrPaymentData] = useState<any>(null)

  const handleSearchCustomer = async () => {
    if (searchKey.length < 3) {
      toast({
        title: "Thông báo",
        description: "Vui lòng nhập ít nhất 3 ký tự để tìm kiếm",
        variant: "default",
      })
      return
    }

    setIsSearching(true)
    try {
      const response = await offlineBookingApi.searchCustomer(searchKey)
      if (response.isSuccess && response.data && response.data.length > 0) {
        setSearchResults(response.data)
        toast({
          title: "Tìm thấy khách hàng",
          description: `Tìm thấy ${response.data.length} khách hàng phù hợp`,
        })
      } else {
        setSearchResults([])
        toast({
          title: "Không tìm thấy",
          description: "Không tìm thấy khách hàng. Vui lòng nhập thông tin mới.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tìm kiếm khách hàng",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectCustomer = (customer: CustomerSearchResult) => {
    setSelectedCustomer(customer)
    setFormData({
      ...formData,
      customerId: customer.customerId,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      identityCard: customer.identityCard || "",
      address: customer.address || "",
    })
    setSearchResults([])
    toast({
      title: "Đã chọn khách hàng",
      description: `${customer.fullName} - Đã đặt ${customer.totalBookings} lần`,
    })
  }

  const handleSearchRooms = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ngày nhận và trả phòng",
        variant: "destructive",
      })
      return
    }

    setIsLoadingRooms(true)
    try {
      const response = await offlineBookingApi.searchAvailableRooms({
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
      })

      if (response.isSuccess && response.data) {
        setAvailableRooms(response.data.rooms || [])
        toast({
          title: "Tìm thấy phòng",
          description: `Có ${response.data.rooms?.length || 0} phòng trống`,
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tìm kiếm phòng",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const toggleRoomSelection = (roomId: number) => {
    setSelectedRoomIds((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]))
  }

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0
    const nights = Math.ceil(
      (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24),
    )
    return selectedRoomIds.reduce((total, roomId) => {
      const room = availableRooms.find((r) => r.roomId === roomId)
      return total + (room?.pricePerNight || 0) * nights
    }, 0)
  }

  const handleCreateBooking = async () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin khách hàng",
        variant: "destructive",
      })
      return
    }

    if (selectedRoomIds.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ít nhất một phòng",
        variant: "destructive",
      })
      return
    }

    try {
      const bookingRequest: CreateOfflineBookingRequest = {
        customerId: formData.customerId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        identityCard: formData.identityCard,
        address: formData.address,
        roomIds: selectedRoomIds,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod,
        paymentNote: formData.paymentNote,
      }

      const response = await offlineBookingApi.create(bookingRequest)

      if (response.isSuccess && response.data) {
        toast({
          title: "Thành công",
          description: `Đã tạo booking #${response.data.booking.bookingId}`,
        })

        // Show QR payment if available
        if (response.data.qrPayment) {
          setQrPaymentData(response.data.qrPayment)
          setShowQRDialog(true)
        } else {
          router.push("/admin/bookings")
        }
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo booking",
        variant: "destructive",
      })
    }
  }

  const totalNights =
    formData.checkInDate && formData.checkOutDate
      ? Math.ceil(
          (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0

  // The rest of the component logic and JSX remains largely the same, with minor adjustments for the new state and functions.

  // The following code replaces the original `useEffect` hooks for draft management and some state initializations.
  // The original `useRoomTypes` hook is also removed as it's not used in the updated logic.

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/bookings")}
              className="hover:bg-white rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo đặt phòng tại quầy</h1>
              <p className="text-gray-600 mt-1">Booking offline cho khách đến quầy lễ tân</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Search */}
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Tìm kiếm khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Nhập số điện thoại, email hoặc tên khách hàng..."
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="flex-1 h-11"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchCustomer()
                    }}
                  />
                  <Button
                    onClick={handleSearchCustomer}
                    disabled={isSearching}
                    className="bg-[#00008b] hover:bg-[#00008b]/90 h-11 px-6"
                  >
                    {isSearching ? "Đang tìm..." : "Tìm kiếm"}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.customerId}
                        onClick={() => handleSelectCustomer(customer)}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      >
                        <p className="font-bold text-gray-900">{customer.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {customer.email} • {customer.phoneNumber}
                        </p>
                        <p className="text-xs text-green-700 mt-1">Đã đặt {customer.totalBookings} lần</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Customer Info */}
                {selectedCustomer && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{selectedCustomer.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                        <Badge className="mt-2 bg-blue-600">
                          Khách quen - {selectedCustomer.totalBookings} lần đặt
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(null)
                          setFormData({
                            ...formData,
                            customerId: null,
                            fullName: "",
                            email: "",
                            phoneNumber: "",
                            identityCard: "",
                            address: "",
                          })
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information Form */}
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Họ tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="0901234567"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CMND/CCCD</Label>
                    <Input
                      value={formData.identityCard}
                      onChange={(e) => setFormData({ ...formData, identityCard: e.target.value })}
                      placeholder="001234567890"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Đường ABC, TP.HCM"
                    className="h-11"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Chọn ngày đặt phòng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Ngày nhận phòng</Label>
                    <DatePicker
                      value={formData.checkInDate ? new Date(formData.checkInDate) : undefined}
                      onChange={(date) => {
                        if (date) {
                          date.setHours(14, 0, 0, 0)
                          setFormData({ ...formData, checkInDate: date.toISOString() })
                          setAvailableRooms([]) // Clear rooms when date changes
                          setSelectedRoomIds([])
                        }
                      }}
                      placeholder="Chọn ngày nhận phòng"
                      minDate={new Date()}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày trả phòng</Label>
                    <DatePicker
                      value={formData.checkOutDate ? new Date(formData.checkOutDate) : undefined}
                      onChange={(date) => {
                        if (date) {
                          date.setHours(12, 0, 0, 0)
                          setFormData({ ...formData, checkOutDate: date.toISOString() })
                          setAvailableRooms([])
                          setSelectedRoomIds([])
                        }
                      }}
                      placeholder="Chọn ngày trả phòng"
                      minDate={formData.checkInDate ? new Date(formData.checkInDate) : new Date()}
                      className="h-11"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSearchRooms}
                  disabled={!formData.checkInDate || !formData.checkOutDate || isLoadingRooms}
                  className="w-full bg-[#ffd700] text-[#00008b] hover:bg-[#ffd700]/90 h-11 font-semibold"
                >
                  {isLoadingRooms ? "Đang tìm phòng..." : "Tìm phòng trống"}
                </Button>
              </CardContent>
            </Card>

            {/* Available Rooms */}
            {availableRooms.length > 0 && (
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Phòng có sẵn ({availableRooms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRooms.map((room) => (
                      <div
                        key={room.roomId}
                        onClick={() => toggleRoomSelection(room.roomId)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedRoomIds.includes(room.roomId)
                            ? "border-[#00008b] bg-[#00008b]/5"
                            : "border-gray-200 hover:border-[#00008b]/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{room.roomName}</h4>
                            <p className="text-sm text-gray-600">{room.roomTypeName}</p>
                          </div>
                          {selectedRoomIds.includes(room.roomId) && <Badge className="bg-[#00008b]">Đã chọn</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>👥 {room.maxOccupancy} người</span>
                          <span>📐 {room.roomSize}m²</span>
                        </div>
                        <p className="text-lg font-bold text-[#00008b]">
                          {room.pricePerNight.toLocaleString("vi-VN")} VNĐ/đêm
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Yêu cầu đặc biệt</Label>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Phòng tầng cao, view đẹp..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phương thức thanh toán</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Tiền mặt</SelectItem>
                        <SelectItem value="Card">Thẻ</SelectItem>
                        <SelectItem value="Transfer">Chuyển khoản</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú thanh toán</Label>
                    <Input
                      value={formData.paymentNote}
                      onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
                      placeholder="Đã thanh toán..."
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="bg-white shadow-xl border-0 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#00008b] to-[#ffd700] text-white p-6">
                  <h3 className="text-xl font-bold">Tóm tắt đặt phòng</h3>
                </div>
                <CardContent className="p-6 space-y-5">
                  {/* Date Info */}
                  {formData.checkInDate && formData.checkOutDate ? (
                    <div className="space-y-3 pb-5 border-b">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Nhận phòng:</span>
                        <span className="font-bold">
                          {format(new Date(formData.checkInDate), "dd/MM/yyyy", { locale: vi })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trả phòng:</span>
                        <span className="font-bold">
                          {format(new Date(formData.checkOutDate), "dd/MM/yyyy", { locale: vi })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-gray-600">Số đêm:</span>
                        <span className="font-bold text-[#00008b]">{totalNights} đêm</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 px-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">Chưa chọn ngày</p>
                    </div>
                  )}

                  {/* Selected Rooms */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Phòng đã chọn ({selectedRoomIds.length})</h4>
                    {selectedRoomIds.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">Chưa chọn phòng nào</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedRoomIds.map((roomId) => {
                          const room = availableRooms.find((r) => r.roomId === roomId)
                          if (!room) return null
                          return (
                            <div key={roomId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{room.roomName}</p>
                                <p className="text-xs text-gray-500">{room.roomTypeName}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">{room.pricePerNight.toLocaleString("vi-VN")}</p>
                                <p className="text-xs text-gray-500">VNĐ/đêm</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="space-y-3 pt-5 border-t">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-700">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-[#00008b]">
                        {calculateTotal().toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tiền cọc (30%):</span>
                      <span className="font-semibold">{(calculateTotal() * 0.3).toLocaleString("vi-VN")} VNĐ</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleCreateBooking}
                    disabled={selectedRoomIds.length === 0}
                    className="w-full bg-gradient-to-r from-[#00008b] to-[#ffd700] hover:opacity-90 h-12 text-base font-bold"
                  >
                    ✅ XÁC NHẬN BOOKING
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* QR Payment Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán chuyển khoản</DialogTitle>
            <DialogDescription>Quét mã QR để thanh toán hoặc chuyển khoản theo thông tin bên dưới</DialogDescription>
          </DialogHeader>
          {qrPaymentData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Image
                  src={qrPaymentData.qrCodeUrl || "/placeholder.svg"}
                  alt="QR Payment"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-semibold">{qrPaymentData.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tài khoản:</span>
                  <span className="font-semibold">{qrPaymentData.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chủ tài khoản:</span>
                  <span className="font-semibold">{qrPaymentData.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-[#00008b]">
                    {qrPaymentData.amount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nội dung:</span>
                  <span className="font-semibold">{qrPaymentData.description}</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShowQRDialog(false)
                  router.push("/admin/bookings")
                }}
                className="w-full bg-[#00008b] hover:bg-[#00008b]/90"
              >
                Hoàn tất
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
