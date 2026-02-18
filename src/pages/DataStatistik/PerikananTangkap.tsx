import { useState, useEffect } from 'react';
import {
  Users,
  Ship,
  Scale,
  Building,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Download,
  BarChart3,
  TableIcon,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Shrimp,
  FishIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import type { DataStatistikBaseProps, SelectedYearType } from './types';
import { COLORS } from './types';
import { formatCurrency, formatNumber, formatTon } from './formatters';
import { MetricCard } from './MetricCard';

function isAllOrNone(year: any): year is 'all' | null {
  return year === 'all' || year === null;
}

interface TangkapData {
  ringkasan: any[];
  matrix: { rows: any[] };
  volume_bulanan: any[];
  nilai_bulanan: any[];
  komoditas: any[];
}

interface YearlySummary {
  tahun: number;
  nelayan_total: number;
  nelayan_laut: number;
  nelayan_pud: number;
  armada_total: number;
  armada_laut: number;
  armada_pud: number;
  alat_tangkap_total: number;
  alat_tangkap_laut: number;
  alat_tangkap_pud: number;
  rtp_pp_total: number;
  rtp_pp_laut: number;
  rtp_pp_pud: number;
  volume_total: number;
  nilai_total: number;
  growth_nelayan: number;
  growth_armada: number;
  growth_alat: number;
  growth_rtp: number;
  growth_volume: number;
  growth_nilai: number;
}

type ActiveCard =
  | 'nelayan'
  | 'armada'
  | 'alat_tangkap'
  | 'rtp_pp'
  | 'volume'
  | 'nilai'
  | null;

export function PerikananTangkap({
  bidang,
  title,
  icon,
  color,
  selectedYear,
  onYearChange,
  onNavigate,
}: DataStatistikBaseProps) {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [data, setData] = useState<TangkapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'table'>('summary');
  const [allYearsData, setAllYearsData] = useState<YearlySummary[] | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (activeCard) {
      setActiveView('summary');
    }
  }, [activeCard]);

  const monthlyVolume = data?.volume_bulanan
    ? [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ].map((bulan) => {
        const total = data.volume_bulanan.reduce(
          (sum, row) => sum + (row[bulan] || 0),
          0
        );
        return { month: bulan.substring(0, 3), volume: total };
      })
    : [];

  const monthlyNilai = data?.nilai_bulanan
    ? [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ].map((bulan) => {
        const total = data.nilai_bulanan.reduce(
          (sum, row) => sum + (row[bulan] || 0),
          0
        );
        return { month: bulan.substring(0, 3), nilai: total };
      })
    : [];

  const wilayahTop5 = data?.matrix?.rows
    ? data.matrix.rows
        .map((row) => {
          const total = Object.entries(row)
            .filter(([key]) => key !== 'Wilayah')
            .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);
          return {
            name: row.Wilayah,
            value: total,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : [];

  const komoditasTop5 = data?.komoditas
    ? data.komoditas
        .filter((k: any) => k.is_sub === 0)
        .map((k: any) => {
          const volStr = k.volume?.toString().trim() || '0';
          const volume = parseFloat(volStr.replace(/,/g, '')) || 0;
          return {
            komoditas: k.komoditas,
            volume,
          };
        })
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5)
    : [];

  const kpiData = data?.ringkasan?.find(
    (r: any) => r['CABANG USAHA'] === 'JUMLAH - Total'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isAllOrNone(selectedYear)) {
          const response = await fetch(
            'http://localhost/samudata/api/tangkap_fetch_all.php',
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
          const res = await fetch(
            `http://localhost/samudata/api/tangkap_fetch.php?tahun=${selectedYear}`,
            { credentials: 'include' }
          );
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const json = await res.json();
          if (
            !json?.ringkasan ||
            json.ringkasan.length === 0 ||
            !json.matrix?.rows ||
            json.matrix.rows.length === 0
          ) {
            setData(null);
            setLoading(false);
            return;
          }
          setData(json);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching Perikanan Tangkap data:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const handleExportExcel = (
    dataToExport: any[],
    fileName: string,
    headers: string[]
  ) => {
    import('xlsx').then((xlsx) => {
      const ws = xlsx.utils.aoa_to_sheet([
        headers,
        ...dataToExport.map((row) => Object.values(row)),
      ]);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Data');
      xlsx.writeFile(wb, `${fileName}_${selectedYear}.xlsx`);
    });
  };

  if (isAllOrNone(selectedYear)) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold mb-1">Ringkasan Perikanan Tangkap</h1>
          <p className="text-blue-100 opacity-90">
            Perbandingan Data Tahun {availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
            {availableYears.length > 0 ? availableYears[0] : ''}
          </p>
        </div>
        <div className="p-6">
          
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tabel Statistik Perbandingan Tahun</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tahun</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Nelayan (Orang)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Armada (Unit)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Alat Tangkap (Unit)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Volume Produksi (Ton)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Nilai Produksi (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allYearsData?.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.tahun}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.nelayan_total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.armada_total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.alat_tangkap_total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium text-blue-800">{formatTon(item.volume_total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium text-red-700">{formatCurrency(item.nilai_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              Trend Volume Produksi ({availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
              {availableYears.length > 0 ? availableYears[0] : ''})
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
                    dataKey="volume_total"
                    name="Volume Produksi"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
              Trend Nilai Produksi ({availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
              {availableYears.length > 0 ? availableYears[0] : ''})
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
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Nilai Produksi']}
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
                    dataKey="nilai_total"
                    name="Nilai Produksi"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                    dataKey="volume_total"
                    name="Volume Produksi"
                    fill="#3b82f6"
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-16 bg-gray-50 min-h-[500px]">
        <div className="text-center bg-white px-8 py-6 rounded-xl shadow-md border border-gray-200">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-800">Memuat data {selectedYear}...</p>
          <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-red-100 p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl font-bold">!</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Muat Ulang Halaman
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FishIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Data Perikanan Tangkap - {selectedYear}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Data statistik untuk tahun <span className="font-semibold">{selectedYear}</span> belum tersedia.
          </p>
          <div className="bg-blue-50 text-blue-800 rounded-lg p-4 text-sm">
            <p className="font-medium">Informasi:</p>
            <p>Data akan ditampilkan setelah proses input data selesai dilakukan oleh administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {!activeCard && kpiData && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <div
              className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setActiveCard('nelayan')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Users className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Nelayan</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(kpiData['Nelayan (Orang)'])}
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
              onClick={() => setActiveCard('armada')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <Ship className="w-5 h-5 text-green-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Armada Perikanan</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(kpiData['Armada Perikanan (Buah)'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Unit
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setActiveCard('alat_tangkap')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <Scale className="w-5 h-5 text-yellow-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Alat Tangkap</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(kpiData['Alat Tangkap (Unit)'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Unit
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setActiveCard('rtp_pp')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <Building className="w-5 h-5 text-orange-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">RTP/PP</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(kpiData['RTP/PP (Orang/Unit)'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Orang/Unit
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
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-purple-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Volume Produksi</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatTon(kpiData['Volume (Ton)'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Ton
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setActiveCard('nilai')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                      <DollarSign className="w-5 h-5 text-red-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Nilai Produksi</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatCurrency(kpiData['Nilai (Rp 1.000)'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Rupiah
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Ship className="w-5 h-5 text-blue-600 mr-2" />
                  Distribusi Wilayah (Top 5)
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Berdasarkan Volume Produksi
                </span>
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wilayahTop5}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
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
                      formatter={(value: number) => [formatTon(value), 'Volume Produksi']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value: string) => (
                        <span className="text-xs font-medium text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Fish className="w-5 h-5 text-blue-600 mr-2" />
                  Top 5 Komoditas Utama
                </h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Volume Produksi Tertinggi
                </span>
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={komoditasTop5}
                    layout="vertical"
                    margin={{ left: 130, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      dataKey="komoditas"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatTon(value), 'Volume Produksi']}
                      labelFormatter={(label) => `Komoditas: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar
                      dataKey="volume"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCard === 'nelayan' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-5 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Detail Nelayan</h1>
            <span className="mt-2 md:mt-0 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              Tahun {selectedYear}
            </span>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'summary'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'table'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>

          {activeView === 'summary' && data.matrix?.rows && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Total Nelayan Laut</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Nelayan Laut'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">Orang</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Total Nelayan PUD</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Nelayan PUD'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-green-700 mt-1">Orang</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Top 5 Wilayah Nelayan</h2>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Total Nelayan (Laut + PUD)
                  </span>
                </div>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        data.matrix.rows
                          .map((row) => ({
                            Wilayah: row.Wilayah,
                            Total: (row['Nelayan Laut'] || 0) + (row['Nelayan PUD'] || 0),
                          }))
                          .sort((a, b) => b.Total - a.Total)
                          .slice(0, 5)
                      }
                      layout="vertical"
                      margin={{ left: 120, right: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatNumber}
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        dataKey="Wilayah"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatNumber(value), 'Total Nelayan']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Bar
                        dataKey="Total"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'table' && data.matrix?.rows && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Tabel Statistik Nelayan</h2>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.matrix.rows.map((row) => ({
                        Wilayah: row.Wilayah,
                        Laut: row['Nelayan Laut'],
                        'Perairan Umum Darat': row['Nelayan PUD'],
                      })),
                      'Nelayan',
                      ['Wilayah', 'Laut', 'Perairan Umum Darat']
                    )
                  }
                  className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Wilayah</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Laut</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Perairan Umum Darat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.matrix.rows
                      .sort(
                        (a, b) =>
                          (b['Nelayan Laut'] || 0) +
                          (b['Nelayan PUD'] || 0) -
                          ((a['Nelayan Laut'] || 0) + (a['Nelayan PUD'] || 0))
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.Wilayah}</td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['Nelayan Laut'] || 0)}
                          </td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['Nelayan PUD'] || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-blue-50 font-bold border-t border-gray-200">
                    <tr>
                      <td className="px-5 py-4 text-sm">TOTAL</td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Nelayan Laut'] || 0), 0)
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Nelayan PUD'] || 0), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCard === 'armada' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-5 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Detail Armada Perikanan</h1>
            <span className="mt-2 md:mt-0 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              Tahun {selectedYear}
            </span>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'summary'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ringkasan
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'table'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>

          {activeView === 'summary' && data.matrix?.rows && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Ship className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">Total Armada Laut</p>
                      <p className="text-3xl font-bold text-green-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Armada Laut'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-green-700 mt-1">Unit</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Ship className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">Total Armada PUD</p>
                      <p className="text-3xl font-bold text-green-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Armada PUD'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-green-700 mt-1">Unit</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Top 5 Wilayah Armada</h2>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Total Armada (Laut + PUD)
                  </span>
                </div>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        data.matrix.rows
                          .map((row) => ({
                            Wilayah: row.Wilayah,
                            Total: (row['Armada Laut'] || 0) + (row['Armada PUD'] || 0),
                          }))
                          .sort((a, b) => b.Total - a.Total)
                          .slice(0, 5)
                      }
                      layout="vertical"
                      margin={{ left: 120, right: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatNumber}
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        dataKey="Wilayah"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatNumber(value), 'Total Armada']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Bar
                        dataKey="Total"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'table' && data.matrix?.rows && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Tabel Statistik Armada</h2>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.matrix.rows.map((row) => ({
                        Wilayah: row.Wilayah,
                        Laut: row['Armada Laut'],
                        'Perairan Umum Darat': row['Armada PUD'],
                      })),
                      'Armada',
                      ['Wilayah', 'Laut', 'Perairan Umum Darat']
                    )
                  }
                  className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Wilayah</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Laut</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Perairan Umum Darat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.matrix.rows
                      .sort(
                        (a, b) =>
                          (b['Armada Laut'] || 0) +
                          (b['Armada PUD'] || 0) -
                          ((a['Armada Laut'] || 0) + (a['Armada PUD'] || 0))
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.Wilayah}</td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['Armada Laut'] || 0)}
                          </td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['Armada PUD'] || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-green-50 font-bold border-t border-gray-200">
                    <tr>
                      <td className="px-5 py-4 text-sm">TOTAL</td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Armada Laut'] || 0), 0)
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Armada PUD'] || 0), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCard === 'alat_tangkap' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-5 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Detail Alat Tangkap</h1>
            <span className="mt-2 md:mt-0 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              Tahun {selectedYear}
            </span>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'summary'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ringkasan
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'table'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>

          {activeView === 'summary' && data.matrix?.rows && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-yellow-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Scale className="w-6 h-6 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Total Alat Tangkap Laut</p>
                      <p className="text-3xl font-bold text-yellow-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Alat Laut'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">Unit</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-yellow-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Scale className="w-6 h-6 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Total Alat Tangkap PUD</p>
                      <p className="text-3xl font-bold text-yellow-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Alat PUD'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">Unit</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Top 5 Wilayah Alat Tangkap</h2>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Total Alat Tangkap (Laut + PUD)
                  </span>
                </div>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        data.matrix.rows
                          .map((row) => ({
                            Wilayah: row.Wilayah,
                            Total: (row['Alat Laut'] || 0) + (row['Alat PUD'] || 0),
                          }))
                          .sort((a, b) => b.Total - a.Total)
                          .slice(0, 5)
                      }
                      layout="vertical"
                      margin={{ left: 120, right: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatNumber}
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        dataKey="Wilayah"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatNumber(value), 'Total Alat Tangkap']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Bar
                        dataKey="Total"
                        fill="#f59e0b"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'table' && data.matrix?.rows && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Tabel Statistik Alat Tangkap</h2>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.matrix.rows.map((row) => ({
                        Wilayah: row.Wilayah,
                        Laut: row['Alat Laut'],
                        'Perairan Umum Darat': row['Alat PUD'],
                      })),
                      'Alat_Tangkap',
                      ['Wilayah', 'Laut', 'Perairan Umum Darat']
                    )
                  }
                  className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Wilayah</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Laut</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Perairan Umum Darat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.matrix.rows
                      .sort(
                        (a, b) =>
                          (b['Alat Laut'] || 0) +
                          (b['Alat PUD'] || 0) -
                          ((a['Alat Laut'] || 0) + (a['Alat PUD'] || 0))
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.Wilayah}</td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['Alat Laut'] || 0)}
                          </td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['Alat PUD'] || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-yellow-50 font-bold border-t border-gray-200">
                    <tr>
                      <td className="px-5 py-4 text-sm">TOTAL</td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Alat Laut'] || 0), 0)
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['Alat PUD'] || 0), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCard === 'rtp_pp' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-5 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Detail RTP/PP</h1>
            <span className="mt-2 md:mt-0 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              Tahun {selectedYear}
            </span>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'summary'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ringkasan
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'table'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>

          {activeView === 'summary' && data.matrix?.rows && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Building className="w-6 h-6 text-orange-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">Total RTP/PP Laut</p>
                      <p className="text-3xl font-bold text-orange-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['RTP Laut'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">Orang/Unit</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <Building className="w-6 h-6 text-orange-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">Total RTP/PP PUD</p>
                      <p className="text-3xl font-bold text-orange-900">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['RTP PUD'] || 0), 0)
                        )}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">Orang/Unit</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Top 5 Wilayah RTP/PP</h2>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    Total RTP/PP (Laut + PUD)
                  </span>
                </div>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        data.matrix.rows
                          .map((row) => ({
                            Wilayah: row.Wilayah,
                            Total: (row['RTP Laut'] || 0) + (row['RTP PUD'] || 0),
                          }))
                          .sort((a, b) => b.Total - a.Total)
                          .slice(0, 5)
                      }
                      layout="vertical"
                      margin={{ left: 120, right: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatNumber}
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        dataKey="Wilayah"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatNumber(value), 'Total RTP/PP']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Bar
                        dataKey="Total"
                        fill="#f97316"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'table' && data.matrix?.rows && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Tabel Statistik RTP/PP</h2>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.matrix.rows.map((row) => ({
                        Wilayah: row.Wilayah,
                        Laut: row['RTP Laut'],
                        'Perairan Umum Darat': row['RTP PUD'],
                      })),
                      'RTP_PP',
                      ['Wilayah', 'Laut', 'Perairan Umum Darat']
                    )
                  }
                  className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Wilayah</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Laut</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Perairan Umum Darat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.matrix.rows
                      .sort(
                        (a, b) =>
                          (b['RTP Laut'] || 0) +
                          (b['RTP PUD'] || 0) -
                          ((a['RTP Laut'] || 0) + (a['RTP PUD'] || 0))
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.Wilayah}</td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['RTP Laut'] || 0)}
                          </td>
                          <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                            {formatNumber(row['RTP PUD'] || 0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-orange-50 font-bold border-t border-gray-200">
                    <tr>
                      <td className="px-5 py-4 text-sm">TOTAL</td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['RTP Laut'] || 0), 0)
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(
                          data.matrix.rows.reduce((sum, row) => sum + (row['RTP PUD'] || 0), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCard === 'volume' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-5 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Detail Volume Produksi</h1>
            <span className="mt-2 md:mt-0 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              Tahun {selectedYear}
            </span>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'summary'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ringkasan
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'table'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>

          {activeView === 'summary' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800 mb-1">Total Volume Laut</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {formatTon(monthlyVolume.reduce((sum, row) => sum + (row.volume || 0), 0))}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">Ton</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <PieChart className="w-5 h-5 text-gray-500 mr-2" />
                    Distribusi Wilayah
                  </h3>
                  <div style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wilayahTop5}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {wilayahTop5.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [formatTon(value), 'Volume (Ton)']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Volume Produksi Bulanan</h2>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Tahun {selectedYear}
                  </span>
                </div>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyVolume} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatNumber(value), 'Volume (Ton)']}
                        labelFormatter={(label) => `Bulan: ${label}`}
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
                        dataKey="volume"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Volume (Ton)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'table' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Tabel Statistik Volume</h2>
                <button
                  onClick={() =>
                    handleExportExcel(
                      monthlyVolume.map((row) => ({
                        Bulan: row.month,
                        'Volume (Ton)': row.volume,
                      })),
                      'Volume_Produksi',
                      ['Bulan', 'Volume (Ton)']
                    )
                  }
                  className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Bulan</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Volume (Ton)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthlyVolume.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                        <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                          {formatNumber(row.volume)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-purple-50 font-bold border-t border-gray-200">
                    <tr>
                      <td className="px-5 py-4 text-sm">TOTAL</td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatNumber(monthlyVolume.reduce((sum, row) => sum + row.volume, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCard === 'nilai' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-5 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Detail Nilai Produksi</h1>
            <span className="mt-2 md:mt-0 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              Tahun {selectedYear}
            </span>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'summary'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ringkasan
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-5 py-3 font-medium flex items-center transition-colors ${
                  activeView === 'table'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>

          {activeView === 'summary' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-lg mr-4 flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-red-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">Total Nilai Laut</p>
                      <p className="text-3xl font-bold text-red-900">
                        {formatCurrency(monthlyNilai.reduce((sum, row) => sum + (row.nilai || 0), 0))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 text-gray-500 mr-2" />
                    Top 5 Komoditas
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {komoditasTop5.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm font-medium text-gray-700">{item.komoditas}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatTon(item.volume)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Nilai Produksi Bulanan</h2>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Tahun {selectedYear}
                  </span>
                </div>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyNilai} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(1)}B`}
                        tick={{ fontSize: 10 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Nilai Produksi']}
                        labelFormatter={(label) => `Bulan: ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="nilai"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={35}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'table' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Tabel Statistik Nilai</h2>
                <button
                  onClick={() =>
                    handleExportExcel(
                      monthlyNilai.map((row) => ({
                        Bulan: row.month,
                        'Nilai Produksi (Rp)': row.nilai,
                      })),
                      'Nilai_Produksi',
                      ['Bulan', 'Nilai Produksi (Rp)']
                    )
                  }
                  className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Bulan</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Nilai Produksi (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthlyNilai.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                        <td className="px-5 py-4 text-sm text-right text-gray-900 font-medium">
                          {formatCurrency(row.nilai)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-red-50 font-bold border-t border-gray-200">
                    <tr>
                      <td className="px-5 py-4 text-sm">TOTAL</td>
                      <td className="px-5 py-4 text-sm text-right">
                        {formatCurrency(monthlyNilai.reduce((sum, row) => sum + row.nilai, 0))}
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

function Fish({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8.25v3.75m0 0v3.75m0-3.75h3.75M12 12h-3.75m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}