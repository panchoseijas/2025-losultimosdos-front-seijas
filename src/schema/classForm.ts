// "@/schemas/class-form-schema.ts" (el que me pasaste)

import z from "zod";

export const classFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(10, "La descripcion debe tener al menos 10 caracteres"),
  date: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "La fecha tiene que ser hoy o en el futuro"),
  time: z.string(),
  capacity: z
    .number()
    .min(1, "La capacidad debe ser al menos 1")
    .max(50, "La capacidad no puede ser mayor a 50"),
  isBoostedForPoints: z.boolean().optional().default(false),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;
export type ClassFormSchema = typeof classFormSchema;
