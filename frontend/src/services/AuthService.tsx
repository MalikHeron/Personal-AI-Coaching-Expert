// import { User } from '@/types/user';

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
}