"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { offlineBookingApi } from "@/lib/api/offline-bookings"
import type { CustomerSearchResult, AvailableRoom, CreateOfflineBookingRequest } from "@/lib/types/api"
import { toast } from "@/hooks/use-toast"

export default function NewOfflineBookingPage() {
  // Same implementation as admin page above
  const router = useRouter()

  const [searchKey, setSearchKey] = useState("")
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const [formData, setFormData] = useState({
    customerId: null as number | null,
    fullName: "",
    email: "",
    phoneNumber: "",
    identityCard: "",
    address: "",
    checkInDate: "",
    checkOutDate: "",
    specialRequests: "",
    paymentMethod: "Cash" as "Cash" | "Card" | "Transfer",
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

        if (response.data.qrPayment) {
          setQrPaymentData(response.data.qrPayment)
          setShowQRDialog(true)
        } else {
          router.push("/receptionist/bookings")
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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Same UI as admin, just change router.push to /receptionist/bookings */}
      {/* ... copy the entire JSX from admin page above, replacing /admin/bookings with /receptionist/bookings ... */}
    </div>
  )
}
