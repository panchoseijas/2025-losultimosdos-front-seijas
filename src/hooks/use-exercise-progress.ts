"use client";

import { useQuery } from "@tanstack/react-query";
import workoutSessionService from "@/services/workoutSession.service";

export const useExerciseProgress = (exerciseId: number, enabled = true) => {
  return useQuery({
    queryKey: ["exerciseProgress", exerciseId],
    enabled: enabled && !!exerciseId,
    queryFn: () => workoutSessionService.getExerciseProgress(exerciseId),
  });
};
