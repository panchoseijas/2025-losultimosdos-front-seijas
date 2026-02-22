"use client";

import { useQuery } from "@tanstack/react-query";
import workoutSessionService from "@/services/workoutSession.service";

export const useExerciseProgress = (exerciseId: number) => {
  return useQuery({
    queryKey: ["exerciseProgress", exerciseId],
    enabled: !!exerciseId,
    queryFn: () => workoutSessionService.getExerciseProgress(exerciseId),
  });
};
