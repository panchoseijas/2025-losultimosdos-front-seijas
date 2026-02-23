"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Sector, Label } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartPie } from "lucide-react";

import RoutineService from "@/services/routine.service";
import { useStore } from "@/store/useStore";

type Item = {
  name: string;
  usersCount: number;
  sede: { id: number; name: string };
};
type Point = Item & { key: string; fill: string };
type SedePoint = {
  sedeName: string;
  usersCount: number;
  sedeId: number;
  key: string;
  fill: string;
};

const PieChartSede = () => {
  const id = "routines-users-pie-sede";
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const { selectedSede } = useStore();

  const {
    data: items = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["routines-users-count-all"],
    queryFn: async () => {
      const items = await RoutineService.getAllRoutinesUsersCount();
      return items;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const data = useMemo(() => {
    const filtered = items.filter((item) => item.sede.id === selectedSede.id);
    const colors = [
      "var(--chart-6)",
      "var(--chart-7)",
      "var(--chart-8)",
      "var(--chart-9)",
      "var(--chart-10)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];
    return filtered.map((r, i) => ({
      ...r,
      key: `r-${i}`,
      fill: colors[i % colors.length],
    }));
  }, [items, selectedSede.id]);

  React.useEffect(() => {
    if (data.length > 0 && activeIndex === -1) {
      setActiveIndex(0);
    }
  }, [data, activeIndex]);

  const config = useMemo(() => {
    const config: ChartConfig = {};

    data.forEach((d) => {
      config[d.key] = { label: d.name, color: d.fill };
    });

    return config as ChartConfig;
  }, [data]);

  const noRoutines = !loading && !error && data.length === 0;
  const noAssignments =
    !loading &&
    !error &&
    data.length > 0 &&
    data.every((d) => d.usersCount === 0);

  return (
    <Card data-chart={id} className="h-full flex flex-col">
      <ChartStyle id={id} config={config} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2">
            <ChartPie className="h-5 w-5" />
            Usuarios por rutina - {selectedSede.name}
          </CardTitle>
          <CardDescription>Distribución en sede seleccionada</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 min-h-0 justify-center pb-0">
        {error ? (
          <div className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Error al cargar datos"}
          </div>
        ) : loading ? (
          <div className="pt-6 text-sm text-muted-foreground">
            Cargando datos…
          </div>
        ) : noRoutines ? (
          <div className="pt-6 text-sm text-muted-foreground">
            No hay rutinas creadas aún.
          </div>
        ) : noAssignments ? (
          <div className="pt-6 text-sm text-muted-foreground">
            Aún no hay usuarios asignados a ninguna rutina.
          </div>
        ) : (
          <ChartContainer id={id} config={config} className="h-full w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="usersCount"
                nameKey="name"
                innerRadius="55%"
                strokeWidth={5}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(-1)}
                activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    const idx = activeIndex >= 0 ? activeIndex : 0;
                    if (!data[idx]) return null;
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const value = data[idx].usersCount;
                      const name = data[idx].name;
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {value.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            Usuarios
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 36}
                            className="fill-muted-foreground text-[10px]"
                          >
                            {name}
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

const PieChartAllSedes = () => {
  const id = "routines-users-pie-all-sedes";
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const { selectedSede } = useStore();
  const legendItems = [
    {
      key: "selected",
      label: `Sede actual (${selectedSede.name})`,
      color: "var(--chart-2)",
    },
    {
      key: "others",
      label: "Otras sedes",
      color: "var(--chart-1)",
    },
  ];

  const {
    data: items = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["routines-users-count-all"],
    queryFn: async () => {
      const items = await RoutineService.getAllRoutinesUsersCount();
      return items;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const data = useMemo(() => {
    const sedeMap = new Map<
      number,
      { sedeName: string; usersCount: number; sedeId: number }
    >();
    items.forEach((item) => {
      const existing = sedeMap.get(item.sede.id);
      if (existing) {
        existing.usersCount += item.usersCount;
      } else {
        sedeMap.set(item.sede.id, {
          sedeName: item.sede.name,
          usersCount: item.usersCount,
          sedeId: item.sede.id,
        });
      }
    });

    return Array.from(sedeMap.entries()).map(([id, value]) => {
      const sedeKey = `sede_${id}`;
      const isSelected = id === selectedSede.id;

      return {
        ...value,
        key: sedeKey,
        fill: `var(--color-${sedeKey})`,
      };
    });
  }, [items, selectedSede.id]);

  React.useEffect(() => {
    if (data.length > 0 && activeIndex === -1) {
      setActiveIndex(0);
    }
  }, [data, activeIndex]);

  const config = useMemo(() => {
    const config: ChartConfig = {};

    data.forEach((sede) => {
      const isSelected = sede.sedeId === selectedSede.id;

      config[sede.key] = {
        label: sede.sedeName,
        color: isSelected ? "var(--chart-2)" : "var(--chart-1)",
      };
    });

    return config;
  }, [data, selectedSede.id]);

  const noSedes = !loading && !error && data.length === 0;
  const noAssignments =
    !loading &&
    !error &&
    data.length > 0 &&
    data.every((d) => d.usersCount === 0);

  return (
    <Card data-chart={id} className="h-full flex flex-col">
      <ChartStyle id={id} config={config} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2">
            <ChartPie className="h-5 w-5" />
            Rutinas asignadas por sede
          </CardTitle>
          <CardDescription>
            Distribución total de rutinas asignadas
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 min-h-0 justify-center pb-0">
        {error ? (
          <div className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Error al cargar datos"}
          </div>
        ) : loading ? (
          <div className="pt-6 text-sm text-muted-foreground">
            Cargando datos…
          </div>
        ) : noSedes ? (
          <div className="pt-6 text-sm text-muted-foreground">
            No hay sedes con datos aún.
          </div>
        ) : noAssignments ? (
          <div className="pt-6 text-sm text-muted-foreground">
            Aún no hay usuarios asignados.
          </div>
        ) : (
          <div className="h-full w-full">
            <div
              className="mb-2 flex items-center justify-center gap-4 text-xs text-muted-foreground"
              role="list"
              aria-label="Leyenda de colores por sede"
            >
              {legendItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2" role="listitem">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <ChartContainer id={id} config={config} className="h-full w-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data}
                  dataKey="usersCount"
                  nameKey="sedeName"
                  innerRadius="55%"
                  strokeWidth={5}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 25}
                        innerRadius={outerRadius + 12}
                      />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) => {
                      const idx = activeIndex >= 0 ? activeIndex : 0;
                      if (!data[idx]) return null;
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const value = data[idx].usersCount;
                        const name = data[idx].sedeName;
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {value.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 18}
                              className="fill-muted-foreground text-xs"
                            >
                              Usuarios
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 36}
                              className="fill-muted-foreground text-[10px]"
                            >
                              {name}
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function ChartPiee() {
  return (
    <>
      <PieChartSede />
      <PieChartAllSedes />
    </>
  );
}
