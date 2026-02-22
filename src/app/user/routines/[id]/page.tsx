"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import routineService from "@/services/routine.service";
import {
  Exercise,
  RoutineExercise,
  SessionStatus,
  WorkoutSetRecord,
} from "@/types";
import {
  IconBarbell,
  IconClock,
  IconHistory,
  IconChartLine,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { use } from "react";
import { useWorkoutSessions } from "@/hooks/use-workout-sessions";
import { ExerciseProgressChart } from "@/components/progress/exercise-progress-chart";
import type { WorkoutSession } from "@/types";

type Params = Promise<{ id: string }>;

const STATUS_LABELS: Record<SessionStatus, string> = {
  COMPLETED: "Completada",
  PARTIAL: "Parcial",
  NOT_DONE: "No realizada",
};

const STATUS_VARIANTS: Record<SessionStatus, string> = {
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  PARTIAL:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  NOT_DONE: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const groupPerformancesByExercise = (
  performances: WorkoutSetRecord[],
): Map<
  number,
  { exercise: WorkoutSetRecord["exercise"]; sets: WorkoutSetRecord[] }
> => {
  const map = new Map<
    number,
    { exercise: WorkoutSetRecord["exercise"]; sets: WorkoutSetRecord[] }
  >();
  for (const p of performances) {
    if (!map.has(p.exerciseId)) {
      map.set(p.exerciseId, { exercise: p.exercise, sets: [] });
    }
    map.get(p.exerciseId)!.sets.push(p);
  }
  return map;
};

const HistorySessionCard = ({ session }: { session: WorkoutSession }) => {
  const [expanded, setExpanded] = useState(false);
  const exerciseGroups = session.performances
    ? groupPerformancesByExercise(session.performances)
    : new Map();

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-label={expanded ? "Contraer sesion" : "Expandir sesion"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <IconCalendar size={14} />
            {formatDate(session.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={STATUS_VARIANTS[session.status]}
              variant="outline"
            >
              {STATUS_LABELS[session.status]}
            </Badge>
            {expanded ? (
              <IconChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <IconChevronDown size={16} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {session.notes && (
            <p className="text-sm text-muted-foreground italic">
              {session.notes}
            </p>
          )}
          {Array.from(exerciseGroups.entries()).map(
            ([exerciseId, { exercise, sets }]) => (
              <div key={exerciseId} className="border rounded-md p-3 space-y-1">
                <div className="font-medium text-sm">
                  {exercise?.name ?? `Ejercicio #${exerciseId}`}
                </div>
                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-0.5 text-sm">
                  <span className="text-muted-foreground text-xs">Serie</span>
                  <span className="text-muted-foreground text-xs">Peso</span>
                  <span className="text-muted-foreground text-xs">Reps</span>
                  {sets.map((s: WorkoutSetRecord) => (
                    <Fragment key={s.id}>
                      <span className="text-xs text-muted-foreground">
                        {s.setNumber}
                      </span>
                      <span>{s.weight} kg</span>
                      <span>{s.reps}</span>
                    </Fragment>
                  ))}
                </div>
                {sets[0]?.comment && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {sets[0].comment}
                  </p>
                )}
              </div>
            ),
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default function RoutineDetailsPage({ params }: { params: Params }) {
  const id = use(params).id;
  const routineId = Number(id);

  const {
    data: routine,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["routine", id],
    queryFn: () => routineService.getRoutine(routineId),
  });

  const { data: sessionsData, isLoading: isSessionsLoading } =
    useWorkoutSessions({ routineId });

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
            Error al cargar los detalles de la rutina. Intenta nuevamente mas
            tarde.
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

  const exercises = routine.exercises as (RoutineExercise & {
    exercise?: Exercise;
  })[];

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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
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
}
