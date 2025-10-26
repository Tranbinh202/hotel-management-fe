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
  IsActive?: boolean;
  AmenityType?: string;
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDesc?: boolean;
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
    return apiClient.get<Amenity>(`/amenity/${id}`);
  },

  create: async (data: CreateAmenityDto): Promise<Amenity> => {
    return apiClient.post<Amenity>("/amenity", data);
  },

  update: async (data: UpdateAmenityDto): Promise<Amenity> => {
    const { amenityId, ...updateData } = data;
    return apiClient.put<Amenity>(`/amenity/${amenityId}`, updateData);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/amenity/${id}`);
  },

  toggleActive: async (id: number): Promise<Amenity> => {
    return apiClient.patch<Amenity>(`/amenity/${id}/toggle-active`);
  },
};
