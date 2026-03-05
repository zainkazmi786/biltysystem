import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

export function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  variant = 'default'
}: QuickActionCardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-primary text-white border-primary hover:shadow-glow';
      case 'secondary':
        return 'bg-card-light text-card-light-foreground border-border hover:bg-card-light/80';
      default:
        return 'bg-gradient-card border-border hover:shadow-lg';
    }
  };

  const getIconClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-white bg-white/20';
      case 'secondary':
        return 'text-primary bg-primary/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:scale-105 group ${getCardClasses()}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${getIconClasses()}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className={`text-sm ${variant === 'primary' ? 'text-white/80' : 'text-muted-foreground'}`}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}