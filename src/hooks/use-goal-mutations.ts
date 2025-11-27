import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Goal } from "@/types";
import goalService, {
  CreateGoalDto,
  UpdateGoalDto,
} from "@/services/goal.service";
import { toast } from "react-hot-toast";

interface MutationContext {
  prevGoals?: Goal[];
}

export const useCreateGoal = (sedeId: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, CreateGoalDto, MutationContext>({
    mutationFn: async (goalData: CreateGoalDto) => {
      return await goalService.createGoal(goalData);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["goals", sedeId] });
      toast.loading("Creando meta...", { id: "create-goal" });

      const prevGoals = queryClient.getQueryData<Goal[]>(["goals", sedeId]);
      return { prevGoals };
    },

    onSuccess: (newGoal) => {
      toast.success("Meta creada correctamente", { id: "create-goal" });
      queryClient.setQueryData<Goal[]>(["goals", sedeId], (old = []) => [
        ...old,
        newGoal,
      ]);
      if (onSuccess) {
        onSuccess();
      }
    },

    onError: (err, _, context) => {
      if (context?.prevGoals) {
        queryClient.setQueryData(["goals", sedeId], context.prevGoals);
      }
      toast.error("Error al crear la meta", { id: "create-goal" });
      console.error("Error creating goal:", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", sedeId] });
    },
  });
};

export const useUpdateGoal = (sedeId: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<
    Goal,
    Error,
    { id: number; data: UpdateGoalDto },
    MutationContext
  >({
    mutationFn: async ({ id, data }) => {
      return await goalService.updateGoal(id, data);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["goals", sedeId] });
      toast.loading("Actualizando meta...", { id: "update-goal" });

      const prevGoals = queryClient.getQueryData<Goal[]>(["goals", sedeId]);
      return { prevGoals };
    },

    onSuccess: (updatedGoal) => {
      toast.success("Meta actualizada correctamente", { id: "update-goal" });
      queryClient.setQueryData<Goal[]>(["goals", sedeId], (old = []) =>
        old.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
      );
      if (onSuccess) {
        onSuccess();
      }
    },

    onError: (err, _, context) => {
      if (context?.prevGoals) {
        queryClient.setQueryData(["goals", sedeId], context.prevGoals);
      }
      toast.error("Error al actualizar la meta", { id: "update-goal" });
      console.error("Error updating goal:", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", sedeId] });
    },
  });
};

export const useDeleteGoal = (sedeId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number, MutationContext>({
    mutationFn: async (goalId: number) => {
      return await goalService.deleteGoal(goalId);
    },

    onMutate: async (goalId) => {
      await queryClient.cancelQueries({ queryKey: ["goals", sedeId] });
      toast.loading("Eliminando meta...", { id: "delete-goal" });

      const prevGoals = queryClient.getQueryData<Goal[]>(["goals", sedeId]);

      queryClient.setQueryData<Goal[]>(["goals", sedeId], (old = []) =>
        old.filter((goal) => goal.id !== goalId)
      );

      return { prevGoals };
    },

    onSuccess: () => {
      toast.success("Meta eliminada correctamente", { id: "delete-goal" });
    },

    onError: (err, _, context) => {
      if (context?.prevGoals) {
        queryClient.setQueryData(["goals", sedeId], context.prevGoals);
      }
      toast.error("Error al eliminar la meta", { id: "delete-goal" });
      console.error("Error deleting goal:", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", sedeId] });
    },
  });
};
