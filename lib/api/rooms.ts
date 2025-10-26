import { apiClient } from "./client";
import type {
  CreateRoomDto,
  UpdateRoomDto,
  PaginatedResponse,
  ApiResponse,
  IPaginationParams,
} from "@/lib/types/api";

export interface GetAllRoomsParams extends IPaginationParams {
  NumberOfGuests: number;
  MinPrice: number;
  MaxPrice: number;
  BedType: string;
  MinRoomSize: number;
  CheckInDate: string;
  CheckOutDate: string;
  OnlyActive: boolean;
}

export interface RoomTypeImage {
  mediaId: number;
  filePath: string;
  description: string;
  referenceTable: string;
  referenceKey: string;
  isActive: boolean;
}

export interface Room {
  roomTypeId: number;
  typeName: string;
  typeCode: string;
  description: string;
  basePriceNight: number;
  maxOccupancy: number;
  roomSize: number;
  numberOfBeds: number;
  bedType: string;
  isActive: boolean;
  images: RoomTypeImage[];
  amenities: string[];
  availableRoomCount: number | null;
  totalRoomCount: number;
}

export interface GetRoomParams {
  id: number;
  checkInDate?: string;
  checkOutDate?: string;
}

export const roomsApi = {
  getAll: async (
    params: Partial<GetAllRoomsParams>
  ): Promise<PaginatedResponse<Room>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Room>>>(
      "/room/search",
      { params }
    );
    return res.data;
  },

  getById: async (params: GetRoomParams): Promise<Room> => {
    const { id, ...rest } = params;
    const res = await apiClient.get<ApiResponse<Room>>(`/room/search/${id}`, {
      params: rest,
    });
    return res.data;
  },

  getAvailable: async (checkIn: string, checkOut: string): Promise<Room[]> => {
    return apiClient.get<Room[]>("/rooms/available", {
      params: { checkIn, checkOut },
    });
  },

  create: async (data: CreateRoomDto): Promise<Room> => {
    return apiClient.post<Room>("/rooms", data);
  },

  update: async (data: UpdateRoomDto): Promise<Room> => {
    const { roomId, ...updateData } = data;
    return apiClient.put<Room>(`/rooms/${roomId}`, updateData);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`);
  },

  toggleAvailability: async (id: number): Promise<Room> => {
    return apiClient.patch<Room>(`/rooms/${id}/toggle-availability`);
  },
};
