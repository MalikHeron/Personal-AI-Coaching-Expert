import { User } from '@/types/user';
import getCookie from "../helpers/cookies";

// Import the API URL from the environment variables
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_SERVER_DEV
  : import.meta.env.VITE_API_SERVER; // When running inside Docker, this will be used

type RegistrationResponse = {
  key?: string;
  user?: unknown;
  detail?: string;
  [k: string]: unknown;
};

export class AuthService {

  public async createAccount(payload: { email: string; password1: string; password2: string; username?: string }): Promise<RegistrationResponse> {
    try {
      // Derive a username from email if not provided (before @)
      const username = payload.username || (payload.email?.split("@")[0] ?? "");
      const csrftoken = getCookie("csrftoken") || "";
      const response = await fetch(`${API_URL}/accounts/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({
          email: payload.email,
          password1: payload.password1,
          password2: payload.password2,
          username,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          // Flatten common dj-rest-auth/allauth error shapes
          errorMessage = JSON.stringify(errJson);
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("Error creating account:", error);
      throw error;
    }
  }

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

  async markAsCompleted(): Promise<boolean> {
    try {
      const csrftoken = getCookie("csrftoken") || "";
      const response = await fetch(`${API_URL}/accounts/onboarding/complete/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error: unknown) {
      console.error("Error marking onboarding as completed:", error);
      throw error;
    }
  }
}