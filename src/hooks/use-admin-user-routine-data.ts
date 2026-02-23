"use client";

import { useQuery } from "@tanstack/react-query";
import adminUserRoutineService from "@/services/admin-user-routine.service";

export const useAdminUserWorkoutSessions = (
  userId: string,
  options?: { routineId?: number; page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: ["admin", "workoutSessions", userId, options],
    enabled: enabled && !!userId,
    queryFn: () => adminUserRoutineService.getUserWorkoutSessions(userId, options),
  });
};

export const useAdminUserExerciseProgress = (
  userId: string,
  exerciseId: number
) => {
  return useQuery({
    queryKey: ["admin", "exerciseProgress", userId, exerciseId],
    enabled: !!userId && !!exerciseId,
    queryFn: () =>
      adminUserRoutineService.getUserExerciseProgress(userId, exerciseId),
  });
};
