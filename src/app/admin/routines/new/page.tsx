"use client";

import { RoutineForm } from "@/components/forms/routine";
import RoutineService from "@/services/routine.service";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const CreateRoutine = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const onCreate = async (values: any) => {
    await RoutineService.createRoutine(values, values.exercises);
    queryClient.refetchQueries({ queryKey: ["routines"] });
    toast.success("Rutina creada correctamente");
    router.refresh();
    setIsOpen(false);
  };
  return <RoutineForm onSubmit={onCreate} />;
};

export default CreateRoutine;
