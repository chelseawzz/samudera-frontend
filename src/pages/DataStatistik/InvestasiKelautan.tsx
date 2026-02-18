// src/pages/DataStatistik/InvestasiKelautan.tsx
import { useState, useEffect } from 'react';
import { BarChart3, Table as TableIcon, Download } from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import type { DataStatistikBaseProps } from './types';
import { COLORS } from './types';
import { formatCurrency, formatNumber, formatTon, formatHa } from '../../pages/DataStatistik/formatters';

export function InvestasiKelautan({
  bidang,
  title,
  icon,
  color,
  selectedYear,
  onYearChange,
  onNavigate
}: DataStatistikBaseProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'tabel'>('summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Ganti dengan API Investasi Kelautan
        setTimeout(() => {
          setData({ placeholder: true });
          setLoading(false);
        }, 500);
      } catch (err: any) {
        console.error('Error fetching Investasi data:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'summary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Summary (Grafik)
          </button>
          <button
            onClick={() => setActiveTab('tabel')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'tabel'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TableIcon className="w-5 h-5" />
            Tabel Statistik
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Investasi Kelautan - Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Halaman ini sedang dalam pengembangan. Data investasi kelautan akan segera tersedia.
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Info:</strong> Fitur ini akan menampilkan data nilai investasi, 
              jumlah proyek, dan sebaran investasi di sektor kelautan dan perikanan Jawa Timur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}