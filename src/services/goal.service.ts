import apiService from "./api.service";
import { Goal } from "@/types";

export interface CreateGoalDto {
  title: string;
  description?: string;
  category: string;
  targetValue: number;
  endDate: Date;
  sedeId: number;
  targetClassId?: number;
  targetRoutineId?: number;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  targetValue?: number;
  endDate?: Date;
  targetClassId?: number;
  targetRoutineId?: number;
}

class GoalService {
  async getGoalsBySede(sedeId: number): Promise<Goal[]> {
    const response = await apiService.get(`/admin/goals?sedeId=${sedeId}`);
    console.log("response", response);
    return response.goals as Goal[];
  }

  async getGoalById(id: number): Promise<Goal> {
    const response = await apiService.get(`/admin/goals/${id}`);
    return response.goal;
  }

  async createGoal(goalData: CreateGoalDto): Promise<Goal> {
    const response = await apiService.post<Goal>(
      "/admin/goals",
      goalData as unknown as Record<string, unknown>
    );
    return response;
  }

  async updateGoal(id: number, goalData: UpdateGoalDto): Promise<Goal> {
    const response = await apiService.put<Goal>(
      `/admin/goals/${id}`,
      goalData as unknown as Record<string, unknown>
    );
    return response;
  }

  async deleteGoal(id: number): Promise<void> {
    await apiService.delete(`/admin/goals/${id}`);
  }
}

const goalService = new GoalService();
export default goalService;
