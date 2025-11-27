"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import apiService from "@/services/api.service";
import { GymClass } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AvailableClassesModal from "../classes/available-classes-modal";
import { useUnenrollClass } from "@/hooks/use-class-mutations";
import { User } from "@/types";

interface UserClassesCardProps {
  user: User;
}

const useIsMobile = (query = "(max-width: 640px)") => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    onChange(mql);
    mql.addEventListener?.("change", onChange as any);
    return () => mql.removeEventListener?.("change", onChange as any);
  }, [query]);
  return isMobile;
};

const UserClassesCard = ({ user }: UserClassesCardProps) => {
  const { id: userId, sedeId } = user;
  const isMobile = useIsMobile();
  const [unenrollingClassId, setUnenrollingClassId] = useState<number | null>(
    null
  );
  const { data: userClasses = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["userClasses", user.id],
    queryFn: async () => {
      const response = await apiService.get(
        `/admin/users/${userId}/classes?sedeId=${sedeId}`
      );
      return response.classes || [];
    },
  });

  const { mutate: unenrollClass } = useUnenrollClass(userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clases del Usuario</CardTitle>
        <CardAction>
          <AvailableClassesModal user={user} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoadingClasses ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Cargando clases del usuario...
            </p>
          </div>
        ) : userClasses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay clases registradas para este usuario
          </p>
        ) : isMobile ? (
          <div className="space-y-3">
            {userClasses.map((c: GymClass) => {
              const fecha = c.date
                ? new Date(c.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-";
              return (
                <div
                  key={c.id}
                  className="rounded-lg border p-3 text-sm grid grid-cols-2 gap-2"
                >
                  <div className="text-gray-500 dark:text-gray-400">Clase</div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {c.name}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">Fecha</div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {fecha}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">Hora</div>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {c.time ?? "-"}
                  </div>

                  <div className="col-span-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setUnenrollingClassId(c.id);
                        unenrollClass(c, {
                          onSettled: () => setUnenrollingClassId(null),
                        });
                      }}
                      disabled={unenrollingClassId === c.id}
                    >
                      {unenrollingClassId === c.id
                        ? "Cancelando..."
                        : "Cancelar inscripción"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="border-b dark:border-gray-700">
                <TableRow>
                  <TableHead className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">
                    Clase
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">
                    Fecha
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">
                    Hora
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {userClasses.map((c: GymClass) => (
                  <TableRow
                    key={c.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                      {c.name}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {c.date
                        ? new Date(c.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {c.time ?? "-"}
                    </TableCell>
                    <TableCell className="py-3 px-4 flex justify-center items-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setUnenrollingClassId(c.id);
                          unenrollClass(c, {
                            onSettled: () => setUnenrollingClassId(null),
                          });
                        }}
                        disabled={unenrollingClassId === c.id}
                      >
                        {unenrollingClassId === c.id
                          ? "Cancelando..."
                          : "Cancelar inscripción"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserClassesCard;
