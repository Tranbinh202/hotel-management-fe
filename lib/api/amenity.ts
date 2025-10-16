import { apiClient } from "./client"
import type { Amenity, CreateAmenityDto, UpdateAmenityDto } from "@/lib/types/api"

export const amenitiesApi = {
  getAll: async (): Promise<Amenity[]> => {
    return apiClient.get<Amenity[]>("/amenities")
  },

  getById: async (id: number): Promise<Amenity> => {
    return apiClient.get<Amenity>(`/amenities/${id}`)
  },

  create: async (data: CreateAmenityDto): Promise<Amenity> => {
    return apiClient.post<Amenity>("/amenities", data)
  },

  update: async (data: UpdateAmenityDto): Promise<Amenity> => {
    const { amenityId, ...updateData } = data
    return apiClient.put<Amenity>(`/amenities/${amenityId}`, updateData)
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/amenities/${id}`)
  },

  toggleActive: async (id: number): Promise<Amenity> => {
    return apiClient.patch<Amenity>(`/amenities/${id}/toggle-active`)
  },
}
