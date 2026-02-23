"use client";

import { useState } from "react";
import { UserGamificationSummary } from "@/components/gamification/user-gamification-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconCalendarEvent,
  IconBarbell,
  IconTargetArrow,
  IconTrophy,
  IconHelpCircle,
} from "@tabler/icons-react";

type PointsEarningMethod = {
  icon: React.ReactNode;
  title: string;
  points: string;
  description: string;
  highlight?: boolean;
};

const POINTS_METHODS: PointsEarningMethod[] = [
  {
    icon: <IconCalendarEvent className="h-5 w-5" />,
    title: "Inscripción a clases",
    points: "+10 pts",
    description:
      "Anotate a cualquier clase disponible y sumá puntos al instante.",
  },
  {
    icon: <IconBarbell className="h-5 w-5" />,
    title: "Asignación de rutinas",
    points: "+15 pts",
    description: "Cuando un entrenador te asigna una rutina personalizada.",
  },
  {
    icon: <IconTargetArrow className="h-5 w-5" />,
    title: "Completar rutinas",
    points: "Variable",
    description:
      "Puntos calculados según los ejercicios completados y el tiempo de la rutina.",
    highlight: true,
  },
  {
    icon: <IconTrophy className="h-5 w-5" />,
    title: "Desafíos especiales",
    points: "Variable",
    description:
      "Completá desafíos diarios y semanales (disponibles desde nivel 3).",
    highlight: true,
  },
];

type LevelInfo = {
  level: number;
  name: string;
  icon: string;
  minPoints: number;
  multiplier: string;
};

const LEVELS_INFO: LevelInfo[] = [
  {
    level: 1,
    name: "Calentando motores",
    icon: "🔥",
    minPoints: 0,
    multiplier: "—",
  },
  {
    level: 2,
    name: "Entrenando en serio",
    icon: "💪",
    minPoints: 20,
    multiplier: "+5% clases boost",
  },
  {
    level: 3,
    name: "Modo atleta",
    icon: "🏆",
    minPoints: 60,
    multiplier: "+10% rutinas",
  },
  {
    level: 4,
    name: "Leyenda del Gym",
    icon: "⚡",
    minPoints: 120,
    multiplier: "+20% todo",
  },
  {
    level: 5,
    name: "Élite GymCloud",
    icon: "👑",
    minPoints: 100000,
    multiplier: "+30% todo",
  },
];

const PointsExplanationModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          aria-label="Abrir información sobre cómo sumar puntos"
        >
          <IconHelpCircle className="h-4 w-4" />
          ¿Cómo sumo puntos?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            ¿Cómo sumo puntos?
          </DialogTitle>
          <DialogDescription>
            Acumulá puntos con tu actividad y subí de nivel para desbloquear
            beneficios exclusivos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Formas de ganar puntos */}
          <section>
            <h3 className="text-sm font-semibold mb-3">
              Formas de ganar puntos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POINTS_METHODS.map((method) => (
                <div
                  key={method.title}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 px-3 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {method.title}
                      </span>
                      <Badge
                        variant={method.highlight ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {method.points}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sistema de niveles */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Sistema de niveles</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                      Nivel
                    </th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                      Puntos mín.
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">
                      Bonus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS_INFO.map((lvl) => (
                    <tr key={lvl.level} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <span className="text-lg">{lvl.icon}</span>
                      </td>
                      <td className="py-2 pr-4 font-medium">{lvl.name}</td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">
                        {lvl.minPoints}
                      </td>
                      <td className="py-2 text-right">
                        <Badge variant="outline" className="text-[10px]">
                          {lvl.multiplier}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tip */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-semibold">💡 Tip:</span> A mayor nivel, más
              puntos ganás por cada actividad gracias a los multiplicadores.
              ¡Seguí entrenando para maximizar tus puntos!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserGamificationPage = () => {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <UserGamificationSummary />
      <div className="flex justify-center">
        <PointsExplanationModal />
      </div>
    </div>
  );
};

export default UserGamificationPage;
