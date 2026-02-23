"use client";

import * as React from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

import ClassService, { type ClassEnrollItem } from "@/services/class.service";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/hooks/use-mobile";

type Point = ClassEnrollItem & { short: string };

const chartConfig: ChartConfig = {
  enroll: {
    label: "Inscriptos",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
};

function shorten(s: string, max = 28) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function EnrollTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as Point & { enroll: number };
  return (
    <div className="rounded-md border bg-background p-2 text-sm shadow">
      <div className="font-medium">{p.name}</div>
      <div className="text-muted-foreground">{p.enroll} inscriptos</div>
      {p.sede && (
        <div className="text-xs text-muted-foreground mt-1">
          Sede: {p.sede.name}
        </div>
      )}
    </div>
  );
}

export function ChartBar() {
  const { selectedSede } = useStore();
  const isMobile = useIsMobile();

  const {
    data: items = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["class-enrollments", selectedSede.id],
    queryFn: async () => {
      const items = await ClassService.getEnrollmentsCount(
        true,
        selectedSede.id
      );
      return (items ?? [])
        .map((c) => ({ ...c, short: shorten(c.name) }))
        .sort(
          (a, b) =>
            b.enrollCount - a.enrollCount || a.name.localeCompare(b.name)
        );
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const noClasses = !loading && !error && items.length === 0;
  const noEnrolls =
    !loading &&
    !error &&
    items.length > 0 &&
    items.every((d) => d.enrollCount === 0);

  const chartData = useMemo(
    () => items.map((d) => ({ ...d, enroll: d.enrollCount })),
    [items]
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Clases por inscriptos</CardTitle>
        <CardDescription>
          Próximas clases (ordenadas por inscriptos)
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
        ) : noClasses ? (
          <div className="pt-6 text-sm text-muted-foreground">
            No hay clases creadas aún.
          </div>
        ) : noEnrolls ? (
          <div className="pt-6 text-sm text-muted-foreground">
            Aún no hay inscriptos en ninguna clase.
          </div>
        ) : isMobile ? (
          <div className="h-full w-full overflow-x-auto">
            <ChartContainer
              config={chartConfig}
              className="h-full"
              style={{
                minWidth: `${Math.max(100, chartData.length * 60)}%`,
                width:
                  chartData.length > 5 ? `${chartData.length * 60}%` : "100%",
              }}
            >
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 20, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="short"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value: string) => (value ?? "").slice(0, 3)}
                />

                <ChartTooltip cursor={false} content={<EnrollTooltip />} />
                <Bar dataKey="enroll" radius={8}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.sede?.id === selectedSede.id
                          ? "var(--chart-2)"
                          : "var(--chart-1)"
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="enroll"
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 20, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="short"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value: string) => (value ?? "").slice(0, 3)}
              />

              <ChartTooltip cursor={false} content={<EnrollTooltip />} />
              <Bar dataKey="enroll" radius={8}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.sede?.id === selectedSede.id
                        ? "var(--chart-2)"
                        : "var(--chart-1)"
                    }
                  />
                ))}
                <LabelList
                  dataKey="enroll"
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartBar;
