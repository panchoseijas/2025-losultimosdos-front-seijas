import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import userService from "@/services/user.service";

export const useUser = (userId: string) => {
  const { isLoaded } = useAuth();

  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const data = await userService.getUser(userId);
      return data;
    },
    enabled: isLoaded && !!userId,
  });
};
