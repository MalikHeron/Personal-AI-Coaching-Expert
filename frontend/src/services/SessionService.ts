/* eslint-disable @typescript-eslint/no-explicit-any */
import getCookie from "../helpers/cookies";

// Base API URL from environment
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_SERVER_DEV
  : import.meta.env.VITE_API_SERVER;

export type Session = {
  id: number;
  date: string;
  plan: number | null;
  plan_name?: string;
  rest_period_seconds?: number | null;
  score?: number | null;
  duration?: string | null; // "HH:MM:SS" per DRF DurationField
  completed?: boolean;
};

export type CreateSessionPayload = {
  plan_id: number;
  rest_period_seconds?: number | null;
};

export type SetLogInput = {
  exercise_id: number;
  set_number: number;
  reps_completed?: number | null;
  weight_kg?: number | null;
  duration_seconds?: number | null;
  score?: number | null;
};

export class SessionService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let detail: string | undefined;
      try {
        const data = await response.json();
        detail = typeof data === "string" ? data : JSON.stringify(data);
      } catch {
        detail = await response.text();
      }
      throw new Error(`HTTP ${response.status}: ${detail}`);
    }
    return response.json();
  }

  static async createSession(payload: CreateSessionPayload): Promise<Session> {
    const cookies = getCookie("csrftoken");
    const response = await fetch(`${API_URL}/pace/sessions/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies,
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<Session>(response);
  }

  static async listSessions(): Promise<Session[]> {
    const response = await fetch(`${API_URL}/pace/sessions/`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return this.handleResponse<Session[]>(response);
  }

  static async patchSession(sessionId: number, updates: Partial<Session>): Promise<Session> {
    const cookies = getCookie("csrftoken");
    const response = await fetch(`${API_URL}/pace/sessions/${sessionId}/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies,
      },
      body: JSON.stringify(updates),
    });
    return this.handleResponse<Session>(response);
  }

  static async createSetLogs(sessionId: number, sets: SetLogInput[]): Promise<any> {
    const cookies = getCookie("csrftoken");
    const response = await fetch(`${API_URL}/pace/sessions/${sessionId}/logs/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies,
      },
      body: JSON.stringify({ sets }),
    });
    return this.handleResponse<any>(response);
  }
}
