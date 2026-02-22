"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useStore } from "@/store/useStore";
import { useEvaluateChallenges } from "@/hooks/use-evaluate-challenge";
import workoutSessionService from "@/services/workoutSession.service";
import type { WorkoutSessionCreatePayload } from "@/types";

export const useWorkoutSessions = (options?: {
  routineId?: number;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["workoutSessions", options],
    queryFn: () => workoutSessionService.list(options),
  });
};

export const useWorkoutSessionDetail = (sessionId: number) => {
  return useQuery({
    queryKey: ["workoutSession", sessionId],
    enabled: !!sessionId,
    queryFn: () => workoutSessionService.getById(sessionId),
  });
};

export const useCreateWorkoutSession = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { selectedSede } = useStore();
  const { mutate: evaluateChallenges } = useEvaluateChallenges();

  return useMutation({
    mutationFn: (payload: WorkoutSessionCreatePayload) =>
      workoutSessionService.create(payload),

    onSuccess: () => {
      if (!userId) return;

      queryClient.invalidateQueries({ queryKey: ["workoutSessions"] });
      queryClient.invalidateQueries({ queryKey: ["userRoutines", userId] });
      queryClient.invalidateQueries({ queryKey: ["bestPerformances"] });
      queryClient.invalidateQueries({ queryKey: ["userBadges", userId] });
      queryClient.invalidateQueries({
        queryKey: [
          "leaderboard-users",
          { period: "all", sedeId: selectedSede.id },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "leaderboard-users",
          { period: "30d", sedeId: selectedSede.id },
        ],
      });

      evaluateChallenges();
    },
  });
};
