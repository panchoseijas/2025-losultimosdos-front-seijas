"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  PencilIcon,
  Plus,
  TrashIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "./ui/skeleton";
import toast from "react-hot-toast";
import apiService from "@/services/api.service";
import { useQueryClient } from "@tanstack/react-query";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { useRouter } from "next/navigation";
import MuscleGroupForm from "./forms/muscle-group";
import { MuscleGroup } from "@/types";

interface Option {
  value: string;
  label: string;
}

interface CreatableComboboxProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  createText?: string;
  isLoading?: boolean;
}

export function CreatableCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar opción...",
  emptyText = "No se encontraron opciones.",
  createText = "Crear",
  isLoading = false,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const [searchValue, setSearchValue] = React.useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    React.useState<MuscleGroup | null>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  const onCreate = async (values: { name: string }) => {
    const response = await apiService.post("/admin/muscle-group", values);
    const muscleGroup = response.muscleGroup;
    queryClient.setQueryData(["groups"], (old: MuscleGroup[]) => [
      ...old,
      muscleGroup,
    ]);
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    onValueChange?.(muscleGroup.id.toString());
    router.refresh();
    toast.success("Grupo muscular creado correctamente");
    setSearchValue("");
  };

  const onDelete = async (value: string) => {
    await apiService.delete(`/admin/muscle-group/${value}`);
    queryClient.setQueryData(["groups"], (old: MuscleGroup[]) =>
      old.filter((option) => option.id !== Number(value))
    );
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    onValueChange?.(
      options.find((option) => option.label === "Generico")?.value ?? ""
    );
    toast.success("Grupo muscular eliminado correctamente");
  };

  if (isLoading) {
    return <Skeleton className="w-full h-10" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o crear..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue && (
                <Button
                  size="sm"
                  onClick={() => onCreate({ name: searchValue })}
                  className=""
                >
                  <Plus className="h-4 w-4" />
                  Crear "{searchValue}"
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <ContextMenu key={option.value}>
                  <ContextMenuTrigger asChild>
                    <CommandItem
                      value={option.value.toString()}
                      onSelect={(currentValue) => {
                        onValueChange?.(
                          currentValue === value ? "" : currentValue
                        );
                        setOpen(false);
                        setSearchValue("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value.toString()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  </ContextMenuTrigger>
                  {option.label !== "Generico" && (
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => onDelete(option.value)}>
                        <TrashIcon className="h-4 w-4" />
                        Eliminar
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          setSelectedMuscleGroup({
                            id: Number(option.value),
                            name: option.label,
                          })
                        }
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </ContextMenuItem>
                    </ContextMenuContent>
                  )}
                </ContextMenu>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {selectedMuscleGroup && (
        <MuscleGroupForm
          values={selectedMuscleGroup || { id: 0, name: "" }}
          openModal={selectedMuscleGroup !== null}
          setOpenModal={(open) =>
            setSelectedMuscleGroup(open ? selectedMuscleGroup : null)
          }
        />
      )}
    </Popover>
  );
}
