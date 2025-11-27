"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { columns as baseColumns } from "@/components/routines/columns";
import type { Routine } from "@/types";
import {
  Activity,
  Dumbbell,
  Flame,
  Timer,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import routineService from "@/services/routine.service";
import { useStore } from "@/store/useStore";

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  dumbbell: Dumbbell,
  flame: Flame,
  timer: Timer,
  heart: Heart,
};

interface AdminRoutineTableProps {
  routines: Routine[];
}

const AdminRoutineTable = ({
  routines: initialRoutines,
}: AdminRoutineTableProps) => {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();
  const { selectedSede } = useStore();
  const queryClient = useQueryClient();
  useEffect(() => {
    setRoutines(initialRoutines);
  }, [initialRoutines]);

  const { mutate: deleteRoutine, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      await routineService.deleteRoutine(id);
    },
    onMutate: async (deletedId) => {
      // Optimistically remove the routine from the UI
      setRoutines((current) =>
        current.filter((routine) => routine.id !== deletedId)
      );
      setDeletingId(null);
      toast.success("Rutina eliminada correctamente");
    },
    onSuccess: () => {
      setDeletingId(null);
      router.refresh();
      queryClient.refetchQueries({ queryKey: ["routines", selectedSede.id] });
    },
    onError: (error) => {
      // Revert the optimistic update on error
      setDeletingId(null);
      setRoutines(initialRoutines);
      toast.error("Error al eliminar la rutina");
      console.error("Error deleting routine:", error);
    },
  });

  const extraColumns: ColumnDef<Routine>[] = [
    {
      accessorKey: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="px-4 py-2 flex gap-2 items-center justify-end">
          <Link href={`/admin/routines/edit/${row.original.id}`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => deleteRoutine(row.original.id as number)}
            disabled={deletingId === row.original.id}
            className="cursor-pointer disabled:cursor-not-allowed w-28"
          >
            {deletingId === row.original.id ? "Eliminando" : "Eliminar"}
          </Button>
        </div>
      ),
    },
  ];

  const translateLevel = (level: string) => {
    switch (level) {
      case "Beginner":
        return "Principiante";
      case "Intermediate":
        return "Intermedio";
      case "Advanced":
        return "Avanzado";
    }
  };
  return (
    <>
      <div className="hidden sm:block">
        <DataTable
          columns={[...baseColumns, ...extraColumns]}
          data={routines}
        />
      </div>

      <div className="sm:hidden space-y-3">
        {routines.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No hay rutinas disponibles.
              </p>
            </CardContent>
          </Card>
        ) : (
          routines.map((rt) => (
            <Card key={rt.id} className="overflow-hidden">
              <CardHeader className="pb-2 items-center">
                <CardTitle className="text-base flex  gap-2 ">
                  {(() => {
                    const key = (rt.icon ?? "").toString().toLowerCase();
                    const IconCmp = ICONS[key as keyof typeof ICONS];
                    return IconCmp ? (
                      <IconCmp className="h-4 w-4" aria-hidden />
                    ) : null;
                  })()}
                  <span>{rt.name ?? "Rutina sin nombre"}</span>
                </CardTitle>

                <CardAction className="mt-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Link
                      href={`/admin/routines/edit/${rt.id}`}
                      prefetch={false}
                    >
                      Editar
                    </Link>
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500 dark:text-gray-400">
                    Descripción
                  </div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {rt.description ?? "-"}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">Nivel</div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {translateLevel(rt.level) ?? "-"}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">
                    Duración
                  </div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {rt.duration ?? "-"}
                  </div>
                </div>

                {rt.description ? (
                  <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 line-clamp-4">
                    {rt.description}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
};

export default AdminRoutineTable;
