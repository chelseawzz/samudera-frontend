// MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import type { LucideIcon } from 'lucide-react';


interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit: string;
  color: string;
  onClick: () => void;
  isActive?: boolean;
}

export function MetricCard({ icon: Icon, title, value, unit, color, onClick, isActive }: MetricCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer transition-all hover:scale-[1.02] ${
        isActive ? `border-2 border-${color}-500 shadow-lg` : 'hover:border-gray-300'
      }`}
    >
      <CardHeader className="pb-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-2xl font-bold text-${color}-700`}>{value}</span>
          <span className={`text-xs text-${color}-600`}>{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}