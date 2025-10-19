// API URL configuration
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_SERVER_DEV
  : import.meta.env.VITE_API_SERVER;

// ============================================
// TypeScript Interfaces
// ============================================

export interface WorkoutSession {
  id?: number;
  user_id?: number;
  workout_name: string;
  total_duration: number; // in seconds
  total_reps: number;
  form_score: number; // 0-100 percentage
  date: string; // ISO timestamp
  created_at?: string;
}

export interface RepLog {
  id?: number;
  session_id: number;
  rep_number: number;
  set_number: number;
  duration: number; // seconds
  is_good_form: boolean;
  start_angle?: number;
  max_angle?: number;
  feedback: string;
  timestamp: string;
}

export interface FormAccuracyData {
  date: string;
  accuracy: number;
}

export interface RepSpeedDistribution {
  too_fast: number; // count < 1.0s
  good: number; // count 1.0-1.5s
  too_slow: number; // count > 1.5s
}

export interface WeeklyVolume {
  date: string;
  bicep_curls: number;
  squats: number;
  total: number;
}

export interface DashboardMetrics {
  monthly_total_reps: number; // Total reps for the current month
  total_time_trained: number; // Total time in minutes
  average_form_accuracy: number; // Average form score across all workouts (0-100)
}

// ============================================
// Dashboard Service Class
// ============================================

export class DashboardService {

  /**
   * Helper method to handle fetch responses
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    return response.json();
  }

  // ============================================
  // GET Services
  // ============================================

  /**
   * Get overall dashboard metrics
   */
  public static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${API_URL}/api/pace/analytics/dashboard/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<DashboardMetrics>(response);
  }

  /**
   * Get form accuracy trend data
   * @param days - Number of days to fetch (default: 30)
   */
  public static async getFormAccuracyTrend(days: number = 30): Promise<FormAccuracyData[]> {
    const response = await fetch(`${API_URL}/api/pace/analytics/accuracy/?days=${days}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<FormAccuracyData[]>(response);
  }

  /**
   * Get rep speed distribution data
   * @param sessionId - Optional specific session ID, or all sessions if not provided
   */
  public static async getRepSpeedDistribution(sessionId?: number): Promise<RepSpeedDistribution> {
    const url = sessionId
      ? `${API_URL}/api/pace/analytics/rep-speed/?session_id=${sessionId}`
      : `${API_URL}/api/pace/analytics/rep-speed/`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<RepSpeedDistribution>(response);
  }

  /**
   * Get weekly workout volume data
   * @param weeks - Number of weeks to fetch (default: 4)
   */
  public static async getWeeklyVolume(weeks: number = 4): Promise<WeeklyVolume[]> {
    const response = await fetch(`${API_URL}/api/pace/analytics/weekly-volume/?weeks=${weeks}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<WeeklyVolume[]>(response);
  }

  /**
   * Get all workout sessions for the current user
   */
  public static async getWorkoutSessions(): Promise<WorkoutSession[]> {
    const response = await fetch(`${API_URL}/api/pace/workouts/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<WorkoutSession[]>(response);
  }

  /**
   * Get a specific workout session by ID
   */
  public static async getWorkoutSession(id: number): Promise<WorkoutSession> {
    const response = await fetch(`${API_URL}/api/pace/workouts/${id}/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<WorkoutSession>(response);
  }

  /**
   * Get rep logs for a specific workout session
   */
  public static async getRepLogs(sessionId: number): Promise<RepLog[]> {
    const response = await fetch(`${API_URL}/api/pace/workouts/${sessionId}/reps/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<RepLog[]>(response);
  }

  // ============================================
  // POST Services
  // ============================================

  /**
   * Create a new workout session
   */
  public static async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at'>): Promise<WorkoutSession> {
    const response = await fetch(`${API_URL}/api/pace/workouts/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });
    return this.handleResponse<WorkoutSession>(response);
  }

  /**
   * Log a rep for a workout session
   */
  public static async logRep(repLog: Omit<RepLog, 'id'>): Promise<RepLog> {
    const response = await fetch(`${API_URL}/api/pace/workouts/${repLog.session_id}/reps/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repLog),
    });
    return this.handleResponse<RepLog>(response);
  }

  // ============================================
  // PUT Services
  // ============================================

  /**
   * Update an existing workout session
   */
  public static async updateWorkoutSession(id: number, session: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const response = await fetch(`${API_URL}/api/pace/workouts/${id}/`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });
    return this.handleResponse<WorkoutSession>(response);
  }

  /**
   * Update a specific rep log
   */
  public static async updateRepLog(sessionId: number, repId: number, repLog: Partial<RepLog>): Promise<RepLog> {
    const response = await fetch(`${API_URL}/api/pace/workouts/${sessionId}/reps/${repId}/`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repLog),
    });
    return this.handleResponse<RepLog>(response);
  }

  // ============================================
  // PATCH Services (Partial Updates)
  // ============================================

  /**
   * Partially update a workout session (e.g., end time, final stats)
   */
  public static async patchWorkoutSession(id: number, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const response = await fetch(`${API_URL}/api/pace/workouts/${id}/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return this.handleResponse<WorkoutSession>(response);
  }

  // ============================================
  // DELETE Services
  // ============================================

  /**
   * Delete a workout session
   */
  public static async deleteWorkoutSession(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/pace/workouts/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
  }
}