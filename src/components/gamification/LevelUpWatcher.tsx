"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMyGamification } from "@/hooks/use-my-gamification";
import { getLevelForPoints, LevelConfig } from "@/lib/levels";
import { LevelUpModal } from "@/components/gamification/levelUpModal";
import gamificationService from "@/services/gamification.service";

export function LevelUpWatcher() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { totalPoints } = useMyGamification();

  const [open, setOpen] = useState(false);
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);

  const { level } = getLevelForPoints(totalPoints);

  const { data: levelStatus } = useQuery({
    queryKey: ["levelStatus", userId],
    queryFn: () => gamificationService.getLevelStatus(),
    enabled: !!userId,
  });

  const { mutate: acknowledge } = useMutation({
    mutationFn: (newLevel: number) =>
      gamificationService.acknowledgeLevelUp(newLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levelStatus", userId] });
    },
  });

  useEffect(() => {
    if (!userId || levelStatus == null) return;

    const currentLevel = level.level;
    const lastAcknowledged = levelStatus.lastAcknowledgedLevel;

    if (currentLevel > 1 && currentLevel > lastAcknowledged) {
      setLevelConfig(level);
      setOpen(true);
    }
  }, [userId, level, levelStatus]);

  if (!userId || !levelConfig) return null;

  return (
    <LevelUpModal
      level={levelConfig}
      open={open}
      onClose={(o) => {
        setOpen(o);
        if (!o) {
          acknowledge(levelConfig.level);
          setLevelConfig(null);
        }
      }}
    />
  );
}
