"use client";

import { useMemo } from "react";
import { useChallenges } from "@/hooks/use-challenge";
import { useTrainingDays } from "@/hooks/use-training-days";
import { useMyGamification } from "@/hooks/use-my-gamification"; // 👈 NUEVO
import { getLevelForPoints } from "@/lib/levels"; // 👈 NUEVO
import { Challenge } from "@/types/index";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react"; // 👈 candado grande

// 🔹 Reutilizamos ChallengeItem como antes
function ChallengeItem({
  challenge,
  frequencyLabel,
  extraProgressText,
}: {
  challenge: Challenge;
  frequencyLabel: string;
  extraProgressText?: string;
}) {
  const locked = challenge.currentLevel < challenge.minLevel;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-background/70 backdrop-blur-sm px-3 py-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{challenge.title}</span>
          <Badge variant="outline" className="text-[10px]">
            {frequencyLabel}
          </Badge>
          {challenge.pointsReward > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              +{challenge.pointsReward} pts
            </Badge>
          )}
        </div>

        {challenge.description && (
          <p className="text-xs text-muted-foreground">
            {challenge.description}
          </p>
        )}

        {extraProgressText && (
          <p className="text-[11px] text-muted-foreground mt-1">
            {extraProgressText}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              locked && "border-amber-500 text-amber-700",
              !locked && "border-emerald-500 text-emerald-700"
            )}
          >
            {locked
              ? `Disponible desde nivel ${challenge.minLevel}`
              : `Tu nivel actual: ${challenge.currentLevel}`}
          </Badge>

          {!locked && challenge.isCompleted && (
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-500 text-emerald-700"
            >
              Desafío completado
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserChallengesSection() {
  // All hooks must be called unconditionally at the top
  const { totalPoints, isLoading: loadingGamification } = useMyGamification();
  const { level: userLevel } = getLevelForPoints(totalPoints);

  const {
    challenges: dailyChallenges,
    isLoading: loadingDaily,
    isFetching: fetchingDaily,
  } = useChallenges("DAILY");

  const {
    challenges: weeklyChallenges,
    isLoading: loadingWeekly,
    isFetching: fetchingWeekly,
  } = useChallenges("WEEKLY");

  const today = useMemo(() => new Date(), []);
  const { trainingDays } = useTrainingDays(today);

  const weeklyInfo = useMemo(() => {
    const d = new Date(today);
    const dow = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const sessions = trainingDays.filter((key) => {
      const day = new Date(key);
      return day >= monday && day <= sunday;
    }).length;

    return { sessions };
  }, [today, trainingDays]);

  const weeklyText = `Esta semana entrenaste ${weeklyInfo.sessions} día(s).`;

  // Show loading skeleton while gamification data is loading
  if (loadingGamification) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Early return AFTER all hooks have been called
  if (userLevel.level < 3) {
    return (
      <Card className="relative overflow-hidden border-red-400 shadow-lg">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <CardHeader className="relative z-10 flex flex-col items-center text-center">
          <Lock className="h-12 w-12 text-red-400 mb-3" />{" "}
          <CardTitle className="text-xl font-bold text-white">
            Desafíos bloqueados
          </CardTitle>
          <p className="text-sm text-gray-200 mt-1">
            Los desafíos especiales se desbloquean al alcanzar el{" "}
            <span className="font-bold text-yellow-300">Nivel 3</span>.
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Seguí entrenando y anotándote a clases para subir de nivel 💪🔥
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30 bg-[radial-gradient(circle_at_top,_#22c55e15,_transparent_60%),_radial-gradient(circle_at_bottom,_#6366f115,_transparent_60%)]" />

      <CardHeader className="relative space-y-1">
        <CardTitle className="text-xl font-bold">Desafíos especiales</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tus desafíos diarios y semanales se actualizan automáticamente según
          tu actividad.
        </p>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Desafíos diarios */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Desafíos diarios</h3>
            {fetchingDaily && !loadingDaily && (
              <span className="text-[10px] text-muted-foreground">
                Actualizando...
              </span>
            )}
          </div>

          {loadingDaily ? (
            <Skeleton className="h-20 w-full" />
          ) : dailyChallenges.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay desafíos diarios disponibles.
            </p>
          ) : (
            <div className="space-y-2">
              {dailyChallenges.map((ch) => (
                <ChallengeItem
                  key={ch.id}
                  challenge={ch}
                  frequencyLabel="Diario"
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Desafíos semanales</h3>
            {fetchingWeekly && !loadingWeekly && (
              <span className="text-[10px] text-muted-foreground">
                Actualizando...
              </span>
            )}
          </div>

          {loadingWeekly ? (
            <Skeleton className="h-20 w-full" />
          ) : weeklyChallenges.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay desafíos semanales disponibles.
            </p>
          ) : (
            <div className="space-y-2">
              {weeklyChallenges.map((ch) => (
                <ChallengeItem
                  key={ch.id}
                  challenge={ch}
                  frequencyLabel="Semanal"
                  extraProgressText={weeklyText}
                />
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
