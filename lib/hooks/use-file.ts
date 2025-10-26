import { useMutation } from "@tanstack/react-query";
import { fileApi } from "../api/file";

export const useUploadFile = () => {
  return useMutation({
    mutationKey: ["uploadFile"],
    mutationFn: fileApi.upload,
  });
};

export const useDeleteFile = () => {
  return useMutation({
    mutationKey: ["deleteFile"],
    mutationFn: fileApi.delete,
  });
};
