import apiService from "./api.service";
import { Exercise } from "@/types";

class ExerciseService {
  private readonly apiService = apiService;
  async createExercise(exercise: Omit<Exercise, "id">) {
    await this.apiService.post("/admin/exercises", exercise);
    return true;
  }
  async updateExercise(exerciseId: number, exercise: Omit<Exercise, "id">) {
    await this.apiService.put(`/admin/exercises/${exerciseId}`, exercise);
    return true;
  }
  async deleteExercise(exerciseId: number) {
    await this.apiService.delete(`/admin/exercises/${exerciseId}`);
    return true;
  }
  async getAllExercises() {
    const data = await this.apiService.get("/exercises");
    return data.items as Exercise[];
  }
}

export default new ExerciseService();
