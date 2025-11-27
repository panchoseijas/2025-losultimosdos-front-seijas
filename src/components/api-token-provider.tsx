"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import apiService from "@/services/api.service";

export const ApiTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getToken } = useAuth();

  useEffect(() => {
    apiService.setTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
};

