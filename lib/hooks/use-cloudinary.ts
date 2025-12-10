import { useMutation } from "@tanstack/react-query";
import { cloudinaryApi } from "@/lib/api/cloudinary";
import { toast } from "@/hooks/use-toast";

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      cloudinaryApi.upload(file, folder),
    onError: (error: any) => {
      toast({
        title: "Lỗi tải ảnh",
        description: error.message || "Không thể tải ảnh lên",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteImage() {
  return useMutation({
    mutationFn: (publicId: string) => cloudinaryApi.delete(publicId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa ảnh",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa ảnh",
        variant: "destructive",
      });
    },
  });
}
