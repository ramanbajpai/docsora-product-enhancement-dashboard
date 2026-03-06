import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

// Routes that should have immersive, full-screen mode (no header)
const immersiveRoutes = [
  "/transfer",
  "/translate", 
  "/ai-check",
  "/compress",
  "/convert",
  "/sign",
  "/tools",
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isImmersive = immersiveRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar - fixed position */}
      <div className="fixed top-0 left-0 h-screen border-r border-border/50 z-40">
        <AppSidebar />
      </div>
      
      {/* Main content area - with left margin to account for fixed sidebar */}
      <main className="flex-1 overflow-auto min-w-0 ml-[240px]">
        {children}
      </main>
    </div>
  );
}
