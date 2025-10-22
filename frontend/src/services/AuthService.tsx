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

  public async createAccount(payload: { email: string; password1: string; password2: string; username?: string; first_name?: string; last_name?: string }): Promise<RegistrationResponse> {
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
          first_name: payload.first_name,
          last_name: payload.last_name,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        // Throw the parsed JSON so callers can display field-level errors
        throw Error(errJson.error);
      }

      const data = await response.json();
      // If server returned access token + user, persist access token to localStorage
      try {
        if (data.access) {
          localStorage.setItem('access_token', data.access);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch { /* ignore storage errors */ }
      return data;
    } catch (error: unknown) {
      console.error("Error creating account:", error);
      throw error;
    }
  }

  public async login(payload: { email: string; password: string }): Promise<[string, boolean]> {
    try {
      console.log("Logging in with payload:", payload);
      const csrftoken = getCookie("csrftoken") || "";
      // New endpoint: token obtain
      const response = await fetch(`${API_URL}/accounts/auth/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({
          username: payload.email,
          password: payload.password,
        }),
      });

      if (!response.ok) {
        try {
          const errJson = await response.json();
          return [errJson.error, false];
        } catch (e) {
          if (e instanceof Error) {
            return [e.message, false];
          } else {
            return ["An unknown error occurred during login.", false];
          }
        }
      }

      const data = await response.json();
      // persist access token and user
      try {
        if (data.access) localStorage.setItem('access_token', data.access);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        // ignore
      }
      return [data.access, true];
    } catch (error: unknown) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  public loginWithGoogle(): void {
    // Redirect to social auth URL handled by social_django
    window.location.href = `${API_URL}/social/login/google-oauth2/`;
  }

  public loginWithMicrosoft(): void {
    window.location.href = `${API_URL}/social/login/microsoft-oauth2/`;
  }

  public logout(): void {
    try { localStorage.removeItem('user'); } catch { /* ignore if storage unavailable */ }
    try { sessionStorage.removeItem('user'); } catch { /* ignore if storage unavailable */ }
    // Redirect to backend logout endpoint to clear server session
    window.location.href = `${API_URL}/accounts/logout/`;
  }

  /**
   * Fetch the current user info from the backend (requires cookie-based session)
   * and persist it to localStorage for UI hydration.
   */
  public async fetchUserFromServer(): Promise<User | undefined> {
    try {
      const csrftoken = getCookie("csrftoken") || "";
      const response = await fetch(`${API_URL}/accounts/user-info/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRFToken": csrftoken,
        }
      });

      if (!response.ok) {
        console.error("Error fetching user info:", response.statusText);
        return undefined;
      }

      const data = await response.json();
      if (data) {
        try { localStorage.setItem('user', JSON.stringify(data)); } catch { /* ignore if storage unavailable */ }
      }

      return {
        id: data.id || null,
        username: data.username || null,
        email: data.email || null,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        social_profiles: data.social_profiles || undefined,
        onboarding_completed: data.onboarding_completed || null,
      } as User;
    } catch (error) {
      console.error('Error fetching user from server:', error);
      return undefined;
    }
  }

  async fetchUser(): Promise<User | undefined> {
    try {
      // Prefer localStorage for persistent login; fall back to sessionStorage
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");

      if (!raw) return undefined;

      const userInfo = JSON.parse(raw);
      return {
        id: userInfo.id || null,
        username: userInfo.username || null,
        email: userInfo.email || null,
        first_name: userInfo.first_name || null,
        last_name: userInfo.last_name || null,
        social_profiles: userInfo.social_profiles || undefined,
        onboarding_completed: userInfo.onboarding_completed || null,
      } as User;
    } catch (error: unknown) {
      console.error("Error fetching user from storage:", error);
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
        const data = await response.json();
        console.error("Error marking onboarding as completed:", data);
        throw new Error(data.error || "Unknown error");
      }

      return true;
    } catch (error: unknown) {
      console.error("Error marking onboarding as completed:", error);
      throw error;
    }
  }
}