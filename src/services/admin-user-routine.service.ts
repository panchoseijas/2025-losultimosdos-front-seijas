import apiService from "./api.service";
import type {
  ExerciseProgressPoint,
  WorkoutSessionListResponse,
} from "@/types";

class AdminUserRoutineService {
  private readonly api = apiService;

  async getUserWorkoutSessions(
    userId: string,
    options?: { routineId?: number; page?: number; limit?: number }
  ): Promise<WorkoutSessionListResponse> {
    const params = new URLSearchParams();
    if (options?.routineId) {
      params.set("routineId", String(options.routineId));
    }
    if (options?.page) {
      params.set("page", String(options.page));
    }
    if (options?.limit) {
      params.set("limit", String(options.limit));
    }

    const qs = params.toString();
    return this.api.get(
      `/admin/users/${userId}/workout-sessions${qs ? `?${qs}` : ""}`
    );
  }

  async getUserExerciseProgress(
    userId: string,
    exerciseId: number
  ): Promise<ExerciseProgressPoint[]> {
    const data = await this.api.get(
      `/admin/users/${userId}/exercises/${exerciseId}/progress`
    );
    return (data.items ?? []) as ExerciseProgressPoint[];
  }
}

export default new AdminUserRoutineService();
