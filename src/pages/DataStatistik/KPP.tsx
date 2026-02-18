// src/pages/DataStatistik/KPP.tsx
import { useState, useEffect } from 'react';
import {
  LandPlot,
  Users,
  Scale,
  ArrowLeft,
  Download,
  BarChart3,
  Table as TableIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DataStatistikBaseProps } from './types';
import { COLORS } from './types';
import { formatNumber, formatTon } from './formatters';
import { MetricCard } from '../../pages/DataStatistik/MetricCard';

interface KPPData {
  garam: Array<{
    kab_kota: string;
    luas_lahan_ha: number | null;
    jumlah_kelompok: number | null;
    jumlah_petambak: number | null;
    volume_produksi_ton: number | null;
  }>;
}

type ActiveCard = 'luas_lahan' | 'kelompok' | 'petambak' | 'volume' | null;

interface KPPGaramRow {
  kab_kota: string;
  luas_lahan_ha: number;
  jumlah_kelompok: number;
  jumlah_petambak: number;
  volume_produksi_ton: number;
}

interface YearlySummary {
  tahun: number;
  luas_lahan_ha: number;
  jumlah_kelompok: number;
  jumlah_petambak: number;
  volume_produksi_ton: number;
  growth_luas_lahan: number;
  growth_kelompok: number;
  growth_petambak: number;
  growth_volume: number;
}

function isAllOrNone(year: any): year is 'all' | null {
  return year === 'all' || year === null;
}

export function KPP({
  bidang,
  title,
  icon,
  color,
  selectedYear,
  onYearChange,
  onNavigate
}: DataStatistikBaseProps) {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [data, setData] = useState<KPPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'table'>('summary');
  const [allYearsData, setAllYearsData] = useState<YearlySummary[] | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Reset view when switching cards
  useEffect(() => {
    if (activeCard) {
      setActiveView('summary');
    }
  }, [activeCard]);

  // Safely compute derived data with null checks
  const garamData = data?.garam || [];
  const ptGaramData = garamData.find(row => row.kab_kota === 'PT Garam');
  const wilayahData = garamData.filter(row => row.kab_kota !== 'PT Garam');
  const totalLuasLahan = wilayahData.reduce(
    (sum, row) => sum + (parseFloat(row.luas_lahan_ha?.toString() || '0') || 0),
    0
  );
  const totalKelompok = wilayahData.reduce(
    (sum, row) => sum + (row.jumlah_kelompok || 0),
    0
  );
  const totalPetambak = wilayahData.reduce(
    (sum, row) => sum + (row.jumlah_petambak || 0),
    0
  );
  const totalVolume = garamData.reduce(
    (sum, row) => sum + (row.volume_produksi_ton || 0),
    0
  );

  // Top 5 wilayah by volume (exclude PT Garam)
  const wilayahTop5 = wilayahData
    .map((row) => ({
      name: row.kab_kota,
      value: row.volume_produksi_ton || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Top 5 wilayah by luas lahan (exclude PT Garam)
  const wilayahTop5Luas = wilayahData
    .map((row) => ({
      name: row.kab_kota,
      value: parseFloat(row.luas_lahan_ha?.toString() || '0') || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isAllOrNone(selectedYear)) {
          // Fetch all years data for comparison dashboard
          const response = await fetch(
            'http://localhost/samudata/api/kpp_fetch_all.php',
            { credentials: 'include' }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          if (!result.ok) {
            throw new Error(result.message || 'Error dari server');
          }
          setAvailableYears(result.available_years);
          setAllYearsData(result.yearly_data);
          setLoading(false);
        } else {
          // Fetch single year data
          const res = await fetch(
            `http://localhost/samudata/api/kpp_fetch.php?tahun=${selectedYear}`,
            { credentials: 'include' }
          );
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const json = await res.json();
          if (!json?.ok || !json.garam || json.garam.length === 0) {
            setData(null);
            setLoading(false);
            return;
          }
          // Ensure all numeric values are properly parsed
          const parsedData: KPPData = {
            ...json,
            garam: json.garam.map((row: any): KPPGaramRow => ({
              kab_kota: row.kab_kota,
              luas_lahan_ha: parseFloat(row.luas_lahan_ha) || 0,
              jumlah_kelompok: parseInt(row.jumlah_kelompok) || 0,
              jumlah_petambak: parseInt(row.jumlah_petambak) || 0,
              volume_produksi_ton: parseFloat(row.volume_produksi_ton) || 0,
            })),
          };
          setData(parsedData);
        }
      } catch (err: any) {
        console.error('Error fetching KPP Garam ', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const handleExportExcel = (dataToExport: any[], fileName: string, headers: string[]) => {
    import('xlsx').then((xlsx) => {
      const ws = xlsx.utils.aoa_to_sheet([
        headers,
        ...dataToExport.map(row => Object.values(row)),
      ]);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Data");
      xlsx.writeFile(wb, `${fileName}_${selectedYear}.xlsx`);
    });
  };

  // ==================== ALL YEARS COMPARISON VIEW ====================
  if (isAllOrNone(selectedYear)) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold mb-1">Ringkasan KPP Garam</h1>
          <p className="text-blue-100 opacity-90">
            Perbandingan Data Tahun {availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} - {availableYears.length > 0 ? availableYears[0] : ''}
          </p>
        </div>
        <div className="p-6">
          
                  {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tabel Statistik Perbandingan Tahun</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tahun</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Luas Lahan (Ha)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Jumlah Kelompok</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Jumlah Petambak</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Volume Produksi (Ton)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Growth Volume (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allYearsData?.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.tahun}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.luas_lahan_ha)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.jumlah_kelompok)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.jumlah_petambak)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium text-purple-800">{formatTon(item.volume_produksi_ton)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.growth_volume > 0 
                            ? 'bg-green-100 text-green-800' 
                            : item.growth_volume < 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.growth_volume > 0 ? <ArrowUpRight className="w-3 h-3 inline mr-1" /> : item.growth_volume < 0 ? <ArrowDownRight className="w-3 h-3 inline mr-1" /> : ''}
                          {item.growth_volume > 0 ? '+' : ''}{item.growth_volume.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <strong className="text-blue-800">Analisis:</strong> Tabel di atas menunjukkan perkembangan produksi garam dari tahun ke tahun. 
              Growth positif (hijau) menandakan peningkatan produksi, sedangkan growth negatif (merah) menunjukkan penurunan. 
              Perhatikan tren untuk mengidentifikasi pola dan faktor yang mempengaruhi produksi garam di Jawa Timur.
            </p>
          </div>

          {/* Trend Chart: Luas Lahan */}
          <div className="bg-white rounded-xl border border-blue-600 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              Trend Luas Lahan ({availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} - {availableYears.length > 0 ? availableYears[0] : ''})
            </h3>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={allYearsData || []}
                  margin={{ top: 15, right: 20, left: 45, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <YAxis
                    tickFormatter={formatNumber}
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), 'Luas Lahan (Ha)']}
                    labelFormatter={(label) => `Tahun: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="luas_lahan_ha"
                    name="Luas Lahan (Ha)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-gray-600 italic">
              {allYearsData && allYearsData.length > 0 && (() => {
                const first = allYearsData[allYearsData.length - 1];
                const last = allYearsData[0];
                const growth = ((last.luas_lahan_ha - first.luas_lahan_ha) / first.luas_lahan_ha) * 100;
                return growth > 0 
                  ? `📈 Luas lahan mengalami pertumbuhan positif sebesar ${growth.toFixed(1)}% dari tahun ${first.tahun} ke ${last.tahun}.`
                  : `📉 Luas lahan mengalami penurunan sebesar ${Math.abs(growth).toFixed(1)}% dari tahun ${first.tahun} ke ${last.tahun}.`;
              })()}
            </p>
          </div>

          {/* Trend Chart: Volume Produksi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              Trend Volume Produksi ({availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} - {availableYears.length > 0 ? availableYears[0] : ''})
            </h3>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={allYearsData || []}
                  margin={{ top: 15, right: 20, left: 45, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <YAxis
                    tickFormatter={formatTon}
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatTon(value), 'Volume Produksi']}
                    labelFormatter={(label) => `Tahun: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="volume_produksi_ton"
                    name="Volume Produksi (Ton)"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-gray-600 italic">
              {allYearsData && allYearsData.length > 0 && (() => {
                const first = allYearsData[allYearsData.length - 1];
                const last = allYearsData[0];
                const growth = ((last.volume_produksi_ton - first.volume_produksi_ton) / first.volume_produksi_ton) * 100;
                return growth > 0 
                  ? `📈 Volume produksi garam meningkat signifikan sebesar ${growth.toFixed(1)}% dari tahun ${first.tahun} (${formatTon(first.volume_produksi_ton)}) ke ${last.tahun} (${formatTon(last.volume_produksi_ton)}).`
                  : `📉 Volume produksi garam menurun sebesar ${Math.abs(growth).toFixed(1)}% dari tahun ${first.tahun} ke ${last.tahun}.`;
              })()}
            </p>
          </div>

          {/* Bar Chart Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Perbandingan Volume Produksi per Tahun</h3>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={allYearsData || []}
                  margin={{ top: 15, right: 20, left: 20, bottom: 55 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="tahun"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tickFormatter={formatTon}
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatTon(value), 'Volume']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="volume_produksi_ton"
                    name="Volume Produksi"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>


        </div>
      </div>
    );
  }

  // ==================== SINGLE YEAR VIEW ====================
  // Loading state
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Memuat data {selectedYear}...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

// No data state
if (!data) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <Scale className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          KPP Garam - {selectedYear}
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          Data statistik untuk tahun <span className="font-semibold">{selectedYear}</span> belum tersedia.
        </p>
        
        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Informasi:</span>
            <br />
            Data akan ditampilkan setelah proses input data selesai dilakukan oleh administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* OVERVIEW: 4 CARDS - APPEARS IMMEDIATELY */}
      {!activeCard && (
        <div className="p-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div
            className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveCard('luas_lahan')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <LandPlot className="w-5 h-5 text-blue-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Luas Lahan</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatNumber(totalLuasLahan)}
                </p>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Ha
                </p>
              </div>
            </div>
          </div>

          <div
        className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => setActiveCard('kelompok')}
      >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Users className="w-5 h-5 text-blue-700" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Jumlah Kelompok</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      {formatNumber(totalKelompok)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Kelompok
                    </p>
                  </div>
                </div>
              </div>

                <div
              className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setActiveCard('petambak')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Users className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Jumlah Petambak</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(totalPetambak)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Orang
                  </p>
                </div>
              </div>
            </div>

        <div
        className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => setActiveCard('volume')}
      >
            <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Scale className="w-5 h-5 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-700">Volume Produksi</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {formatTon(totalVolume)}
            </p>
            <p className="text-xs text-gray-600 mt-1 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Ton
            </p>
          </div>
        </div>
        </div>
            
          </div>
          {/* Additional Overview Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Distribusi Wilayah (Top 5) berdasarkan Volume Produksi
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={wilayahTop5}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {wilayahTop5.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      formatTon(value),
                      'Volume (Ton)',
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    formatter={(value: string) => (
                      <span className="text-xs text-gray-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Top 5 Wilayah berdasarkan Luas Lahan
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={wilayahTop5Luas}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => formatNumber(value)}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatNumber(value),
                      'Luas Lahan (Ha)',
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    name="Luas Lahan (Ha)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={25}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      {/* DETAIL VIEW: LUAS LAHAN */}
      {activeCard === 'luas_lahan' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Luas Lahan ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          {activeView === 'summary' && data.garam && (
            <div className="space-y-6">
              {/* Total Card */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Luas Lahan Garam</p>
                <p className="text-4xl font-bold text-blue-900">
                  {formatNumber(totalLuasLahan)}
                </p>
                <p className="text-xs text-blue-700 mt-1">Hektar (Ha)</p>
              </div>
              {/* Bar Chart Top 5 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Top 5 Wilayah Luas Lahan Garam
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={wilayahTop5Luas}
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatNumber(value),
                        'Luas Lahan (Ha)',
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3B82F6"
                      name="Luas Lahan (Ha)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeView === 'table' && data.garam && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">
                  Tabel Statistik Luas Lahan
                </h4>
                <button
                  onClick={() => handleExportExcel(
                    data.garam.map(row => ({
                      'Kabupaten/Kota': row.kab_kota,
                      'Luas Lahan (Ha)': row.luas_lahan_ha || 0,
                    })),
                    'Luas_Lahan_Garam',
                    ['Kabupaten/Kota', 'Luas Lahan (Ha)']
                  )}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Kabupaten/Kota
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Luas Lahan (Ha)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.garam
                      .sort((a, b) =>
                        (parseFloat(b.luas_lahan_ha?.toString() || '0') || 0) -
                        (parseFloat(a.luas_lahan_ha?.toString() || '0') || 0)
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {row.kab_kota}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(parseFloat(row.luas_lahan_ha?.toString() || '0') || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-blue-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatNumber(totalLuasLahan)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* DETAIL VIEW: KELOMPOK */}
      {activeCard === 'kelompok' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Kelompok Petambak ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          {activeView === 'summary' && data.garam && (
            <div className="space-y-6">
              {/* Total Card */}
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Kelompok Petambak</p>
                <p className="text-4xl font-bold text-green-900">
                  {formatNumber(totalKelompok)}
                </p>
                <p className="text-xs text-green-700 mt-1">Kelompok</p>
              </div>
              {/* Bar Chart Top 5 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Top 5 Wilayah Jumlah Kelompok
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={
                      data.garam
                        .filter(row => row.jumlah_kelompok && row.jumlah_kelompok > 0)
                        .map(row => ({
                          name: row.kab_kota,
                          value: row.jumlah_kelompok || 0,
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                    }
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatNumber(value),
                        'Jumlah Kelompok',
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#10B981"
                      name="Jumlah Kelompok"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeView === 'table' && data.garam && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">
                  Tabel Statistik Kelompok Petambak
                </h4>
                <button
                  onClick={() => handleExportExcel(
                    data.garam.map(row => ({
                      'Kabupaten/Kota': row.kab_kota,
                      'Jumlah Kelompok': row.jumlah_kelompok || 0,
                      'Jumlah Petambak': row.jumlah_petambak || 0,
                    })),
                    'Kelompok_Petambak',
                    ['Kabupaten/Kota', 'Jumlah Kelompok', 'Jumlah Petambak']
                  )}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Kabupaten/Kota
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Jumlah Kelompok
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Jumlah Petambak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.garam
                      .sort((a, b) =>
                        (b.jumlah_kelompok || 0) - (a.jumlah_kelompok || 0)
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {row.kab_kota}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(row.jumlah_kelompok || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(row.jumlah_petambak || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-green-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatNumber(totalKelompok)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatNumber(totalPetambak)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* DETAIL VIEW: PETAMBAK */}
      {activeCard === 'petambak' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Jumlah Petambak ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          {activeView === 'summary' && data.garam && (
            <div className="space-y-6">
              {/* Total Card */}
              <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Jumlah Petambak</p>
                <p className="text-4xl font-bold text-teal-900">
                  {formatNumber(totalPetambak)}
                </p>
                <p className="text-xs text-teal-700 mt-1">Orang</p>
              </div>
              {/* Bar Chart Top 5 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Top 5 Wilayah Jumlah Petambak
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={
                      data.garam
                        .filter(row => row.jumlah_petambak && row.jumlah_petambak > 0)
                        .map(row => ({
                          name: row.kab_kota,
                          value: row.jumlah_petambak || 0,
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                    }
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatNumber(value),
                        'Jumlah Petambak',
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#0D9488"
                      name="Jumlah Petambak"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeView === 'table' && data.garam && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">
                  Tabel Statistik Jumlah Petambak
                </h4>
                <button
                  onClick={() => handleExportExcel(
                    data.garam.map(row => ({
                      'Kabupaten/Kota': row.kab_kota,
                      'Jumlah Petambak': row.jumlah_petambak || 0,
                    })),
                    'Jumlah_Petambak',
                    ['Kabupaten/Kota', 'Jumlah Petambak']
                  )}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Kabupaten/Kota
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Jumlah Petambak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.garam
                      .sort((a, b) =>
                        (b.jumlah_petambak || 0) - (a.jumlah_petambak || 0)
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {row.kab_kota}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(row.jumlah_petambak || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-teal-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatNumber(totalPetambak)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* DETAIL VIEW: VOLUME */}
      {activeCard === 'volume' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Volume Produksi ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          {activeView === 'summary' && data.garam && (
            <div className="space-y-6">
              {/* Total Card */}
              <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Volume Produksi Garam</p>
                <p className="text-4xl font-bold text-purple-900">
                  {formatTon(totalVolume)}
                </p>
                <p className="text-xs text-purple-700 mt-1">Ton</p>
              </div>
              {/* Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Distribusi Wilayah (Top 5) berdasarkan Volume Produksi
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={wilayahTop5}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {wilayahTop5.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatTon(value),
                        'Volume (Ton)',
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      formatter={(value: string) => (
                        <span className="text-xs text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Bar Chart Top 5 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Top 5 Wilayah Volume Produksi
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={wilayahTop5}
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatTon(value),
                        'Volume (Ton)',
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#8B5CF6"
                      name="Volume (Ton)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeView === 'table' && data.garam && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">
                  Tabel Statistik Volume Produksi
                </h4>
                <button
                  onClick={() => handleExportExcel(
                    data.garam.map(row => ({
                      'Kabupaten/Kota': row.kab_kota,
                      'Volume Produksi (Ton)': row.volume_produksi_ton || 0,
                      'Jumlah Petambak': row.jumlah_petambak || 0,
                    })),
                    'Volume_Produksi_Garam',
                    ['Kabupaten/Kota', 'Volume Produksi (Ton)', 'Jumlah Petambak']
                  )}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Kabupaten/Kota
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Volume Produksi (Ton)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Jumlah Petambak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.garam
                      .sort((a, b) =>
                        (b.volume_produksi_ton || 0) - (a.volume_produksi_ton || 0)
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {row.kab_kota}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatTon(row.volume_produksi_ton || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(row.jumlah_petambak || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-purple-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatTon(totalVolume)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatNumber(totalPetambak)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}