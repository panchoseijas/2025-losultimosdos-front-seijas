"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import userService from "@/services/user.service";

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const CLICKABLE_SEGMENTS = ["classes", "exercises", "routines", "users"];
const HIDDEN_SEGMENTS = ["admin", "user"];
const SPANISH_SEGMENT_LABELS: Record<string, string> = {
  admin: "Administracion",
  user: "Usuario",
  users: "Usuarios",
  dashboard: "Panel",
  classes: "Clases",
  exercises: "Ejercicios",
  routines: "Rutinas",
  goals: "Objetivos",
  leaderboard: "Ranking",
  challenges: "Desafios",
  gamification: "Gamificacion",
  badges: "Insignias",
  new: "Nueva",
  edit: "Editar",
  play: "Entrenar",
  medibook: "MediBook",
  "api-key": "Clave API",
  "sign-in": "Iniciar sesion",
  "sign-up": "Registro",
};

const getAdminUserIdFromPath = (pathname: string) => {
  const path = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "admin" && segments[1] === "user" && segments[2]) {
    return segments[2];
  }

  return "";
};

const isAdminUserIdSegment = (segments: string[], index: number) => {
  return segments[0] === "admin" && segments[1] === "user" && index === 2;
};

const getSegmentLabel = (
  segment: string,
  segments: string[],
  index: number,
  adminUserName: string
) => {
  if (isAdminUserIdSegment(segments, index)) {
    return adminUserName || "Usuario";
  }

  const spanishLabel = SPANISH_SEGMENT_LABELS[segment.toLowerCase()];
  if (spanishLabel) {
    return spanishLabel;
  }

  return segment
    .split("-")
    .map(capitalizeFirstLetter)
    .join(" ")
    .replace(/\[|\]/g, "");
};

const generateBreadcrumbs = (pathname: string, adminUserName: string) => {
  // Remove trailing slash
  const path = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  // Split path into segments
  const segments = path.split("/").filter(Boolean);

  // Generate breadcrumb items
  return segments.map((segment, index) => {
    // Build the URL for this segment
    const url = `/${segments.slice(0, index + 1).join("/")}`;

    // Clean up the segment name
    const name = getSegmentLabel(segment, segments, index, adminUserName);

    // Check if this segment should be clickable
    const isClickable =
      CLICKABLE_SEGMENTS.includes(segment.toLowerCase()) &&
      !segment.includes("[");

    return {
      name,
      url,
      isLast: index === segments.length - 1,
      isClickable,
      segment,
    };
  });
};

export function PageBreadcrumb() {
  const pathname = usePathname();
  const adminUserId = useMemo(() => getAdminUserIdFromPath(pathname), [pathname]);

  const { data: adminUser } = useQuery({
    queryKey: ["users", adminUserId],
    enabled: !!adminUserId,
    queryFn: () => userService.getUser(adminUserId),
  });

  const adminUserName = useMemo(() => {
    if (!adminUser) {
      return "";
    }

    const fullName = `${adminUser.firstName ?? ""} ${adminUser.lastName ?? ""}`.trim();
    if (fullName) {
      return fullName;
    }

    return adminUser.email || adminUserId;
  }, [adminUser, adminUserId]);

  const breadcrumbs = useMemo(
    () => generateBreadcrumbs(pathname, adminUserName),
    [pathname, adminUserName]
  );
  const visibleBreadcrumbs = breadcrumbs.filter(
    (breadcrumb) => !HIDDEN_SEGMENTS.includes(breadcrumb.segment.toLowerCase())
  );

  if (visibleBreadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleBreadcrumbs.map((breadcrumb, index) => {
          const isLastVisible = index === visibleBreadcrumbs.length - 1;

          return (
            <BreadcrumbItem key={breadcrumb.url}>
              {isLastVisible || !breadcrumb.isClickable ? (
                <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.url}>{breadcrumb.name}</Link>
                  </BreadcrumbLink>
                </>
              )}
              {!isLastVisible && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
