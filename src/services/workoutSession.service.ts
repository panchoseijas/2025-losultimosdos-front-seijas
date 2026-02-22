import apiService from "./api.service";
import type {
  WorkoutSession,
  WorkoutSessionCreatePayload,
  WorkoutSessionCreateResponse,
  WorkoutSessionListResponse,
  ExerciseProgressPoint,
} from "@/types";

class WorkoutSessionService {
  private readonly api = apiService;

  async create(
    payload: WorkoutSessionCreatePayload
  ): Promise<WorkoutSessionCreateResponse> {
    return this.api.post("/user/workout-sessions", payload as any);
  }

  async list(options?: {
    routineId?: number;
    page?: number;
    limit?: number;
  }): Promise<WorkoutSessionListResponse> {
    const params = new URLSearchParams();
    if (options?.routineId)
      params.set("routineId", String(options.routineId));
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));

    const qs = params.toString();
    return this.api.get(`/user/workout-sessions${qs ? `?${qs}` : ""}`);
  }

  async getById(id: number): Promise<WorkoutSession> {
    return this.api.get(`/user/workout-sessions/${id}`);
  }

  async getExerciseProgress(
    exerciseId: number
  ): Promise<ExerciseProgressPoint[]> {
    const data = await this.api.get(`/user/exercises/${exerciseId}/progress`);
    return (data.items ?? []) as ExerciseProgressPoint[];
  }
}

export default new WorkoutSessionService();
