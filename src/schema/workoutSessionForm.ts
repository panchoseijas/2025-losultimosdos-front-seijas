import z from "zod";

const setEntrySchema = z.object({
  weight: z
    .string()
    .refine(
      (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0),
      "El peso debe ser 0 o mayor",
    ),
  reps: z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 1 && Number.isInteger(Number(v))),
      "Las reps deben ser un entero >= 1",
    ),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.number(),
  sets: z.array(setEntrySchema).min(1, "Debe haber al menos una serie"),
  comment: z.string().optional(),
});

export const workoutSessionFormSchema = z.object({
  notes: z.string().optional(),
  exercises: z.array(exerciseEntrySchema),
});

export type WorkoutSessionFormValues = z.infer<typeof workoutSessionFormSchema>;
