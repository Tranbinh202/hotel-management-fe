import axiosInstance from "@/lib/axios"

// Types cho Amenity
export interface Amenity {
  amenityId: number
  amenityName: string
  description: string
  price: number
  isActive: boolean
  createdAt: string
  createdBy: number | null
  updatedAt: string
  updatedBy: number
  images: string[]
}

export interface CreateAmenityDto {
  amenityName: string
  description: string
  price: number
  isActive: boolean
  images?: string[]
}

export interface UpdateAmenityDto extends Partial<CreateAmenityDto> {
  amenityId: number
}

// API functions
export const amenitiesApi = {
  // Lấy danh sách tất cả tiện nghi
  getAll: async (): Promise<Amenity[]> => {
    const response = await axiosInstance.get("/amenities")
    return response.data
  },

  // Lấy chi tiết một tiện nghi
  getById: async (id: number): Promise<Amenity> => {
    const response = await axiosInstance.get(`/amenities/${id}`)
    return response.data
  },

  // Tạo tiện nghi mới
  create: async (data: CreateAmenityDto): Promise<Amenity> => {
    const response = await axiosInstance.post("/amenities", data)
    return response.data
  },

  // Cập nhật tiện nghi
  update: async (data: UpdateAmenityDto): Promise<Amenity> => {
    const { amenityId, ...updateData } = data
    const response = await axiosInstance.put(`/amenities/${amenityId}`, updateData)
    return response.data
  },

  // Xóa tiện nghi
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/amenities/${id}`)
  },

  // Toggle trạng thái active
  toggleActive: async (id: number): Promise<Amenity> => {
    const response = await axiosInstance.patch(`/amenities/${id}/toggle-active`)
    return response.data
  },
}
