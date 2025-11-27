import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import userService from "@/services/user.service";

export const useUsers = () => {
  const { isLoaded } = useAuth();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await userService.getAllUsers();
      return data;
    },
    enabled: isLoaded,
  });
};
