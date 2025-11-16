"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSearchCustomer, useCheckAvailableRooms, useCreateOfflineBooking } from "@/lib/hooks/use-offline-bookings"
import { useRoomTypes } from "@/lib/hooks/use-room-type"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { CustomerSearchResult, CreateOfflineBookingDto, RoomType } from "@/lib/types/api"
import { toast } from "@/hooks/use-toast"
import { storage } from "@/lib/utils/storage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "new_booking_form"

export default function NewBookingPage() {
  const router = useRouter()
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [availableDrafts, setAvailableDrafts] = useState<Array<{ id: string; timestamp: number; preview: string }>>([])
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null)

  const [formData, setFormData] = useState<CreateOfflineBookingDto>(() => {
    const saved = storage.load<CreateOfflineBookingDto>(STORAGE_KEY)
    return saved || {
      fullName: "",
      email: "",
      phoneNumber: "",
      identityCard: "",
      address: "",
      roomTypes: [],
      checkInDate: "",
      checkOutDate: "",
      specialRequests: "",
      depositAmount: 0,
      paymentMethod: "Cash",
      paymentNote: "",
    }
  })

  const [roomSelections, setRoomSelections] = useState<{ roomTypeId: number; quantity: number }[]>(() => {
    const saved = storage.load<CreateOfflineBookingDto>(STORAGE_KEY)
    return saved?.roomTypes || []
  })

  const [filters, setFilters] = useState({
    roomTypeId: "all",
    maxOccupancy: "",
    minPrice: "",
    maxPrice: "",
  })

  const { data: roomTypesData } = useRoomTypes({ PageSize: 50 })
  const checkAvailableRooms = useCheckAvailableRooms()
  const createBooking = useCreateOfflineBooking()

  const roomTypes = roomTypesData?.pages[0]?.items || []

  useEffect(() => {
    const drafts = storage.loadAllDrafts<CreateOfflineBookingDto>(STORAGE_KEY)
    if (drafts) {
      const draftList = Object.entries(drafts).map(([id, draft]) => ({
        id,
        timestamp: draft.timestamp,
        preview: `${draft.data.fullName || 'Chưa có tên'} - ${draft.data.roomTypes?.length || 0} phòng`,
      }))
      // Sort by timestamp descending (newest first)
      draftList.sort((a, b) => b.timestamp - a.timestamp)
      setAvailableDrafts(draftList)
    }
  }, [])

  useEffect(() => {
    const dataToSave = { ...formData, roomTypes: roomSelections }
    
    // Only save if there's some data entered
    if (formData.fullName || formData.email || formData.phoneNumber || roomSelections.length > 0) {
      if (!currentDraftId) {
        const newDraftId = storage.generateDraftId()
        setCurrentDraftId(newDraftId)
        storage.saveDraft(STORAGE_KEY, dataToSave, newDraftId)
        
        // Update available drafts list
        setAvailableDrafts(prev => [{
          id: newDraftId,
          timestamp: Date.now(),
          preview: `${dataToSave.fullName || 'Chưa có tên'} - ${dataToSave.roomTypes?.length || 0} phòng`,
        }, ...prev])
      } else {
        storage.saveDraft(STORAGE_KEY, dataToSave, currentDraftId)
        
        // Update preview in available drafts
        setAvailableDrafts(prev => prev.map(draft => 
          draft.id === currentDraftId 
            ? { ...draft, preview: `${dataToSave.fullName || 'Chưa có tên'} - ${dataToSave.roomTypes?.length || 0} phòng` }
            : draft
        ))
      }
    }
  }, [formData, roomSelections, currentDraftId])

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
      return () => clearTimeout(timer)
    }
  }, [searchTerm])

  const { data: customerSearchResult } = useSearchCustomer(debouncedSearch)

  const handleSelectCustomer = (customer: CustomerSearchResult) => {
    setSelectedCustomer(customer)
    setFormData({
      ...formData,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      identityCard: customer.identityCard,
      address: customer.address,
    })
  }

  const handleAddRoom = (roomType: RoomType) => {
    const existingIndex = roomSelections.findIndex(r => r.roomTypeId === roomType.roomTypeId)
    if (existingIndex >= 0) {
      const updated = [...roomSelections]
      updated[existingIndex].quantity += 1
      setRoomSelections(updated)
    } else {
      setRoomSelections([...roomSelections, { roomTypeId: roomType.roomTypeId, quantity: 1 }])
    }
    toast({
      title: "Đã thêm phòng",
      description: `${roomType.typeName} đã được thêm vào giỏ`,
    })
  }

  const handleRemoveRoom = (roomTypeId: number) => {
    setRoomSelections(roomSelections.filter(r => r.roomTypeId !== roomTypeId))
  }

  const updateRoomQuantity = (roomTypeId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveRoom(roomTypeId)
    } else {
      const updated = roomSelections.map(r =>
        r.roomTypeId === roomTypeId ? { ...r, quantity } : r
      )
      setRoomSelections(updated)
    }
  }

  const filteredRooms = roomTypes.filter(room => {
    if (filters.roomTypeId !== "all" && room.roomTypeId !== Number(filters.roomTypeId)) return false
    if (filters.maxOccupancy && room.maxOccupancy < Number(filters.maxOccupancy)) return false
    if (filters.minPrice && room.basePriceNight < Number(filters.minPrice)) return false
    if (filters.maxPrice && room.basePriceNight > Number(filters.maxPrice)) return false
    return true
  })

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0
    const nights = Math.ceil(
      (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return roomSelections.reduce((total, selection) => {
      const room = roomTypes.find(r => r.roomTypeId === selection.roomTypeId)
      return total + (room?.basePriceNight || 0) * selection.quantity * nights
    }, 0)
  }

  const totalNights = formData.checkInDate && formData.checkOutDate
    ? Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const handleLoadDraft = (draftId: string) => {
    const draftData = storage.loadDraft<CreateOfflineBookingDto>(STORAGE_KEY, draftId)
    if (draftData) {
      setFormData(draftData)
      setRoomSelections(draftData.roomTypes || [])
      setCurrentDraftId(draftId)
      toast({
        title: "Đã tải đơn nháp",
        description: "Thông tin đơn hàng đã được tải lên",
      })
    }
  }

  const handleDeleteDraft = (draftId: string) => {
    storage.removeDraft(STORAGE_KEY, draftId)
    setAvailableDrafts(prev => prev.filter(d => d.id !== draftId))
    
    if (currentDraftId === draftId) {
      // If deleting current draft, create a new one
      handleNewDraft()
    }
    
    setDraftToDelete(null)
    
    toast({
      title: "Đã xóa đơn nháp",
      description: "Đơn hàng nháp đã được xóa khỏi danh sách",
    })
  }

  const handleNewDraft = () => {
    setCurrentDraftId(null)
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      identityCard: "",
      address: "",
      roomTypes: [],
      checkInDate: "",
      checkOutDate: "",
      specialRequests: "",
      depositAmount: 0,
      paymentMethod: "Cash",
      paymentNote: "",
    })
    setRoomSelections([])
    setSelectedCustomer(null)
    toast({
      title: "Đơn hàng mới",
      description: "Đã tạo đơn hàng mới",
    })
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

    if (!formData.checkInDate || !formData.checkOutDate) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ngày nhận và trả phòng",
        variant: "destructive",
      })
      return
    }

    if (roomSelections.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ít nhất một phòng",
        variant: "destructive",
      })
      return
    }

    try {
      const bookingData = {
        ...formData,
        roomTypes: roomSelections,
      }
      const result = await createBooking.mutateAsync(bookingData)
      
      if (currentDraftId) {
        storage.removeDraft(STORAGE_KEY, currentDraftId)
      }
      
      toast({
        title: "Thành công",
        description: `Đã tạo booking #${result.data.bookingId}`,
      })
      router.push("/admin/bookings")
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo booking",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/bookings")}
              className="hover:bg-white rounded-xl shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo đặt phòng mới</h1>
              <p className="text-gray-600 mt-1">Tạo booking offline tại quầy lễ tân</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleNewDraft}
              className="rounded-xl h-11 px-5 border-2 border-gray-300 font-semibold hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Đơn mới
            </Button>

            {availableDrafts.length > 0 && (
              <>
                <Select 
                  value={currentDraftId || "none"} 
                  onValueChange={(value) => {
                    if (value !== "none") {
                      handleLoadDraft(value)
                    }
                  }}
                >
                  <SelectTrigger className="w-[280px] h-11 rounded-xl border-2 border-gray-300 bg-white">
                    <SelectValue>
                      {currentDraftId ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {availableDrafts.find(d => d.id === currentDraftId)?.preview}
                          </span>
                          <span className="text-xs text-gray-500">
                            {availableDrafts.find(d => d.id === currentDraftId)?.timestamp && 
                              format(new Date(availableDrafts.find(d => d.id === currentDraftId)!.timestamp), "dd/MM/yyyy HH:mm", { locale: vi })
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Chọn đơn nháp...</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-[320px]">
                    <SelectItem value="none" disabled>
                      <span className="text-gray-500">Chọn đơn nháp...</span>
                    </SelectItem>
                    {availableDrafts.map((draft) => (
                      <SelectItem key={draft.id} value={draft.id} className="cursor-pointer">
                        <div className="flex flex-col py-1">
                          <p className="font-medium text-sm text-gray-900">{draft.preview}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(draft.timestamp), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentDraftId && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDraftToDelete(currentDraftId)}
                      className="h-11 w-11 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>

                    <Badge variant="outline" className="border-[#8C68E6] text-[#8C68E6] bg-purple-50 px-4 py-2 h-11 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-semibold">Đang chỉnh sửa đơn nháp</span>
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin khách hàng</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Search - Takes 2 columns */}
            <Card className="bg-white shadow-sm border-0 rounded-xl lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Tìm kiếm khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Nhập email hoặc số điện thoại để tìm kiếm khách hàng cũ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 h-12 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                  />
                  <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {customerSearchResult?.data && (
                  <div className="p-5 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg mb-2">{customerSearchResult.data.fullName}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {customerSearchResult.data.email}
                          </p>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {customerSearchResult.data.phoneNumber}
                          </p>
                        </div>
                        <Badge variant="outline" className="mt-3 border-green-600 text-green-700 bg-white">
                          Đã đặt {customerSearchResult.data.totalBookings} lần
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectCustomer(customerSearchResult.data!)}
                        className="bg-[#8C68E6] hover:bg-[#7B59D5] rounded-lg h-10 px-6"
                      >
                        Chọn
                      </Button>
                    </div>
                  </div>
                )}
                {debouncedSearch && !customerSearchResult?.data && (
                  <p className="text-sm text-gray-500 py-3">Không tìm thấy khách hàng. Vui lòng nhập thông tin mới bên phải.</p>
                )}
              </CardContent>
            </Card>

            {/* Customer Form - Takes 1 column */}
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Họ tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="h-11 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="0901234567"
                      className="h-11 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      className="h-11 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Đường ABC, Quận 1"
                      className="h-11 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lựa chọn phòng</h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Room Selection Area (3 columns) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Date Selection */}
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Chọn ngày đặt phòng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Ngày nhận phòng</Label>
                      <Input
                        type="datetime-local"
                        value={formData.checkInDate}
                        onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                        className="h-11 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Ngày trả phòng</Label>
                      <Input
                        type="datetime-local"
                        value={formData.checkOutDate}
                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                        className="h-11 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900">Lọc phòng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Loại phòng</Label>
                      <Select value={filters.roomTypeId} onValueChange={(value) => setFilters({ ...filters, roomTypeId: value })}>
                        <SelectTrigger className="h-11 rounded-lg border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {roomTypes.map(rt => (
                            <SelectItem key={rt.roomTypeId} value={String(rt.roomTypeId)}>{rt.typeName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Số lượng khách</Label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={filters.maxOccupancy}
                        onChange={(e) => setFilters({ ...filters, maxOccupancy: e.target.value })}
                        className="h-11 rounded-lg border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Giá từ (VNĐ)</Label>
                      <Input
                        type="number"
                        placeholder="500,000"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="h-11 rounded-lg border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Giá đến (VNĐ)</Label>
                      <Input
                        type="number"
                        placeholder="2,000,000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="h-11 rounded-lg border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ roomTypeId: "all", maxOccupancy: "", minPrice: "", maxPrice: "" })}
                      className="rounded-lg border-gray-300 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Đặt lại bộ lọc
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Room Cards Grid */}
              {filteredRooms.length === 0 ? (
                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="py-20">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy phòng nào phù hợp</h3>
                      <p className="text-gray-500">Vui lòng điều chỉnh bộ lọc hoặc chọn ngày khác</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredRooms.map((room) => (
                    <Card key={room.roomTypeId} className="bg-white shadow-sm border-0 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                      <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {room.images && room.images.length > 0 ? (
                          <img
                            src={room.images[0].filePath || "/placeholder.svg"}
                            alt={room.typeName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white text-gray-900 shadow-md font-semibold">
                            Còn {room.totalRooms} phòng
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-5">
                        <div className="mb-4">
                          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{room.typeName}</h3>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-[#8C68E6]">
                              {room.basePriceNight.toLocaleString('vi-VN')}
                            </p>
                            <span className="text-sm font-normal text-gray-500">VNĐ/đêm</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-5">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">{room.maxOccupancy} người</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">{room.roomSize}m²</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7m-18 0V4h18v3M3 7h18" />
                            </svg>
                            <span className="font-medium">{room.numberOfBeds} {room.bedType}</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleAddRoom(room)}
                          className="w-full bg-[#8C68E6] hover:bg-[#7B59D5] rounded-lg h-11 font-semibold text-base group"
                        >
                          <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                          Chọn phòng
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="bg-white shadow-xl border-0 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#8C68E6] to-[#B794F6] text-white p-6">
                    <h3 className="text-xl font-bold">Phòng đã chọn</h3>
                  </div>
                  <CardContent className="p-6 space-y-5">
                    {/* Dates Info */}
                    {formData.checkInDate && formData.checkOutDate ? (
                      <div className="space-y-3 pb-5 border-b border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">Nhận phòng:</span>
                          <span className="font-bold text-gray-900">{format(new Date(formData.checkInDate), "dd/MM/yyyy", { locale: vi })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">Trả phòng:</span>
                          <span className="font-bold text-gray-900">{format(new Date(formData.checkOutDate), "dd/MM/yyyy", { locale: vi })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                          <span className="text-gray-600 font-medium">Số đêm:</span>
                          <span className="font-bold text-[#8C68E6] text-base">{totalNights} đêm</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 px-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800 font-medium">Vui lòng chọn ngày nhận và trả phòng</p>
                      </div>
                    )}

                    {/* Selected Rooms List */}
                    <div className="space-y-3 min-h-[220px] max-h-[400px] overflow-y-auto">
                      {roomSelections.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">Chưa chọn phòng nào</p>
                        </div>
                      ) : (
                        roomSelections.map((selection) => {
                          const room = roomTypes.find(r => r.roomTypeId === selection.roomTypeId)
                          if (!room) return null
                          return (
                            <div key={selection.roomTypeId} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 pr-2">
                                  <p className="font-bold text-sm text-gray-900 mb-1">{room.typeName}</p>
                                  <p className="text-xs text-gray-600">{room.basePriceNight.toLocaleString('vi-VN')} VNĐ/đêm</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveRoom(selection.roomTypeId)}
                                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 font-medium">Số lượng:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateRoomQuantity(selection.roomTypeId, selection.quantity - 1)}
                                    className="w-8 h-8 rounded-lg border-2 border-[#8C68E6] flex items-center justify-center hover:bg-[#8C68E6] hover:text-white transition-all"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="text-base font-bold text-[#8C68E6] w-8 text-center">{selection.quantity}</span>
                                  <button
                                    onClick={() => updateRoomQuantity(selection.roomTypeId, selection.quantity + 1)}
                                    className="w-8 h-8 rounded-lg bg-[#8C68E6] flex items-center justify-center hover:bg-[#7B59D5] text-white transition-all"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Total Summary */}
                    <div className="pt-5 border-t-2 border-gray-200 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">Tổng số phòng:</span>
                        <span className="font-bold text-gray-900">{roomSelections.reduce((sum, r) => sum + r.quantity, 0)} phòng</span>
                      </div>
                      <div className="flex justify-between items-center pt-3">
                        <span className="font-bold text-gray-900 text-base">Tổng tiền:</span>
                        <div className="text-right">
                          <p className="font-bold text-3xl text-[#8C68E6]">
                            {calculateTotal().toLocaleString('vi-VN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">VNĐ</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết thanh toán</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Booking Overview (2 columns) */}
            <Card className="bg-white shadow-sm border-0 rounded-xl lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Tổng quan đặt phòng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Khách hàng</p>
                      <p className="font-bold text-gray-900 text-lg">{formData.fullName || "---"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{formData.phoneNumber || "---"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Email</p>
                      <p className="font-semibold text-gray-900 break-all">{formData.email || "---"}</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Nhận phòng</p>
                      <p className="font-semibold text-gray-900">
                        {formData.checkInDate ? format(new Date(formData.checkInDate), "dd/MM/yyyy HH:mm", { locale: vi }) : "---"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Trả phòng</p>
                      <p className="font-semibold text-gray-900">
                        {formData.checkOutDate ? format(new Date(formData.checkOutDate), "dd/MM/yyyy HH:mm", { locale: vi }) : "---"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Tổng tiền phòng</p>
                      <p className="font-bold text-3xl text-[#8C68E6]">
                        {calculateTotal().toLocaleString('vi-VN')} <span className="text-base">VNĐ</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Rooms Summary */}
                {roomSelections.length > 0 && (
                  <div className="mt-8 pt-6 border-t-2 border-gray-200">
                    <p className="text-sm font-bold text-gray-700 mb-4">Chi tiết phòng đã chọn:</p>
                    <div className="space-y-3">
                      {roomSelections.map((selection) => {
                        const room = roomTypes.find(r => r.roomTypeId === selection.roomTypeId)
                        if (!room) return null
                        return (
                          <div key={selection.roomTypeId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">
                              {room.typeName} × {selection.quantity}
                            </span>
                            <span className="font-bold text-gray-900">
                              {(room.basePriceNight * selection.quantity * totalNights).toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Payment Method (1 column) */}
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'Cash', label: 'Tiền mặt', icon: '💵' },
                    { value: 'Card', label: 'Thẻ (POS)', icon: '💳' },
                    { value: 'Bank', label: 'Chuyển khoản', icon: '🏦' },
                    { value: 'EWallet', label: 'Ví điện tử', icon: '📱' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setFormData({ ...formData, paymentMethod: method.value as any })}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        formData.paymentMethod === method.value
                          ? 'border-[#8C68E6] bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <p className="text-xs font-bold text-gray-900">{method.label}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositAmount" className="text-sm font-medium text-gray-700">
                    Số tiền đặt cọc (VNĐ)
                  </Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min="0"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    placeholder="500,000"
                    className="h-11 rounded-lg border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                  />
                  <p className="text-xs text-gray-500">Để trống nếu khách chưa đặt cọc</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentNote" className="text-sm font-medium text-gray-700">Ghi chú</Label>
                  <Textarea
                    id="paymentNote"
                    value={formData.paymentNote}
                    onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
                    placeholder="Ví dụ: Khách đặt cọc 500k tiền mặt..."
                    rows={3}
                    className="rounded-lg resize-none border-gray-200 focus:border-[#8C68E6] focus:ring-[#8C68E6] focus:ring-2"
                  />
                </div>

                <div className="pt-5 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Tổng số tiền thanh toán:</span>
                  </div>
                  <p className="text-4xl font-bold text-[#8C68E6]">
                    {calculateTotal().toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">VNĐ</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Tổng tiền</p>
                <p className="text-3xl font-bold text-[#8C68E6]">{calculateTotal().toLocaleString('vi-VN')} VNĐ</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700 font-semibold">Số phòng: <span className="text-[#8C68E6]">{roomSelections.reduce((sum, r) => sum + r.quantity, 0)}</span></p>
                <p className="text-sm text-gray-700 font-semibold">Số đêm: <span className="text-[#8C68E6]">{totalNights}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/bookings")}
                size="lg"
                className="rounded-xl h-12 px-8 border-2 border-gray-300 font-semibold hover:bg-gray-50"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleCreateBooking}
                disabled={createBooking.isPending}
                size="lg"
                className="bg-[#8C68E6] hover:bg-[#7B59D5] rounded-xl h-12 px-10 font-bold text-base shadow-lg hover:shadow-xl transition-all"
              >
                {createBooking.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    Xác nhận đặt phòng
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!draftToDelete} onOpenChange={(open) => !open && setDraftToDelete(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đơn nháp</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đơn nháp này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDraftToDelete(null)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => draftToDelete && handleDeleteDraft(draftToDelete)}
              className="rounded-xl bg-red-500 hover:bg-red-600"
            >
              Xóa đơn nháp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
