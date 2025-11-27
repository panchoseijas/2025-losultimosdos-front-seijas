"use client";

import { useState } from "react";
import { ExerciseForm, type ExerciseFormValues } from "../forms/exercise";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import apiService from "@/services/api.service";
import { useRouter } from "next/navigation";

const CreateExercise = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const onCreate = async (values: ExerciseFormValues) => {
    await apiService.post("/admin/exercises", {
      name: values.name,
      videoUrl: values.videoUrl || null,
      muscleGroupId: values.muscleGroupId,
      equipment: values.equipment || null,
    });

    router.refresh();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Crear Ejercicio
      </Button>

      <SheetContent className="w-[90%] sm:w-[540px]" side="right">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            Crear Ejercicio
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <ExerciseForm onSubmit={onCreate} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateExercise;
