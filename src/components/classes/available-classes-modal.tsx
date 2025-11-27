"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/services/api.service";
import { GymClass, User } from "@/types";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEnrollClass } from "@/hooks/use-class-mutations";

interface AvailableClassesModalProps {
  user: User;
}

const AvailableClassesModal = ({ user }: AvailableClassesModalProps) => {
  const [open, setOpen] = useState(false);
  const { id: userId, sedeId } = user;
  const { data: availableClasses = [], isLoading } = useQuery({
    queryKey: ["classes", sedeId],
    queryFn: async () => {
      const response = await apiService.get(`/classes?sedeId=${sedeId}`);
      return response.classes || [];
    },
    enabled: open,
  });

  const { mutate: assignClass, isPending: isAssigning } =
    useEnrollClass(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Cargando clases...</p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Asignar Clase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Asignar Clase al Usuario</DialogTitle>
          <DialogDescription>
            Selecciona una clase para asignar al usuario
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {availableClasses
              .sort(
                (a: GymClass, b: GymClass) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((gymClass: GymClass) => (
                <div
                  key={gymClass.id}
                  className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {gymClass.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(gymClass.date).toLocaleDateString("es-ES")} -{" "}
                      {gymClass.time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {gymClass.enrolled}/{gymClass.capacity} inscritos
                    </p>
                  </div>
                  {gymClass.users.includes(userId) ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Asignada
                    </p>
                  ) : (
                    <Button
                      onClick={() => assignClass(gymClass)}
                      disabled={
                        isAssigning || gymClass.enrolled >= gymClass.capacity
                      }
                      size="sm"
                    >
                      {gymClass.enrolled >= gymClass.capacity
                        ? "Llena"
                        : "Asignar"}
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvailableClassesModal;
