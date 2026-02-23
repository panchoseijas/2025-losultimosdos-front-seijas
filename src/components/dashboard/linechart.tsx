"use client";

import * as React from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useStore } from "@/store/useStore";
import apiService from "@/services/api.service";

export const description = "A line chart with dots";

type SedeHours = {
  sedeId: number;
  sedeName: string;
  hours: { hour: string; total: number }[];
};

type ChartDataPoint = {
  hour: string;
  [key: string]: number | string;
};

const HOURS: string[] = Array.from({ length: 13 }, (_, i) =>
  String(8 + i).padStart(2, "0")
);

export function ChartLine() {
  const { selectedSede } = useStore();
  const {
    data: queryData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["class-busiest-hour"],
    queryFn: async () => {
      const json: { items: SedeHours[] } = await apiService.get(
        `/classes/busiest-hour?upcoming=true`
      );

      const sedes = json.items ?? [];

      // Create chart data with all hours and all sedes
      const chartData: ChartDataPoint[] = HOURS.map((hour) => {
        const dataPoint: ChartDataPoint = { hour };

        sedes.forEach((sede) => {
          const sedeKey = `sede_${sede.sedeId}`;
          const hourData = sede.hours.find(
            (h) => h.hour.padStart(2, "0") === hour
          );
          dataPoint[sedeKey] = hourData?.total ?? 0;
        });

        return dataPoint;
      });

      return { chartData, sedes };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const chartData = queryData?.chartData ?? [];
  const sedes = queryData?.sedes ?? [];

  // Build dynamic chart config
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};

    sedes.forEach((sede) => {
      const sedeKey = `sede_${sede.sedeId}`;
      const isSelected = sede.sedeId === selectedSede.id;

      config[sedeKey] = {
        label: sede.sedeName,
        color: isSelected ? "var(--chart-2)" : "var(--chart-1)",
      };
    });

    return config;
  }, [sedes, selectedSede.id]);

  const allZero = useMemo(() => {
    if (chartData.length === 0) return true;

    return chartData.every((point) => {
      return sedes.every((sede) => {
        const sedeKey = `sede_${sede.sedeId}`;
        return (point[sedeKey] as number) === 0;
      });
    });
  }, [chartData, sedes]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Inscripciones por hora</CardTitle>
        <CardDescription>
          Próximas clases · 08–20 hs · Todas las sedes
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        {error ? (
          <div className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Error al cargar datos"}
          </div>
        ) : loading ? (
          <div className="pt-6 text-sm text-muted-foreground">
            Cargando datos…
          </div>
        ) : allZero ? (
          <div className="pt-6 text-sm text-muted-foreground">
            Aún no hay inscriptos en las próximas horas.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: string) => v}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {sedes.map((sede) => {
                const sedeKey = `sede_${sede.sedeId}`;
                const isSelected = sede.sedeId === selectedSede.id;

                return (
                  <Line
                    key={sedeKey}
                    dataKey={sedeKey}
                    type="natural"
                    stroke={`var(--color-${sedeKey})`}
                    strokeWidth={isSelected ? 3 : 2}
                    dot={{ fill: `var(--color-${sedeKey})` }}
                    activeDot={{ r: 6 }}
                    opacity={isSelected ? 1 : 0.4}
                  />
                );
              })}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartLine;
