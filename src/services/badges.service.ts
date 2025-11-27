// src/services/badge.service.ts
import apiService from "./api.service";
import { UserBadgeStatus } from "@/types";

class BadgeService {
  async getUserBadges(): Promise<UserBadgeStatus[]> {
    const data = await apiService.get("/user/badges");
    return (data.items ?? []) as UserBadgeStatus[];
  }

  async evaluateBadges(): Promise<UserBadgeStatus[]> {
    const data = await apiService.post("/user/badges/evaluate", {});
    return (data.items ?? []) as UserBadgeStatus[];
  }
}

export default new BadgeService();
