"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useExerciseProgress } from "@/hooks/use-exercise-progress";

type ExerciseProgressChartProps = {
  exerciseId: number;
  exerciseName: string;
};

const chartConfig: ChartConfig = {
  maxWeight: {
    label: "Peso max (kg)",
    color: "var(--chart-1)",
  },
  totalVolume: {
    label: "Volumen total",
    color: "var(--chart-2)",
  },
};

export const ExerciseProgressChart = ({
  exerciseId,
  exerciseName,
}: ExerciseProgressChartProps) => {
  const { data: progress, isLoading } = useExerciseProgress(exerciseId);

  const chartData = useMemo(() => {
    if (!progress || progress.length === 0) return [];
    return progress.map((p) => ({
      date: new Date(p.date).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
      }),
      maxWeight: p.maxWeight,
      totalVolume: p.totalVolume,
      sets: p.sets,
    }));
  }, [progress]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{exerciseName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sin datos de progreso todavia.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{exerciseName} - Peso</CardTitle>
          <CardDescription className="text-xs">
            Evolucion del peso maximo utilizado por sesion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                fontSize={11}
                width={40}
                unit=" kg"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Line
                dataKey="maxWeight"
                type="monotone"
                stroke="var(--color-maxWeight)"
                strokeWidth={2}
                dot={{ fill: "var(--color-maxWeight)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{exerciseName} - Volumen</CardTitle>
          <CardDescription className="text-xs">
            Volumen total (series x reps x peso) por sesion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                fontSize={11}
                width={50}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Line
                dataKey="totalVolume"
                type="monotone"
                stroke="var(--color-totalVolume)"
                strokeWidth={2}
                dot={{ fill: "var(--color-totalVolume)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
