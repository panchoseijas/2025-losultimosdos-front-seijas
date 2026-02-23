"use client";

import { Fragment, useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import type { SessionStatus, WorkoutSession, WorkoutSetRecord } from "@/types";

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
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const groupPerformancesByExercise = (
  performances: WorkoutSetRecord[]
): Map<number, { exercise: WorkoutSetRecord["exercise"]; sets: WorkoutSetRecord[] }> => {
  const grouped = new Map<
    number,
    { exercise: WorkoutSetRecord["exercise"]; sets: WorkoutSetRecord[] }
  >();

  for (const performance of performances) {
    if (!grouped.has(performance.exerciseId)) {
      grouped.set(performance.exerciseId, {
        exercise: performance.exercise,
        sets: [],
      });
    }
    grouped.get(performance.exerciseId)?.sets.push(performance);
  }

  return grouped;
};

const HistorySessionCard = ({ session }: { session: WorkoutSession }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const exerciseGroups = session.performances
    ? groupPerformancesByExercise(session.performances)
    : new Map();

  const handleToggleExpanded = () => {
    setIsExpanded((current) => !current);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    handleToggleExpanded();
  };

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={handleToggleExpanded}
        role="button"
        tabIndex={0}
        aria-label={isExpanded ? "Contraer sesion" : "Expandir sesion"}
        onKeyDown={handleKeyDown}
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
            {isExpanded ? (
              <IconChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <IconChevronDown size={16} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {session.notes && (
            <p className="text-sm text-muted-foreground italic">{session.notes}</p>
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

                  {sets.map((setItem) => (
                    <Fragment key={setItem.id}>
                      <span className="text-xs text-muted-foreground">
                        {setItem.setNumber}
                      </span>
                      <span>{setItem.weight} kg</span>
                      <span>{setItem.reps}</span>
                    </Fragment>
                  ))}
                </div>

                {sets[0]?.comment && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {sets[0].comment}
                  </p>
                )}
              </div>
            )
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default HistorySessionCard;
