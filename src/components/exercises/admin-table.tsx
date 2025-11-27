"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";

import apiService, { ApiValidationError } from "@/services/api.service";
import { ExerciseForm } from "@/components/forms/exercise";
import type { ExerciseFormValues } from "@/components/forms/exercise";
import { type Exercise } from "@/types";
import { columns as baseColumns } from "@/components/exercises/columns";
import { useQueryClient } from "@tanstack/react-query";

const useIsMobile = (query = "(max-width: 640px)") => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);

    onChange(mql);
    mql.addEventListener?.("change", onChange as any);
    return () => mql.removeEventListener?.("change", onChange as any);
  }, [query]);
  return isMobile;
};

interface AdminTableProps {
  exercises: Exercise[];
}

const AdminTable = ({ exercises }: AdminTableProps) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isMobile = useIsMobile();
  const router = useRouter();
  const queryClient = useQueryClient();
  const onDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await apiService.delete(`/admin/exercises/${id}`);
      router.refresh();
      toast.success("Ejercicio eliminado correctamente");
    } catch (error) {
      if (error instanceof ApiValidationError) {
        if (error.status === 409) {
          toast.error(
            "El ejercicio no puede ser eliminado porque está asignado a una rutina"
          );
        }
      } else {
        toast.error("Error eliminando el ejercicio");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const onEdit = async (values: ExerciseFormValues) => {
    if (!values.id) return;

    await apiService.put(`/admin/exercises/${values.id}`, {
      name: values.name,
      videoUrl: values.videoUrl || null,
      equipment: values.equipment || null,
      muscleGroupId: values.muscleGroupId,
    });

    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    setSelectedExercise(null);
  };

  const actionColumn: ColumnDef<Exercise> = {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="px-4 py-2 flex gap-2 items-center justify-end">
        <SheetTrigger onClick={() => setSelectedExercise(row.original)} asChild>
          <Button variant="outline">Editar</Button>
        </SheetTrigger>
        <Button
          variant="destructive"
          onClick={() => onDelete(row.original.id)}
          disabled={deletingId === row.original.id}
          className="cursor-pointer disabled:cursor-not-allowed w-28"
        >
          {deletingId === row.original.id ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    ),
  };

  const tableColumns: ColumnDef<Exercise>[] = [...baseColumns, actionColumn];

  return (
    <Sheet
      open={!!selectedExercise}
      onOpenChange={(open) => !open && setSelectedExercise(null)}
    >
      <div className="hidden sm:block">
        <DataTable columns={tableColumns} data={exercises} />
      </div>

      <div className="sm:hidden space-y-3">
        {exercises.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No hay ejercicios creados.
              </p>
            </CardContent>
          </Card>
        ) : (
          exercises.map((ex) => (
            <Card key={ex.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ex.name}</CardTitle>
                <CardAction className="mt-2 flex gap-2">
                  <SheetTrigger onClick={() => setSelectedExercise(ex)} asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                  </SheetTrigger>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(ex.id)}
                    disabled={deletingId === ex.id}
                    className="flex-1"
                  >
                    {deletingId === ex.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500 dark:text-gray-400">
                    Grupo muscular
                  </div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {ex.muscleGroup?.name ?? "-"}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">Equipo</div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {ex.equipment ?? "-"}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">Video</div>
                  <div className="text-right">
                    {ex.videoUrl ? (
                      <a
                        href={ex.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4 text-gray-900 dark:text-gray-100 break-all"
                      >
                        Ver video
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">
                        -
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] w-full p-4" : "sm:w-[540px]"}
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            Editar Ejercicio
          </SheetTitle>
        </SheetHeader>
        {selectedExercise && (
          <div className="mt-4">
            <ExerciseForm
              defaultValues={{
                id: selectedExercise.id,
                name: selectedExercise.name,
                videoUrl: selectedExercise.videoUrl ?? "",
                equipment: selectedExercise.equipment ?? "",
                muscleGroupId: selectedExercise.muscleGroup?.id!, // asegúrate de que exista
              }}
              onSubmit={onEdit}
              isEdit
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AdminTable;
