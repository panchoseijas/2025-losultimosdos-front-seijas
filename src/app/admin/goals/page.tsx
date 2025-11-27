"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import goalService from "@/services/goal.service";
import { Goal } from "@/types";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import { useDeleteGoal } from "@/hooks/use-goal-mutations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";

const GoalsPage = () => {
  const { selectedSede } = useStore();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);
  const deleteGoalMutation = useDeleteGoal(selectedSede.id);
  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals", selectedSede.id],
    queryFn: async () => {
      const response = await goalService.getGoalsBySede(selectedSede.id);

      return response as Goal[];
    },
  });

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleDelete = (goalId: number) => {
    setDeletingGoalId(goalId);
  };

  const confirmDelete = async () => {
    if (deletingGoalId) {
      await deleteGoalMutation.mutateAsync(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  // Sort goals: active first, then by end date
  const sortedGoals = goals
    ? [...goals]
        .filter((goal) => goal.id != null) // Filter out goals without IDs
        .sort((a, b) => {
          const aCompleted = a.currentValue >= a.targetValue;
          const bCompleted = b.currentValue >= b.targetValue;

          // Safely parse dates
          const aEndDate =
            a.endDate instanceof Date ? a.endDate : new Date(a.endDate);
          const bEndDate =
            b.endDate instanceof Date ? b.endDate : new Date(b.endDate);
          const aExpired = isNaN(aEndDate.getTime())
            ? false
            : aEndDate < new Date();
          const bExpired = isNaN(bEndDate.getTime())
            ? false
            : bEndDate < new Date();

          // Active goals first
          if (!aCompleted && !aExpired && (bCompleted || bExpired)) return -1;
          if ((aCompleted || aExpired) && !bCompleted && !bExpired) return 1;

          // Then sort by end date
          if (isNaN(aEndDate.getTime()) || isNaN(bEndDate.getTime())) return 0;
          return aEndDate.getTime() - bEndDate.getTime();
        })
    : [];

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-4 p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Metas de {selectedSede.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y monitorea las metas de tu sede
          </p>
        </div>
        <CreateGoalDialog />
      </div>

      {!goals || goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Target className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hay metas creadas</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Comienza a establecer metas para tu sede y monitorea el progreso de
            tu equipo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGoals.map((goal, index) => (
            <GoalCard
              key={goal.id || `goal-${index}`}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EditGoalDialog
        goal={editingGoal}
        open={!!editingGoal}
        onOpenChange={(open) => {
          if (!open) setEditingGoal(null);
        }}
      />

      <AlertDialog
        open={!!deletingGoalId}
        onOpenChange={(open: boolean) => {
          if (!open) setDeletingGoalId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la meta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GoalsPage;
