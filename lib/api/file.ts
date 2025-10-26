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
    formData.append("file", file);
    formData.append("folder", PATH);
    const res = await apiClient.post<ApiResponse<UploadedResponse>>(
      PATH + "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  delete: async (publicId: string): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<boolean>>(PATH + "/upload", {
      data: { publicId },
    });

    return res.data;
  },
};
