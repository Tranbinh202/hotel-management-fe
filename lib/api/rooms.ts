import { apiClient } from "./client"
import type { Room, CreateRoomDto, UpdateRoomDto } from "@/lib/types/api"

export const roomsApi = {
  getAll: async (): Promise<Room[]> => {
    return apiClient.get<Room[]>("/rooms")
  },

  getById: async (id: number): Promise<Room> => {
    return apiClient.get<Room>(`/rooms/${id}`)
  },

  getAvailable: async (checkIn: string, checkOut: string): Promise<Room[]> => {
    return apiClient.get<Room[]>("/rooms/available", {
      params: { checkIn, checkOut },
    })
  },

  create: async (data: CreateRoomDto): Promise<Room> => {
    return apiClient.post<Room>("/rooms", data)
  },

  update: async (data: UpdateRoomDto): Promise<Room> => {
    const { roomId, ...updateData } = data
    return apiClient.put<Room>(`/rooms/${roomId}`, updateData)
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`)
  },

  toggleAvailability: async (id: number): Promise<Room> => {
    return apiClient.patch<Room>(`/rooms/${id}/toggle-availability`)
  },
}
