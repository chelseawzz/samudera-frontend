// src/pages/DataStatistik/types.ts
export interface DashboardProps {
  onNavigate: (page: string, bidang?: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

// ✅ Pastikan baris ini ada dan benar
export type SelectedYearType = number | 'all' | null;

export interface DataStatistikBaseProps {
  bidang: string;
  title: string;
  icon: string;
  color: string;
  selectedYear: SelectedYearType;  
  onYearChange: (year: SelectedYearType) => void;  
  onNavigate: (page: string, bidang?: string) => void;
}

export const COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', 
  '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#6366f1'
];

export const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];