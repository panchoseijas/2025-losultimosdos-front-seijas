import { User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/services/user.service";
import { toast } from "react-hot-toast";
import { useStore } from "@/store/useStore";

export const useUserRoleMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRole: string) => {
      return userService.updateUserRole(userId, newRole);
    },
    onMutate: async (newRole) => {
      await queryClient.cancelQueries({ queryKey: ["users", userId] });
      const prevUser = queryClient.getQueryData<User>(["users", userId]);
      queryClient.setQueryData(["users", userId], (oldData: User) => {
        return { ...oldData, role: newRole };
      });
      queryClient.setQueryData<User[]>(
        ["users"],
        (oldData: User[] | undefined) => {
          return (
            oldData?.map((user) =>
              user.id === userId
                ? { ...user, role: newRole as "admin" | "user" }
                : user
            ) ?? []
          );
        }
      );

      toast.success("Rol actualizado correctamente", { id: "update-role" });
      return { prevUser };
    },
    onError: (_error, _newRole, context) => {
      if (context?.prevUser) {
        queryClient.setQueryData(["users", userId], context.prevUser);
      }
      toast.error("Error al actualizar el rol del usuario", {
        id: "update-role",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUserPlanMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlan: "basic" | "premium") => {
      return userService.updateUserPlan(userId, newPlan);
    },
    onMutate: async (newPlan) => {
      await queryClient.cancelQueries({ queryKey: ["users", userId] });
      const prevUser = queryClient.getQueryData<User>(["users", userId]);
      queryClient.setQueryData(["users", userId], (oldData: User) => {
        return { ...oldData, plan: newPlan };
      });
      queryClient.setQueryData<User[]>(
        ["users"],
        (oldData: User[] | undefined) => {
          return (
            oldData?.map((user) =>
              user.id === userId
                ? { ...user, plan: newPlan as "basic" | "premium" }
                : user
            ) ?? []
          );
        }
      );
      toast.success("Plan actualizado correctamente", { id: "update-plan" });
      return { prevUser };
    },
    onError: (_error, _newPlan, context) => {
      if (context?.prevUser) {
        queryClient.setQueryData(["users", userId], context.prevUser);
      }
      toast.error("Error al actualizar el plan del usuario", {
        id: "update-plan",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-chart-data"] });
    },
  });
};

export const useUserSedeMutation = (userId: string) => {
  const queryClient = useQueryClient();
  const { selectedSede } = useStore();
  return useMutation({
    mutationFn: async (newSedeId: number) => {
      toast.loading("Actualizando sede...", { id: "update-sede" });
      return userService.updateUserSede(userId, newSedeId);
    },

    onSuccess: () => {
      toast.success("Sede actualizada correctamente", { id: "update-sede" });
    },
    onMutate: async (newSedeId) => {
      await queryClient.cancelQueries({ queryKey: ["users", userId] });
      const prevUser = queryClient.getQueryData<User>(["users", userId]);
      queryClient.setQueryData(["users", userId], (oldData: User) => {
        return { ...oldData, sedeId: newSedeId };
      });
      queryClient.setQueryData<User[]>(
        ["users"],
        (oldData: User[] | undefined) => {
          return (
            oldData?.map((user) =>
              user.id === userId ? { ...user, sedeId: newSedeId } : user
            ) ?? []
          );
        }
      );
      return { prevUser };
    },
    onError: (error: any, _newSedeId, context) => {
      if (context?.prevUser) {
        queryClient.setQueryData(["users", userId], context.prevUser);
      }

      const errorMessage =
        error?.message || "Error al actualizar la sede del usuario";
      toast.error(errorMessage, {
        id: "update-sede",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["goals", selectedSede.id] });
    },
  });
};
