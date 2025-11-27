"use client";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormMessage,
  FormField,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";
import { MuscleGroup } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import apiService from "@/services/api.service";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const muscleGroupFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  id: z.number(),
});

export type MuscleGroupFormValues = z.infer<typeof muscleGroupFormSchema>;

const MuscleGroupForm = ({
  values,
  openModal,
  setOpenModal,
}: {
  values: MuscleGroup;
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const form = useForm<MuscleGroupFormValues>({
    resolver: zodResolver(muscleGroupFormSchema),
    defaultValues: {
      id: values.id,
      name: values.name,
    },
  });

  const { mutate: updateMuscleGroup, isPending } = useMutation({
    mutationFn: async (values: MuscleGroupFormValues) => {
      await apiService.put(`/admin/muscle-group/${values.id}`, values);
    },
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["groups"] });
      const prevGroups = queryClient.getQueryData<MuscleGroup[]>(["groups"]);
      queryClient.setQueryData(["groups"], (old: MuscleGroup[]) =>
        old.map((group) =>
          group.id === values.id ? { ...group, name: values.name } : group
        )
      );
      toast.success("Grupo muscular actualizado correctamente");
      setOpenModal(false);
      return { prevGroups };
    },
    onSuccess: (data, values) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: () => {
      toast.error("Error al actualizar el grupo muscular");
    },
  });

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent aria-describedby="muscle-group-form-description">
        <DialogHeader>
          <DialogTitle>Editar grupo Muscular</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit((data) => {
                updateMuscleGroup(data);
              })(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del grupo muscular</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del grupo muscular" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MuscleGroupForm;
