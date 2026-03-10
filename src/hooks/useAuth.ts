"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { AuthUser } from "@/lib/auth-shared";
import { fetchCurrentUser, queryKeys } from "@/lib/server-state";

export function useAuth() {
  const queryClient = useQueryClient();
  const authQuery = useQuery({
    queryKey: queryKeys.authMe,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      queryClient.clear();
      queryClient.setQueryData<AuthUser | null>(queryKeys.authMe, null);
      window.location.href = "/landing";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [queryClient]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
  }, [queryClient]);

  const user = authQuery.data ?? null;

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: authQuery.isLoading,
    logout,
    refresh,
  };
}