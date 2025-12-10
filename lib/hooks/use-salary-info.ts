import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/client";
import { GetSalaryInfoParams, salaryInfoApi } from "../api/salary";
import { SalaryInfo } from "../api";

export function useSalaryInfos(params: GetSalaryInfoParams) {
  return useQuery({
    queryKey: ["salary-info", params],
    queryFn: () => salaryInfoApi.getAll(params),
  });
}

export function useSalaryInfo(id: number) {
  return useQuery({
    queryKey: ["salary-info", id],
    queryFn: () => salaryInfoApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSalaryInfo() {
  return useMutation({
    mutationFn: (data: SalaryInfo) => salaryInfoApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salary-info"] }),
  });
}

export function useUpdateSalaryInfo() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SalaryInfo }) =>
      salaryInfoApi.update({ id, data }),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salary-info"] });
      queryClient.invalidateQueries({ queryKey: ["salary-info", variables.id] });
    },
  });
}

export function useDeleteSalaryInfo() {
  return useMutation({
    mutationFn: (id: number) => salaryInfoApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salary-info"] }),
  });
}