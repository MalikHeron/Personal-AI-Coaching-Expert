import { User } from "@/types/user";
import { createContext, useContext } from "react";

export interface UserContextType {
  user: User | undefined;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | undefined) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};