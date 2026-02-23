"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Exercise, Routine, RoutineExercise, SessionStatus } from "@/types";
import {
  IconBarbell,
  IconClock,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import routineService, { BestPerformance } from "@/services/routine.service";
import { useBestPerformances } from "@/hooks/use-best-performance";
import { useCreateWorkoutSession } from "@/hooks/use-workout-sessions";
import { TrainingMascot } from "@/components/routines/mascot/trainingMascot";
import { useMyGamification } from "@/hooks/use-my-gamification";
import { getLevelForPoints } from "@/lib/levels";
import {
  workoutSessionFormSchema,
  type WorkoutSessionFormValues,
} from "@/schema/workoutSessionForm";

type Params = Promise<{ id: string }>;

type RoutineWithExercises = Routine & {
  exercises: (RoutineExercise & { exercise?: Exercise })[];
};

const deriveSessionStatus = (
  completedExerciseCount: number,
  totalExerciseCount: number,
): SessionStatus => {
  if (completedExerciseCount === 0) return "NOT_DONE";
  if (completedExerciseCount >= totalExerciseCount) return "COMPLETED";
  return "PARTIAL";
};

const calc1RM = (weight: number, reps: number): number => {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
};

type ExerciseCardProps = {
  exerciseIndex: number;
  routineExercise: RoutineExercise & { exercise?: Exercise };
  best: BestPerformance | undefined;
};

const ExerciseCard = ({
  exerciseIndex,
  routineExercise: re,
  best,
}: ExerciseCardProps) => {
  const form = useFormContext<WorkoutSessionFormValues>();

  const {
    fields: setFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  const watchedSets = form.watch(`exercises.${exerciseIndex}.sets`);

  const best1RM =
    best && best.weight && best.reps ? calc1RM(best.weight, best.reps) : 0;

  const bestSetToday = watchedSets?.reduce(
    (acc, s) => {
      const w = Number(s.weight);
      const r = Number(s.reps);
      const rm = calc1RM(w, r);
      return rm > acc.rm ? { rm, weight: w, reps: r } : acc;
    },
    { rm: 0, weight: 0, reps: 0 },
  );

  const isPR = bestSetToday && bestSetToday.rm > 0 && bestSetToday.rm > best1RM;
  const hasSets = watchedSets?.some((s) => s.weight !== "" && s.reps !== "");

  return (
    <Card
      className={cn(
        "transition-all border border-border",
        hasSets && "border-green-500/80 bg-green-50/40 dark:bg-green-950/20",
        isPR && "border-emerald-500/90 shadow-[0_0_15px_rgba(16,185,129,0.6)]",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                {re.exercise?.name ?? "Ejercicio"}
              </CardTitle>
              {isPR && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 border-emerald-500/70 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                >
                  Nuevo record 1RM
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              {re.sets && re.reps
                ? `${re.sets} x ${re.reps} reps`
                : "Series libres"}
            </CardDescription>
          </div>
          <div className="w-40 text-right">
            <div className="text-[11px] text-muted-foreground mb-1">
              Mejor historica
            </div>
            {best ? (
              <div className="text-sm">
                <span className="font-semibold">{best.weight} kg</span> ·{" "}
                {best.reps} reps
                {best1RM > 0 && (
                  <div className="text-[11px] text-muted-foreground">
                    1RM: {best1RM.toFixed(1)} kg
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">-</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="space-y-2">
          {setFields.map((setField, setIdx) => (
            <div key={setField.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12 shrink-0">
                  Serie {setIdx + 1}
                </span>
                <FormField
                  control={form.control}
                  name={`exercises.${exerciseIndex}.sets.${setIdx}.weight`}
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          placeholder="Peso (kg)"
                          aria-label={`Peso serie ${setIdx + 1}`}
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`exercises.${exerciseIndex}.sets.${setIdx}.reps`}
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          placeholder="Reps"
                          aria-label={`Repeticiones serie ${setIdx + 1}`}
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                {setFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Eliminar serie ${setIdx + 1}`}
                    onClick={() => remove(setIdx)}
                    className="px-2 text-muted-foreground hover:text-destructive"
                  >
                    <IconTrash size={16} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ weight: "", reps: "" })}
          className="text-xs"
          aria-label="Agregar serie"
        >
          <IconPlus size={14} className="mr-1" />
          Agregar serie
        </Button>

        {bestSetToday && bestSetToday.rm > 0 && (
          <div className="text-[11px] text-muted-foreground">
            Mejor 1RM hoy:{" "}
            <span className="font-semibold">
              {bestSetToday.rm.toFixed(1)} kg
            </span>
          </div>
        )}

        <FormField
          control={form.control}
          name={`exercises.${exerciseIndex}.comment`}
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormControl>
                <Input
                  placeholder="Comentario (opcional)"
                  aria-label="Comentario del ejercicio"
                  className="text-sm"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default function RoutinePlayPage({ params }: { params: Params }) {
  const router = useRouter();
  const { id } = use(params);
  const routineId = Number(id);

  const { totalPoints } = useMyGamification();
  const { level } = getLevelForPoints(totalPoints);
  const isLegendOrHigher = level.level >= 4;

  const {
    data: routine,
    isLoading: isRoutineLoading,
    error: routineError,
  } = useQuery({
    queryKey: ["routine", routineId],
    queryFn: () =>
      routineService.getRoutine(routineId) as Promise<RoutineWithExercises>,
  });

  const { data: bestPerformances = [], isLoading: isBestLoading } =
    useBestPerformances(routineId);
  const { mutateAsync: createSession, isPending: isSaving } =
    useCreateWorkoutSession();

  const form = useForm<WorkoutSessionFormValues>({
    resolver: zodResolver(workoutSessionFormSchema),
    defaultValues: {
      notes: "",
      exercises: [],
    },
  });

  useEffect(() => {
    if (!routine) return;

    const currentExercises = form.getValues("exercises");
    if (currentExercises.length > 0) return;

    form.setValue(
      "exercises",
      routine.exercises.map((re) => ({
        exerciseId: re.exerciseId,
        sets: [{ weight: "", reps: "" }],
        comment: "",
      })),
    );
  }, [routine, form]);

  const watchedExercises = form.watch("exercises");

  const handleSubmit = async (values: WorkoutSessionFormValues) => {
    const performances = values.exercises
      .map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets
          .filter((s) => s.weight !== "" && s.reps !== "")
          .map((s) => ({
            weight: Number(s.weight),
            reps: Number(s.reps),
            comment: ex.comment || undefined,
          })),
      }))
      .filter((p) => p.sets.length > 0);

    const status = deriveSessionStatus(
      performances.length,
      values.exercises.length,
    );

    const data = await createSession({
      routineId,
      status,
      notes: values.notes || undefined,
      performances,
    });

    const pts = data.pointsAwarded ?? 0;
    if (pts > 0) {
      toast.success(`Sesion guardada. Ganaste ${pts} puntos!`);
    } else {
      toast.success("Sesion guardada.");
    }

    router.push("/user/routines");
  };

  if (isRoutineLoading || isBestLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (routineError || !routine) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            No se pudo cargar la rutina. Intenta de nuevo mas tarde.
          </div>
        </CardContent>
      </Card>
    );
  }

  const exercisesWithSets = watchedExercises.filter((ex) =>
    ex.sets.some((s) => s.weight !== "" && s.reps !== ""),
  );
  const total = routine.exercises.length;
  const completedCount = exercisesWithSets.length;
  const progress = total ? Math.round((completedCount / total) * 100) : 0;

  const getBestForExercise = (
    exerciseId: number,
  ): BestPerformance | undefined =>
    bestPerformances.find((b) => b.exerciseId === exerciseId);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        noValidate
      >
        <Card
          className={cn(
            "relative overflow-hidden border bg-background",
            isLegendOrHigher &&
              "border-transparent bg-[radial-gradient(circle_at_top,_#a855f733,_transparent_55%),_radial-gradient(circle_at_bottom,_#ec489933,_transparent_55%)] before:absolute before:inset-0 before:-z-10 before:bg-[conic-gradient(at_top,_#a855f7,_#ec4899,_#f97316,_#a855f7)] before:opacity-60 before:animate-[spin_10s_linear_infinite]",
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{routine.name}</CardTitle>
                <p className="text-muted-foreground">
                  Registra tus series de hoy y compara con tu PR.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline">{routine.level}</Badge>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <IconClock size={18} />
                  <span>{routine.duration} min</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progreso de la rutina</span>
                <span>
                  {completedCount}/{total} ejercicios · {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden">
          <TrainingMascot visible={isLegendOrHigher} />

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBarbell />
              Ejercicios de hoy
            </CardTitle>
            <CardDescription>
              Para cada ejercicio, agrega las series que hagas. Si es la primera
              vez, la mejor historica aparece como <strong>-</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {routine.exercises.map((re, exerciseIndex) => (
              <ExerciseCard
                key={re.id}
                exerciseIndex={exerciseIndex}
                routineExercise={re}
                best={getBestForExercise(re.exerciseId)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de la sesion</CardTitle>
            <CardDescription>
              El estado se determina automaticamente:{" "}
              {completedCount === 0
                ? "No realizada"
                : completedCount >= total
                  ? "Completada"
                  : `Parcial (${completedCount}/${total})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de la sesion (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Me senti con buena energia, aumente peso en sentadilla..."
                      className="text-sm"
                      aria-label="Notas de la sesion"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar sesion"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
