"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import routineService from "@/services/routine.service";
import { Exercise, RoutineExercise } from "@/types";
import { IconBarbell, IconClock } from "@tabler/icons-react";
import { use } from "react";

type Params = Promise<{ id: string }>;

export default function RoutineDetailsPage({ params }: { params: Params }) {
  const id = use(params).id;
  const {
    data: routine,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["routine", id],
    queryFn: async () => {
      return routineService.getRoutine(Number(id));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Error al cargar los detalles de la rutina. Por favor, intenta
            nuevamente más tarde.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!routine) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Rutina no encontrada.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{routine.name}</CardTitle>
            <Badge variant="outline">{routine.level}</Badge>
          </div>
          <p className="text-muted-foreground">{routine.description}</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconClock size={20} />
              <span>{routine.duration} minutos</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBarbell />
            Ejercicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routine.exercises.map(
              (exercise: RoutineExercise & { exercise?: Exercise }) => (
                <Card key={exercise.id}>
                  <CardContent className="">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {exercise.exercise?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {exercise.exercise?.muscleGroup.name}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="font-semibold">{exercise.sets}</span>{" "}
                          sets
                        </div>
                        <div>
                          <span className="font-semibold">{exercise.reps}</span>{" "}
                          reps
                        </div>
                        <div>
                          <span className="font-semibold">
                            {exercise.restTime}
                          </span>
                          s rest
                          {exercise.exercise?.videoUrl && (
                            <div className="mt-4">
                              <a
                                href={exercise.exercise.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline"
                              >
                                Ver video
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
