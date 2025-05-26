"use client";

import { useAuth } from "./useAuth";

export function useSession() {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    isUnauthenticated: !loading && !user,
  };
}
