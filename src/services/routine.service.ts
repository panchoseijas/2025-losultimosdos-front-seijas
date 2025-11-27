import { Routine, RoutineExercise, Exercise } from "@/types";
import apiService from "./api.service";

export type BestPerformance = {
  exerciseId: number;
  weight: number;
  reps: number;
};
export type RoutineCompleteResponse = {
  ok: boolean;
  pointsAwarded: number;
  completionRatio: number;
  completedCount: number;
  totalExercises: number;
};

class RoutineService {
  private readonly apiService = apiService;

  async getAllRoutines(sedeId: number) {
    const data = await this.apiService.get(`/routines?sedeId=${sedeId}`);
    return data.items as (Routine & { exercises: RoutineExercise[] })[];
  }

  async getRoutinesUsersCount(sedeId: number) {
    const data = await this.apiService.get(
      `/routines/users-count?sedeId=${sedeId}`
    );
    return (data.items ?? []) as {
      name: string;
      usersCount: number;
      sede: { id: number; name: string };
    }[];
  }

  async getAllRoutinesUsersCount() {
    const data = await this.apiService.get(`/routines/users-count`);
    return (data.items ?? []) as {
      name: string;
      usersCount: number;
      sede: { id: number; name: string };
    }[];
  }

  async createRoutine(
    routine: Omit<Routine, "id">,
    exercises: RoutineExercise[]
  ) {
    const transformedExercises = exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      restTime: exercise.restTime,
    }));

    const data = await this.apiService.post("/admin/routines", {
      ...routine,
      exercises: transformedExercises,
    });
    return data as Routine;
  }

  async getRoutine(id: number) {
    const data = await this.apiService.get(`/routines/${id}`);

    // el back devuelve Routine + exercises con exercise anidado
    return data as Routine & {
      exercises: (RoutineExercise & { exercise?: Exercise })[];
    };
  }

  async deleteRoutine(id: number) {
    await this.apiService.delete(`/admin/routines/${id}`);
  }

  async updateRoutine(
    id: number,
    routine: Routine,
    exercises: RoutineExercise[]
  ) {
    const transformedExercises = this.transformExercises(exercises);
    await this.apiService.put(`/admin/routines/${id}`, {
      ...routine,
      exercises: transformedExercises,
    });
  }

  async assignRoutine(userId: string, routineId: number) {
    await this.apiService.post(`/admin/routines/${routineId}/assign`, {
      userId,
    });
  }

  async unassignRoutine(userId: string, routineId: number) {
    await this.apiService.post(`/admin/routines/${routineId}/unassign`, {
      userId,
    });
  }

  async getUserRoutines(userId: string) {
    const data = await this.apiService.get(`/user/routines`);
    return data.routines as (Routine & {
      exercises: RoutineExercise[];
    })[];
  }

  async getBestPerformances(routineId: number): Promise<BestPerformance[]> {
    const data = await this.apiService.get(
      `/user/routines/${routineId}/best-performances`
    );
    return (data.items ?? []) as BestPerformance[];
  }

  async completeRoutine(
    routineId: number,
    performances: { exerciseId: number; weight: number; reps: number }[]
  ): Promise<RoutineCompleteResponse> {
    const data = await this.apiService.post(
      `/user/routines/${routineId}/complete`,
      { performances }
    );

    return data as RoutineCompleteResponse;
  }

  private transformExercises(exercises: RoutineExercise[]) {
    return exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      restTime: exercise.restTime,
    }));
  }
}

export default new RoutineService();
