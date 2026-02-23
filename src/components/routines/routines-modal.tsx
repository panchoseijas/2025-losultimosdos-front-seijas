"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Routine } from "@/types";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "react-hot-toast";
import routineService from "@/services/routine.service";

interface AvailableClassesModalProps {
  routines: Routine[];
  userId: string;
}

const AvailableClassesModal = ({
  routines,
  userId,
}: AvailableClassesModalProps) => {
  const [open, setOpen] = useState(false);
  const [assigningRoutineId, setAssigningRoutineId] = useState<
    Routine["id"] | null
  >(null);
  const queryClient = useQueryClient();

  const { mutate: assignRoutine, isPending: isAssigning } = useMutation({
    mutationFn: async (routine: Routine) => {
      await routineService.assignRoutine(userId, routine.id);
    },
    onMutate: async (routine) => {
      await queryClient.cancelQueries({ queryKey: ["routines"] });

      const prevRoutines = queryClient.getQueryData<Routine[]>(["routines"]);

      queryClient.setQueryData<Routine[]>(["routines"], (old = []) =>
        old.map((r) =>
          r.id === routine.id ? { ...r, users: [...r.users, userId] } : r
        )
      );
      toast.success("Rutina asignada correctamente", {
        id: "assign-routine",
      });
      return { prevRoutines };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
    onError: (err, routine, context) => {
      if (context?.prevRoutines) {
        queryClient.setQueryData(["routines"], context.prevRoutines);
      }
      toast.error("Error asignando la rutina", { id: "assign-routine" });
      queryClient.invalidateQueries({ queryKey: ["leaderboard-users"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard-sedes"] });
    },
  });

  const handleAssignRoutine = (routine: Routine) => {
    setAssigningRoutineId(routine.id);
    assignRoutine(routine, {
      onSettled: () => {
        setAssigningRoutineId(null);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Asignar Rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Asignar Rutina al Usuario</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {routines
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((routine: Routine) => {
                const isCurrentRoutineAssigning =
                  isAssigning && assigningRoutineId === routine.id;

                return (
                  <div
                    key={routine.id}
                    className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {routine.name}
                      </p>
                    </div>
                    {routine.users?.includes(userId) ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Asignada
                      </p>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAssignRoutine(routine)}
                        disabled={isCurrentRoutineAssigning}
                      >
                        {isCurrentRoutineAssigning ? "Asignando..." : "Asignar"}
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvailableClassesModal;
