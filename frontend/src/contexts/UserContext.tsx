import { UserContext } from "@/hooks/use-user";
import { AuthService } from "@/services/AuthService";
import { User } from "@/types/user";
import { useState, useEffect, useCallback } from "react";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const authService = new AuthService();

    const sessionUser = await authService.fetchUser();

    if (sessionUser) {
      setUser({ ...sessionUser });
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