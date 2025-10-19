import { User } from '@/types/user';

// Import the API URL from the environment variables
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_SERVER_DEV
  : import.meta.env.VITE_API_SERVER; // When running inside Docker, this will be used

export class AuthService {

  public login(): void {
    window.location.href = `${API_URL}/accounts/login/`;
  }

  public loginWithGoogle(): void {
    window.location.href = `${API_URL}/accounts/google/login/`;
  }

  public loginWithMicrosoft(): void {
    window.location.href = `${API_URL}/accounts/microsoft/login/`;
  }

  public logout(): void {
    window.location.href = `${API_URL}/accounts/logout/`;
  }

  async fetchUser(): Promise<User | undefined> {
    try {
      // Retrieve the user JSON string from sessionStorage
      const user = sessionStorage.getItem("user");

      // If there is no user data, return undefined
      if (!user) {
        return undefined;
      }

      // Parse the user JSON string into an object
      const userInfo = JSON.parse(user);

      // Return a User object, mapping backend fields to frontend User type
      return {
        id: userInfo.id || null,
        username: userInfo.username || null,
        email: userInfo.email || null,
        first_name: userInfo.first_name || null,
        last_name: userInfo.last_name || null,
        social_profiles: userInfo.social_profiles || undefined,
      } as User;
    } catch (error: unknown) {
      // Log any unexpected errors and return undefined
      console.error("Error fetching user from sessionStorage:", error);
      return undefined;
    }
  }
}