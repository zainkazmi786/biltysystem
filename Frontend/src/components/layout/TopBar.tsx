import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ur';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
        <SidebarTrigger className="text-gray-600 hover:bg-gray-100" />
      </div>

      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
        {/* Language Switcher */}
        <LanguageSwitcher variant="compact" />

        {/* User Profile (clickable, navigates to /profile) */}
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} text-gray-700 hover:bg-gray-100`}
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900">
              {user?.name || 'Admin User'}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email || 'admin@cargo.com'}
            </div>
          </div>
        </Button>
      </div>
    </header>
  );
}
