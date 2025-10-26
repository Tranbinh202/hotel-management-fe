"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Bed, Users, Maximize, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Room {
    roomId: number
    roomNumber: string
    roomType: "Single" | "Double" | "Suite" | "Deluxe"
    status: "Available" | "Occupied" | "Maintenance" | "Reserved"
    pricePerNight: number
    floor: number
    capacity: number
    area: number
    amenities: string[]
    description: string
    images: string[]
}

// Mockup data
const mockRooms: Room[] = [
    {
        roomId: 1,
        roomNumber: "101",
        roomType: "Single",
        status: "Available",
        pricePerNight: 500000,
        floor: 1,
        capacity: 1,
        area: 20,
        amenities: ["Wifi", "TV", "Điều hòa"],
        description: "Phòng đơn tiện nghi, phù hợp cho khách đi công tác",
        images: [],
    },
    {
        roomId: 2,
        roomNumber: "102",
        roomType: "Double",
        status: "Occupied",
        pricePerNight: 800000,
        floor: 1,
        capacity: 2,
        area: 30,
        amenities: ["Wifi", "TV", "Điều hòa", "Minibar"],
        description: "Phòng đôi rộng rãi với 2 giường đơn",
        images: [],
    },
    {
        roomId: 3,
        roomNumber: "201",
        roomType: "Suite",
        status: "Available",
        pricePerNight: 1500000,
        floor: 2,
        capacity: 3,
        area: 50,
        amenities: ["Wifi", "TV", "Điều hòa", "Minibar", "Bồn tắm", "Ban công"],
        description: "Phòng suite cao cấp với phòng khách riêng",
        images: [],
    },
    {
        roomId: 4,
        roomNumber: "202",
        roomType: "Deluxe",
        status: "Reserved",
        pricePerNight: 2000000,
        floor: 2,
        capacity: 4,
        area: 60,
        amenities: ["Wifi", "TV", "Điều hòa", "Minibar", "Bồn tắm", "Ban công", "Bếp nhỏ"],
        description: "Phòng deluxe sang trọng với view thành phố",
        images: [],
    },
    {
        roomId: 5,
        roomNumber: "301",
        roomType: "Single",
        status: "Maintenance",
        pricePerNight: 500000,
        floor: 3,
        capacity: 1,
        area: 20,
        amenities: ["Wifi", "TV", "Điều hòa"],
        description: "Phòng đơn đang bảo trì",
        images: [],
    },
    {
        roomId: 6,
        roomNumber: "302",
        roomType: "Double",
        status: "Available",
        pricePerNight: 850000,
        floor: 3,
        capacity: 2,
        area: 32,
        amenities: ["Wifi", "TV", "Điều hòa", "Minibar", "Két sắt"],
        description: "Phòng đôi với giường king size",
        images: [],
    },
    {
        roomId: 7,
        roomNumber: "401",
        roomType: "Suite",
        status: "Available",
        pricePerNight: 1800000,
        floor: 4,
        capacity: 3,
        area: 55,
        amenities: ["Wifi", "TV", "Điều hòa", "Minibar", "Bồn tắm", "Ban công", "Két sắt"],
        description: "Phòng suite tầng cao với view đẹp",
        images: [],
    },
    {
        roomId: 8,
        roomNumber: "402",
        roomType: "Deluxe",
        status: "Occupied",
        pricePerNight: 2200000,
        floor: 4,
        capacity: 4,
        area: 65,
        amenities: ["Wifi", "TV", "Điều hòa", "Minibar", "Bồn tắm", "Ban công", "Bếp nhỏ", "Máy giặt"],
        description: "Phòng deluxe cao cấp nhất với đầy đủ tiện nghi",
        images: [],
    },
]

export default function RoomsPage() {
    const { toast } = useToast()
    const [rooms, setRooms] = useState<Room[]>(mockRooms)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [floorFilter, setFloorFilter] = useState<string>("all")

    const [formData, setFormData] = useState({
        roomNumber: "",
        roomType: "Single" as Room["roomType"],
        status: "Available" as Room["status"],
        pricePerNight: 0,
        floor: 1,
        capacity: 1,
        area: 0,
        amenities: [] as string[],
        description: "",
        images: [] as string[],
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Filter rooms
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = roomTypeFilter === "all" || room.roomType === roomTypeFilter
        const matchesStatus = statusFilter === "all" || room.status === statusFilter
        const matchesFloor = floorFilter === "all" || room.floor.toString() === floorFilter

        return matchesSearch && matchesType && matchesStatus && matchesFloor
    })

    const stats = {
        available: rooms.filter((r) => r.status === "Available").length,
        occupied: rooms.filter((r) => r.status === "Occupied").length,
        reserved: rooms.filter((r) => r.status === "Reserved").length,
        maintenance: rooms.filter((r) => r.status === "Maintenance").length,
    }

    const handleOpenModal = (room?: Room) => {
        if (room) {
            setEditingRoom(room)
            setFormData({
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                status: room.status,
                pricePerNight: room.pricePerNight,
                floor: room.floor,
                capacity: room.capacity,
                area: room.area,
                amenities: room.amenities,
                description: room.description,
                images: room.images,
            })
        } else {
            setEditingRoom(null)
            setFormData({
                roomNumber: "",
                roomType: "Single",
                status: "Available",
                pricePerNight: 0,
                floor: 1,
                capacity: 1,
                area: 0,
                amenities: [],
                description: "",
                images: [],
            })
        }
        setErrors({})
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingRoom(null)
        setFormData({
            roomNumber: "",
            roomType: "Single",
            status: "Available",
            pricePerNight: 0,
            floor: 1,
            capacity: 1,
            area: 0,
            amenities: [],
            description: "",
            images: [],
        })
        setErrors({})
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.roomNumber.trim()) {
            newErrors.roomNumber = "Vui lòng nhập số phòng"
        }

        if (formData.pricePerNight <= 0) {
            newErrors.pricePerNight = "Giá phòng phải lớn hơn 0"
        }

        if (formData.area <= 0) {
            newErrors.area = "Diện tích phải lớn hơn 0"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Vui lòng nhập mô tả"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        if (editingRoom) {
            // Update room
            setRooms((prev) =>
                prev.map((room) =>
                    room.roomId === editingRoom.roomId
                        ? {
                            ...room,
                            ...formData,
                        }
                        : room,
                ),
            )
            toast({
                title: "Thành công",
                description: "Cập nhật phòng thành công",
            })
        } else {
            // Add new room
            const newRoom: Room = {
                roomId: Math.max(...rooms.map((r) => r.roomId)) + 1,
                ...formData,
            }
            setRooms((prev) => [...prev, newRoom])
            toast({
                title: "Thành công",
                description: "Thêm phòng mới thành công",
            })
        }

        handleCloseModal()
    }

    const handleDelete = (roomId: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
            setRooms((prev) => prev.filter((room) => room.roomId !== roomId))
            toast({
                title: "Thành công",
                description: "Xóa phòng thành công",
            })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "pricePerNight" || name === "floor" || name === "capacity" || name === "area" ? Number(value) : value,
        }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const getRoomTypeBadge = (type: string) => {
        const badges = {
            Single: "bg-blue-100 text-blue-800",
            Double: "bg-green-100 text-green-800",
            Suite: "bg-purple-100 text-purple-800",
            Deluxe: "bg-amber-100 text-amber-800",
        }
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[type as keyof typeof badges]}`}
            >
                {type}
            </span>
        )
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            Available: { bg: "bg-green-100", text: "text-green-800", label: "Trống" },
            Occupied: { bg: "bg-red-100", text: "text-red-800", label: "Đang thuê" },
            Maintenance: { bg: "bg-orange-100", text: "text-orange-800", label: "Bảo trì" },
            Reserved: { bg: "bg-blue-100", text: "text-blue-800", label: "Đã đặt" },
        }
        const badge = badges[status as keyof typeof badges]
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
            >
                {badge.label}
            </span>
        )
    }

    const uniqueFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b)

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý phòng</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-slate-600">
                                Trống: <span className="font-semibold text-slate-900">{stats.available}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-slate-600">
                                Đang thuê: <span className="font-semibold text-slate-900">{stats.occupied}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-slate-600">
                                Đã đặt: <span className="font-semibold text-slate-900">{stats.reserved}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="text-slate-600">
                                Bảo trì: <span className="font-semibold text-slate-900">{stats.maintenance}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm phòng
                </Button>
            </div>

            <Card className="border-0 shadow">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo số phòng hoặc mô tả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>

                        <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                            <SelectTrigger className="w-40 h-9">
                                <SelectValue placeholder="Loại phòng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại</SelectItem>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Double">Double</SelectItem>
                                <SelectItem value="Suite">Suite</SelectItem>
                                <SelectItem value="Deluxe">Deluxe</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 h-9">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="Available">Trống</SelectItem>
                                <SelectItem value="Occupied">Đang thuê</SelectItem>
                                <SelectItem value="Reserved">Đã đặt</SelectItem>
                                <SelectItem value="Maintenance">Bảo trì</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={floorFilter} onValueChange={setFloorFilter}>
                            <SelectTrigger className="w-32 h-9">
                                <SelectValue placeholder="Tầng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả tầng</SelectItem>
                                {uniqueFloors.map((floor) => (
                                    <SelectItem key={floor} value={floor.toString()}>
                                        Tầng {floor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="text-sm text-slate-600 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{filteredRooms.length}</span> / {rooms.length}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Rooms Table */}
            <Card className="border-0 shadow">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="font-semibold text-slate-900">Số phòng</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Tầng</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Loại phòng</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Giá/đêm</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-center">Sức chứa</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-center">Diện tích</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-center">Tiện nghi</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Mô tả</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRooms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <Bed className="w-12 h-12 mb-2 text-slate-300" />
                                                <p className="text-lg">Không tìm thấy phòng nào</p>
                                                <p className="text-sm text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRooms.map((room) => (
                                        <TableRow key={room.roomId} className="hover:bg-slate-50">
                                            <TableCell className="font-semibold text-slate-900">{room.roomNumber}</TableCell>
                                            <TableCell className="text-slate-600">Tầng {room.floor}</TableCell>
                                            <TableCell>{getRoomTypeBadge(room.roomType)}</TableCell>
                                            <TableCell>{getStatusBadge(room.status)}</TableCell>
                                            <TableCell className="font-semibold text-[#ff5e7e]">{formatPrice(room.pricePerNight)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users className="w-4 h-4 text-slate-500" />
                                                    <span className="text-slate-700">{room.capacity}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Maximize className="w-4 h-4 text-slate-500" />
                                                    <span className="text-slate-700">{room.area}m²</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                                                    {room.amenities.length}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <p className="text-sm text-slate-600 line-clamp-2">{room.description}</p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleOpenModal(room)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/10"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(room.roomId)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomNumber">
                                        Số phòng <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="roomNumber"
                                        name="roomNumber"
                                        type="text"
                                        value={formData.roomNumber}
                                        onChange={handleChange}
                                        className={errors.roomNumber ? "border-red-500" : ""}
                                        placeholder="VD: 101, 202..."
                                    />
                                    {errors.roomNumber && <p className="text-xs text-red-500">{errors.roomNumber}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="floor">Tầng</Label>
                                    <Input
                                        id="floor"
                                        name="floor"
                                        type="number"
                                        min="1"
                                        value={formData.floor}
                                        onChange={handleChange}
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomType">Loại phòng</Label>
                                    <Select
                                        value={formData.roomType}
                                        onValueChange={(value: Room["roomType"]) => setFormData((prev) => ({ ...prev, roomType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Double">Double</SelectItem>
                                            <SelectItem value="Suite">Suite</SelectItem>
                                            <SelectItem value="Deluxe">Deluxe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: Room["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Available">Trống</SelectItem>
                                            <SelectItem value="Occupied">Đang thuê</SelectItem>
                                            <SelectItem value="Reserved">Đã đặt</SelectItem>
                                            <SelectItem value="Maintenance">Bảo trì</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pricePerNight">
                                        Giá/đêm (VNĐ) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="pricePerNight"
                                        name="pricePerNight"
                                        type="number"
                                        min="0"
                                        value={formData.pricePerNight}
                                        onChange={handleChange}
                                        className={errors.pricePerNight ? "border-red-500" : ""}
                                        placeholder="500000"
                                    />
                                    {errors.pricePerNight && <p className="text-xs text-red-500">{errors.pricePerNight}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Sức chứa</Label>
                                    <Input
                                        id="capacity"
                                        name="capacity"
                                        type="number"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        placeholder="2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="area">
                                        Diện tích (m²) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="area"
                                        name="area"
                                        type="number"
                                        min="0"
                                        value={formData.area}
                                        onChange={handleChange}
                                        className={errors.area ? "border-red-500" : ""}
                                        placeholder="30"
                                    />
                                    {errors.area && <p className="text-xs text-red-500">{errors.area}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Mô tả <span className="text-red-500">*</span>
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5e7e] focus:border-transparent outline-none transition-all ${errors.description ? "border-red-500" : "border-slate-300"
                                        }`}
                                    placeholder="Mô tả chi tiết về phòng..."
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Tiện nghi</Label>
                                <div className="border border-slate-300 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Wifi", "TV", "Điều hòa", "Minibar", "Bồn tắm", "Ban công", "Két sắt", "Bếp nhỏ", "Máy giặt"].map(
                                            (amenity) => (
                                                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.amenities.includes(amenity)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, amenity] }))
                                                            } else {
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    amenities: prev.amenities.filter((a) => a !== amenity),
                                                                }))
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-[#14b8a6] focus:ring-[#14b8a6] rounded"
                                                    />
                                                    <span className="text-sm text-slate-700">{amenity}</span>
                                                </label>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Hình ảnh</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#ff5e7e] transition-colors cursor-pointer">
                                    <svg
                                        className="w-12 h-12 mx-auto text-slate-400 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <p className="text-sm text-slate-600">Nhấp để tải lên hoặc kéo thả hình ảnh</p>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                <Button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-[#ff5e7e] to-[#a78bfa] hover:from-[#ff4569] hover:to-[#9370db] text-white"
                                >
                                    {editingRoom ? "Cập nhật" : "Thêm mới"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
