"use client";

import type React from "react";
import { createContext, useContext, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Account, User } from "@/lib/types/api";
import { authApi } from "@/lib/api";
import { accountApi } from "@/lib/api/account";

type AuthContextType = {
  user: User | null;
  account: Account | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helpers
const USER_QK = ["auth", "me"] as const;

// Khi dùng cookie httpOnly, có thể luôn bật fetch. Nếu dùng token trong storage,
// có thể kiểm tra nhanh có session không để tránh 401 thừa.
// use-auth.ts
const hasSession = () =>
  typeof window !== "undefined" ? authApi.isAuthenticated() : true;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  // 1) Lấy hồ sơ hiện tại bằng React Query (server state)
  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useQuery({
    queryKey: USER_QK,
    // Trả về { customer, account }
    queryFn: async () => {
      const res = await accountApi.getProfile();
      return res.data as { customer: User; account: Account };
    },
    enabled: hasSession(), // nếu không có session (token/cookie) thì không gọi
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  // 2) Login mutation: gọi login -> invalidate/seed cache me
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await authApi.login({ email, password });
      // Nếu backend set cookie httpOnly, không cần lưu token ở FE.
      // Nếu backend trả token và bạn dùng Bearer, để authApi tự lưu & setup interceptor.
      if (!res?.data) return;
      // Sau khi login xong, fetch profile ngay để hiển thị tức thì:
      const me = await accountApi.getProfile();
      return me.data as { customer: User; account: Account };
    },
    onSuccess: (me) => {
      if (me) {
        qc.setQueryData(USER_QK, me);
        // (Tuỳ chọn) đồng bộ localStorage nếu bạn vẫn muốn lưu:
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(me.customer));
          localStorage.setItem("account", JSON.stringify(me.account));
        }
      } else {
        // fallback: nếu chưa có me, ít nhất invalidate để lần sau tự fetch
        qc.invalidateQueries({ queryKey: USER_QK });
      }
    },
  });

  // 3) Logout mutation: gọi logout -> xoá cache + storage
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: USER_QK });
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("account");
      }
    },
    onSettled: () => {
      // Đảm bảo màn hình sạch dữ liệu
      qc.setQueryData(USER_QK, null);
    },
  });

  // 4) API public qua Context
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const updateUser = (updatedUser: User) => {
    // Cập nhật cache React Query tại chỗ
    qc.setQueryData(USER_QK, (old: { customer: User; account: Account } | null) => {
      if (!old) return old;
      const next = { ...old, customer: updatedUser };
      // (Tuỳ chọn) đồng bộ localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return next;
    });
  };

  // 5) Cross-tab sync (tuỳ chọn): nếu tab khác logout/login thì tab này theo kịp
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "account") {
        // đơn giản nhất: refetch
        qc.invalidateQueries({ queryKey: USER_QK });
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, [qc]);

  const user = profile?.customer ?? null;
  const account = profile?.account ?? null;

  const isLoading =
    isProfileLoading || isProfileFetching || loginMutation.isPending || logoutMutation.isPending;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      account,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, account, isLoading] // login/logout/updateUser là stable (đã bind)
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
