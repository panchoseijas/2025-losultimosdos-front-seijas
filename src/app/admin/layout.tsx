import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Toaster } from "react-hot-toast";
import { redirect } from "next/navigation";
import { SedesSwitcher } from "@/components/sedes-switcher";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, redirectToSignIn, userId } = await auth();
  const user = await currentUser();

  if (!isAuthenticated) return redirectToSignIn();

  if (user?.publicMetadata.role !== "admin") return redirect("/");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex flex-col shrink-0 transition-[width,height] ease-linear">
          <div className="flex h-16 items-center gap-2 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1 " />
              <Badge className="border-transparent bg-gradient-to-r from-indigo-500 to-pink-500 [background-size:105%] bg-center text-white text-base">
                Admin
              </Badge>
              <div className="ml-4">
                <PageBreadcrumb />
              </div>
            </div>
            <div className="flex items-center gap-2 px-4">
              <SedesSwitcher isAdmin={true} />
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="container mx-auto space-y-4 p-4">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
