import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ur';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={`min-h-screen flex w-full ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <AppSidebar />
        <SidebarInset className="flex-1 bg-white">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto bg-white">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}