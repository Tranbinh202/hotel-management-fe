import { apiClient } from "./client";

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export const cloudinaryApi = {
  /**
   * Upload a file to Cloudinary
   * @param file - The file to upload
   * @param folder - Optional folder name in Cloudinary
   * @returns Upload response with image URL
   */
  upload: async (
    file: File,
    folder?: string
  ): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData();
    formData.append("File", file);
    if (folder) {
      formData.append("Folder", folder);
    }

    const response = await apiClient.post<CloudinaryUploadResponse>(
      "/Cloudinary/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response;
  },

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */
  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete(`/Cloudinary/delete/${publicId}`);
  },
};
