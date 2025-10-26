import { apiClient } from "./client";
import type {
  ApiResponse,
  CreateAmenityDto,
  PaginatedResponse,
  UpdateAmenityDto,
} from "@/lib/types/api";

export interface Amenity {
  amenityId: number;
  amenityName: string;
  description: string;
  amenityType: "Common" | "Additional";
  isActive: boolean;
  createdAt: string;
  createdBy: number | null;
  updatedAt: string | null;
  updatedBy: number | null;
  images: string[];
}

// export interface AmenitiesResponse {
//   isSuccess: boolean
//   responseCode: string | null
//   statusCode: number
//   data: {
//     items: Amenity[]
//     totalCount: number
//     pageIndex: number
//     pageSize: number
//     totalPages: number
//   }
//   message: string
// }

export interface GetAmenitiesParams {
  isActive?: boolean;
  amenityType?: string;
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

export const amenitiesApi = {
  getAll: async (
    params: Partial<GetAmenitiesParams>
  ): Promise<PaginatedResponse<Amenity>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Amenity>>>(
      "/amenity",
      {
        params,
      }
    );

    return res.data;
  },

  getById: async (id: number): Promise<Amenity> => {
    return apiClient.get<Amenity>(`/amenities/${id}`);
  },

  create: async (data: CreateAmenityDto): Promise<Amenity> => {
    return apiClient.post<Amenity>("/amenities", data);
  },

  update: async (data: UpdateAmenityDto): Promise<Amenity> => {
    const { amenityId, ...updateData } = data;
    return apiClient.put<Amenity>(`/amenities/${amenityId}`, updateData);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/amenities/${id}`);
  },

  toggleActive: async (id: number): Promise<Amenity> => {
    return apiClient.patch<Amenity>(`/amenities/${id}/toggle-active`);
  },
};
