import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  Receipt,
  DollarSign,
  Users,
  Truck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Globe,
  AlertTriangle,
  Truck as TruckIcon,
  Building,
  LogOut

} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const navigationItems = [
  {
    title: { en: "Dashboard", ur: "ڈیش بورڈ" },
    url: "/",
    icon: Home,
  },
  {
    title: { en: "Shipments", ur: "بلٹیاں" },
    url: "/shipments",
    icon: Package,
  },
  {
    title: { en: "Vouchers", ur: "واؤچرز" },
    url: "/vouchers",
    icon: Receipt,
  },
  {
    title: { en: "Staff", ur: "سٹاف" },
    url: "/staff",
    icon: Users,
  },
  {
    title: { en: "Customers", ur: "کسٹمرز" },
    url: "/customers",
    icon: Users,
  },
  {
    title: { en: "Trips", ur: "ٹرپ" },
    url: "/trips",
    icon: Truck,
  },
  {
    title: { en: "Claims", ur: "دعوے" },
    url: "/claims",
    icon: AlertTriangle,
  }, 
  {
    title: { en: "Shop Management", ur: "شاپ مینجمنٹ" },
    url: "/shop-management",
    icon: Building,
  },
  {
    title: { en: "Financial Reports", ur: "مالیاتی رپورٹس" },
    url: "/financial-reports",
    icon: DollarSign,
  },

 
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const currentPath = location.pathname;
  const isRTL = language === 'ur';

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const getNavCls = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";
    
    // Add border based on RTL direction
    const borderClass = isActive 
      ? (isRTL ? "border-r-2 border-sidebar-primary" : "border-l-2 border-sidebar-primary")
      : "";
    
    return `${baseClasses} ${borderClass}`;
  };

  return (
    <Sidebar
      className={`${isRTL ? 'border-l' : 'border-r'} border-sidebar-border bg-sidebar`}
      collapsible="icon"
    >
      <SidebarContent className="p-0">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sidebar-foreground font-semibold text-sm">
                    Cargo Lingo
                  </span>
                  <span className="text-sidebar-foreground/60 text-xs">
                    Logistics Dashboard
                  </span>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <Package className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>

    

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${getNavCls({
                        isActive: isActive(item.url),
                      })}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className={`${isRTL ? 'ml-3' : 'mr-3'} ${language === 'ur' ? 'font-medium' : ''}`}>
                          {item.title[language]}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings at bottom */}
        <div className="mt-auto p-2 border-t border-sidebar-border">
          <SidebarMenuButton asChild>
            <div
              className='flex items-center px-3 py-2 rounded-lg transition-all duration-200 '
              onClick={handleLogout}
              
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className={`${isRTL ? 'ml-3' : 'mr-3'} ${language === 'ur' ? 'font-medium' : ''}`}>
                  {language === 'en' ? 'Logout' : 'Logout'}
                </span>
              )}
           </div>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}