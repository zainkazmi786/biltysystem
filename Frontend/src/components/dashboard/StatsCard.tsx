import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  description?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  description 
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-border shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary group-hover:text-primary-hover transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-foreground mb-2 transition-all duration-300 group-hover:translate-x-1">{value}</div>
        <div className="flex items-center justify-between">
          {change && (
            <p className={`text-xs font-medium ${getChangeColor()} flex items-center`}>
              {changeType === 'positive' && <span className="mr-1">↑</span>}
              {changeType === 'negative' && <span className="mr-1">↓</span>}
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}