"use client";

import { useQuery } from "@tanstack/react-query";
import RoutineService from "@/services/routine.service";

export function useBestPerformances(routineId: number) {
  return useQuery({
    queryKey: ["bestPerformances", routineId],
    enabled: !!routineId,
    queryFn: async () => {
      return RoutineService.getBestPerformances(routineId);
    },
  });
}
