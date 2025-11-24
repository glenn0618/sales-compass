import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full min-w-0">
          <header className="sticky top-0 z-10 border-b bg-card px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
            <SidebarTrigger className="flex-shrink-0" />
            <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">Retail Management System</h1>
          </header>
          <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-background overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
