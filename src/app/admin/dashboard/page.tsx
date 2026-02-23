"use client";

import { useEffect, useState } from "react";
import ChartPiee from "@/components/dashboard/piechart";
import { ChartBar } from "@/components/dashboard/barchart";
import { ChartArea } from "@/components/dashboard/memberchart";
import { ChartLine } from "@/components/dashboard/linechart";
import RoutineService from "@/services/routine.service";
import ClassService, { ClassEnrollItem } from "@/services/class.service";
import apiService from "@/services/api.service";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "@/hooks/use-users";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import userService from "@/services/user.service";

type ViewKey = "members" | "classes" | "hours" | "routines";
const DEFAULT_VIEW: ViewKey = "members";
const VIEW_OPTIONS: ViewKey[] = ["members", "classes", "hours", "routines"];

const getValidView = (value: string | null): ViewKey => {
  if (value && VIEW_OPTIONS.includes(value as ViewKey)) {
    return value as ViewKey;
  }

  return DEFAULT_VIEW;
};

const AdminPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<ViewKey>(() =>
    getValidView(searchParams.get("view"))
  );
  const { selectedSede } = useStore();

  useEffect(() => {
    const rawView = searchParams.get("view");
    const nextView = getValidView(rawView);

    if (rawView !== nextView) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", nextView);
      router.replace(`?${params.toString()}`, { scroll: false });
      return;
    }

    setActiveView((previousView) =>
      previousView === nextView ? previousView : nextView
    );
  }, [searchParams, router]);

  const { data: busiestHourData, isLoading: isLoadingBusiestHour } = useQuery({
    queryKey: ["busiest-hour", selectedSede.id],
    queryFn: async () => {
      const json = await apiService.get(`/classes/busiest-hour?upcoming=true`);
      const items = json.items.filter(
        (item: { sedeId: number }) => item.sedeId === selectedSede.id
      );

      if (!items || items.length === 0) {
        return "Sin clases";
      }

      let max = items[0].hours[0];
      for (let i = 1; i < items.length; i++) {
        if (items[i].hours[0].total > max.total) max = items[i].hours[0];
      }
      return `${max.hour}:00`;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: topRoutineData, isLoading: isLoadingTopRoutine } = useQuery({
    queryKey: ["top-routine", selectedSede.id],
    queryFn: async () => {
      const items = await RoutineService.getRoutinesUsersCount(selectedSede.id);

      const filteredItems = items.filter(
        (item) => item.sede.id === selectedSede.id
      );
      if (!filteredItems || filteredItems.length === 0) {
        return "Sin rutinas";
      }

      let max = filteredItems[0];
      for (let i = 1; i < filteredItems.length; i++) {
        if (filteredItems[i].usersCount > max.usersCount)
          max = filteredItems[i];
      }
      return max.usersCount > 0 ? max.name : "Sin asignaciones";
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: topClassData, isLoading: isLoadingTopClass } = useQuery({
    queryKey: ["top-class", selectedSede.id],
    queryFn: async () => {
      const items = await ClassService.getEnrollmentsCount(
        true,
        selectedSede.id
      );

      const filteredItems = items.filter(
        (item: ClassEnrollItem) => item.sede.id === selectedSede.id
      );

      if (!filteredItems || filteredItems.length === 0) {
        return "Sin clases";
      }

      let max = filteredItems[0];
      for (let i = 1; i < filteredItems.length; i++) {
        if (filteredItems[i].enrollCount > max.enrollCount)
          max = filteredItems[i];
      }
      return max.enrollCount > 0 ? max.name : "Sin inscriptos";
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-by-sede", selectedSede.id],
    queryFn: async () => {
      const data = await userService.getAllUsersBySede(selectedSede.id);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const busiestHour = busiestHourData ?? "—";
  const topRoutineName = topRoutineData ?? "—";
  const topClassName = topClassData ?? "—";

  const stats = {
    totalMembers: users?.length ?? 0,
    newMembersPctLastMonth: 0,
    busiestHour: busiestHour,
    leastBusyHour: "12:00",
  };

  const renderChart = () => {
    switch (activeView) {
      case "members":
        return isLoadingUsers ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ChartArea />
        );
      case "classes":
        return isLoadingTopClass ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ChartBar />
        );
      case "hours":
        return isLoadingBusiestHour ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ChartLine />
        );
      case "routines":
        return isLoadingTopRoutine ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ChartPiee />
        );
      default:
        return null;
    }
  };

  const handleViewChange = (nextView: ViewKey) => {
    if (activeView === nextView) {
      return;
    }

    setActiveView(nextView);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          active={activeView === "members"}
          onClick={() => handleViewChange("members")}
          title="Usuarios"
          value={Intl.NumberFormat("es-AR").format(stats.totalMembers)}
          subtitle={`${
            users?.filter(
              (user) =>
                new Date(user.createdAt) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length
          } usuarios se unieron en los últimos 7 días`}
          isLoading={isLoadingUsers}
        />

        <KpiCard
          active={activeView === "classes"}
          onClick={() => handleViewChange("classes")}
          title="Clases"
          value={topClassName}
          subtitle="Más concurrida (próximas)"
          isLoading={isLoadingTopClass}
        />

        <KpiCard
          active={activeView === "hours"}
          onClick={() => handleViewChange("hours")}
          title="Horarios"
          value={`Pico: ${busiestHour}`}
          subtitle={`(De las proximas clases)`}
          isLoading={isLoadingBusiestHour}
        />

        <KpiCard
          active={activeView === "routines"}
          onClick={() => handleViewChange("routines")}
          title="Rutinas"
          value={topRoutineName}
          subtitle="Con más usuarios"
          isLoading={isLoadingTopRoutine}
        />
      </div>

      {activeView === "routines" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[420px]">
          {renderChart()}
        </div>
      ) : (
        <div className="rounded-2xl border bg-background p-3 shadow-sm h-[420px] overflow-hidden">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {activeView === "members"
                ? "Socios (evolución)"
                : activeView === "classes"
                ? "Clases (asistencia)"
                : "Ocupación por hora"}
            </p>
          </div>
          <div className="h-[calc(100%-2rem)]">{renderChart()}</div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

function KpiCard({
  active,
  onClick,
  title,
  value,
  subtitle,
  isLoading,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  value?: string;
  subtitle?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <KpiCardSkeleton title={title} />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full min-h-[148px] rounded-xl border p-4 text-left transition-all hover:shadow-md ${
        active ? "ring-2 ring-primary shadow-md" : "hover:bg-accent/40"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="mt-1 text-2xl font-semibold leading-tight">
        {value ?? "—"}
      </div>
      {subtitle && (
        <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
      )}
      <div className="mt-2 text-xs opacity-70">Ver detalle →</div>
    </button>
  );
}

function KpiCardSkeleton({ title }: { title: string }) {
  return (
    <div className="w-full min-h-[148px] rounded-xl border p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <Skeleton className="mt-2 h-8 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-5/6" />
      <Skeleton className="mt-4 h-3 w-24" />
    </div>
  );
}
