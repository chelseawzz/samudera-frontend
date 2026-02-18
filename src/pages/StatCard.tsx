import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
  loading?: boolean; 
  subtitle?: string; 
}

export function StatCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  color, 
  onClick, 
  loading = false,
  subtitle 
}: StatCardProps) {
  // Skeleton untuk loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className={`bg-white rounded-xl shadow-lg p-6 border-t-4 ${color} animate-pulse`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gray-200`}></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="flex items-end gap-2">
            <div className="h-9 bg-gray-200 rounded w-24"></div>
            <div className="h-5 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Normal state
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-shadow hover:shadow-xl border-t-4 ${color}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
        {subtitle && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
            {subtitle}
          </span>
        )}
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      
      <div className="flex items-end gap-2 mt-1">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {unit && <p className="text-gray-500 text-sm mb-0.5">{unit}</p>}
      </div>
    </motion.div>
  );
}