"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import routineService from "@/services/routine.service";
import { Exercise, RoutineExercise } from "@/types";
import {
  IconBarbell,
  IconClock,
  IconHistory,
  IconChartLine,
  IconArrowLeft,
} from "@tabler/icons-react";
import { ExerciseProgressChart } from "@/components/progress/exercise-progress-chart";
import HistorySessionCard from "@/components/progress/history-session-card";
import { useAdminUserWorkoutSessions } from "@/hooks/use-admin-user-routine-data";

const AdminUserRoutineDetailsPage = () => {
  const params = useParams();
  const userId = params.id as string;
  const routineIdParam = params.routineId as string;
  const routineId = Number(routineIdParam);

  const hasValidParams = !!userId && !Number.isNaN(routineId);

  const {
    data: routine,
    isLoading: isRoutineLoading,
    error: routineError,
  } = useQuery({
    queryKey: ["admin", "routine", userId, routineId],
    enabled: hasValidParams,
    queryFn: () => routineService.getRoutine(routineId),
  });

  const { data: sessionsData, isLoading: isSessionsLoading } =
    useAdminUserWorkoutSessions(userId, { routineId }, hasValidParams);

  const exercises = useMemo(
    () =>
      ((routine?.exercises as (RoutineExercise & { exercise?: Exercise })[]) ??
        []),
    [routine]
  );

  if (!hasValidParams) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Parametros invalidos para la rutina del usuario.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isRoutineLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (routineError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Error al cargar los detalles de la rutina del usuario.
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
      <div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/admin/user/${userId}`} aria-label="Volver al usuario">
            <IconArrowLeft size={16} />
            Volver al usuario
          </Link>
        </Button>
      </div>

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

      <Tabs defaultValue="exercises">
        <TabsList>
          <TabsTrigger value="exercises">
            <IconBarbell size={16} className="mr-1" />
            Ejercicios
          </TabsTrigger>
          <TabsTrigger value="history">
            <IconHistory size={16} className="mr-1" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="progress">
            <IconChartLine size={16} className="mr-1" />
            Progreso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBarbell />
                Ejercicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map((exercise) => (
                  <Card key={exercise.id}>
                    <CardContent>
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
                            <span className="font-semibold">
                              {exercise.sets}
                            </span>{" "}
                            sets
                          </div>
                          <div>
                            <span className="font-semibold">
                              {exercise.reps}
                            </span>{" "}
                            reps
                          </div>
                          <div>
                            <span className="font-semibold">
                              {exercise.restTime}
                            </span>
                            s rest
                          </div>
                        </div>
                      </div>
                      {exercise.exercise?.videoUrl && (
                        <div className="mt-3">
                          <a
                            href={exercise.exercise.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                            tabIndex={0}
                          >
                            Ver video
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {isSessionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : !sessionsData || sessionsData.sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No hay sesiones registradas para esta rutina todavia.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessionsData.sessions.map((session) => (
                <HistorySessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress">
          {exercises.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  Esta rutina no tiene ejercicios.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {exercises.map((exercise) => (
                <ExerciseProgressChart
                  key={exercise.exerciseId}
                  userId={userId}
                  exerciseId={exercise.exerciseId}
                  exerciseName={exercise.exercise?.name ?? "Ejercicio"}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserRoutineDetailsPage;
