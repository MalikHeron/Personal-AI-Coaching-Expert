import { UserContext } from "@/hooks/use-user";
import { AuthService } from "@/services/AuthService";
import { User } from "@/types/user";
import { useState, useEffect, useCallback } from "react";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const authService = new AuthService();

    // Prefer server-validated user (ensures cookie/session is valid). If that fails,
    // fall back to stored user in local/session storage for a quicker UI hydrate.
    let sessionUser = await authService.fetchUserFromServer();
    console.log("Using server-fetched user for hydration:", sessionUser);
    if (!sessionUser) {
      sessionUser = await authService.fetchUser();
      console.log("Using stored user for hydration:", sessionUser);
    }

    if (sessionUser) {
      setUser({ ...sessionUser });
      console.log("User successfully hydrated:", sessionUser);
    } else {
      setUser(undefined);
    }
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      await refreshUser();
      setIsLoading(false);
    };

    initializeUser();

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshUser();
    };

    const handlePopState = () => {
      refreshUser();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};