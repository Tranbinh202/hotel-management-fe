import { ApiResponse } from "../types/api";
import { apiClient } from "./client";

export interface UploadedResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
}

const PATH = "/Cloudinary";

export const fileApi = {
  upload: async (file: File): Promise<UploadedResponse> => {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("Folder", "amenities");

    // apiClient.post already returns res.data (the ApiResponse)
    // So we get ApiResponse<UploadedResponse> directly
    const apiResponse = await apiClient.post<ApiResponse<UploadedResponse>>(
      PATH + "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Now access the data property of ApiResponse
    return apiResponse.data;
  },

  delete: async (publicId: string): Promise<boolean> => {
    const apiResponse = await apiClient.delete<ApiResponse<boolean>>(
      PATH + "/delete/" + publicId
    );
    return apiResponse.data;
  },
};
