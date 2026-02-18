import { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  FlaskConical,
  TrendingUp,
  DollarSign,
  Leaf,
  ArrowLeft,
  Download,
  BarChart3,
  TableIcon,
  Shrimp,
} from 'lucide-react';
import {
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
  LineChart,
  Line,
} from 'recharts';
import type { DataStatistikBaseProps } from './types';
import { COLORS } from './types';
import { formatCurrency, formatNumber, formatTon, formatHa } from '../../pages/DataStatistik/formatters';

// ✅ Type guard function untuk memeriksa apakah selectedYear adalah 'all' atau null
function isAllOrNone(year: any): year is 'all' | null {
  return year === 'all' || year === null;
}

// ========================================
// INTERFACES - UPDATED FOR SELECT ALL
// ========================================
interface RingkasanItem {
  uraian: string;
  nilai: string;
  satuan: string;
}
interface MatrixRow {
  Wilayah: string;
  Volume_Laut: number;
  Volume_Tambak: number;
  Volume_Kolam: number;
  Volume_MinaPadi: number;
  Volume_Karamba: number;
  Volume_JaringApung: number;
  Volume_IkanHias: number;
  Volume_Pembenihan: number;
  Nilai_Laut: number;
  Nilai_Tambak: number;
  Nilai_Kolam: number;
  Nilai_MinaPadi: number;
  Nilai_Karamba: number;
  Nilai_JaringApung: number;
  Nilai_IkanHias: number;
  Nilai_Pembenihan: number;
}
interface PembudidayaItem {
  kab_kota: string;
  subsektor: string;
  peran: string;
  jumlah: string;
}
interface PembenihanItem {
  jenis_air: string;
  bbi: number;
  upr: number;
  hsrt: number;
  swasta: number;
  pembibit_rula: number;
}
interface KomoditasItem {
  no: number | null;
  komoditas: string;
  volume: string;
  is_sub: number;
  is_note: number;
  tahun?: number;
  kab_kota?: string;
}
interface KomoditasBudidayaItem {
  no: number;
  komoditas: string;
  laut_volume: number;
  laut_nilai: number;
  tambak_volume: number;
  tambak_nilai: number;
  kolam_volume: number;
  kolam_nilai: number;
  mina_padi_volume: number;
  mina_padi_nilai: number;
  karamba_volume: number;
  karamba_nilai: number;
  japung_volume: number;
  japung_nilai: number;
}
interface KomoditasByBudidaya {
  komoditas: string;
  volume: number;
  nilai: number;
}
interface BulananItem {
  komponen: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  agu: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
}
interface KomponenItem {
  komponen: string;
  luas?: number;
  jumlah?: number;
}
interface IkanHiasItem {
  kabupaten_kota: string;
  total_volume: number;
  total_value: number;
  arwana: number;
  koi: number;
  grasscarp: number;
  mas: number;
  mas_koki: number;
  mutiara: number;
  akara: number;
  barbir: number;
  gapi: number;
  cupang: number;
  lalia: number;
  manvis: number;
  black_molly: number;
  oskar: number;
  platy: number;
  rainbow: number;
  louhan: number;
  sumatra: number;
  lele_blorok: number;
  komet: number;
  blackghost: number;
  kar_tetra: number;
  marble: number;
  golden: number;
  discus: number;
  zebra: number;
  cawang: number;
  balasak: number;
  red_fin: number;
  lemon: number;
  niasa: number;
  lobster: number;
  silver: number;
  juani: number;
  lainnya: number;
}
interface BudidayaData {
  ringkasan: RingkasanItem[];
  matrix: { rows: MatrixRow[] };
  pembudidaya: PembudidayaItem[];
  pembenihan: PembenihanItem[];
  komoditas: KomoditasItem[];
  komoditas_budidaya: KomoditasBudidayaItem[];
  luas_per_komponen: KomponenItem[];
  pembudidaya_per_komponen: KomponenItem[];
  volume_bulanan: BulananItem[];
  nilai_bulanan: BulananItem[];
  produksi_ikan_hias: IkanHiasItem[];
  nilai_ikan_hias: IkanHiasItem[];
}

// ✅ NEW: Interface untuk data semua tahun (Select All)
interface YearlySummary {
  tahun: number;
  luas_total: number;
  pembudidaya_total: number;
  pembenihan_total: number;
  volume_total: number;
  nilai_total: number;
  growth_luas: number;
  growth_pembudidaya: number;
  growth_pembenihan: number;
  growth_volume: number;
  growth_nilai: number;
}

type ActiveCard =
  | 'luas'
  | 'pembudidaya'
  | 'pembenihan'
  | 'volume'
  | 'nilai'
  | 'komoditas'
  | 'ikan_hias'
  | null;
type ActiveBudidaya =
  | 'Laut'
  | 'Tambak'
  | 'Kolam'
  | 'Mina Padi'
  | 'Karamba'
  | 'Japung'
  | null;

// ========================================
// CUSTOM TICK COMPONENTS
// ========================================
const CustomXAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(-45)"
        style={{ fontSize: '10px' }}
      >
        {payload.value}
      </text>
    </g>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
export function PerikananBudidaya({
  bidang,
  title,
  icon,
  color,
  selectedYear,
  onYearChange,
  onNavigate,
}: DataStatistikBaseProps) {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [activeBudidaya, setActiveBudidaya] = useState<ActiveBudidaya>(null);
  const [data, setData] = useState<BudidayaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'table'>('summary');
  
  // ✅ NEW: State untuk Select All
  const [allYearsData, setAllYearsData] = useState<YearlySummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  useEffect(() => {
    if (activeCard) setActiveView('summary');
  }, [activeCard]);

  // ✅ PERBAIKAN: Exact match untuk uraian yang tepat sesuai Buku Statistik
  const getKpiValue = (exactUraian: string): string => {
    return (
      data?.ringkasan?.find(
        (r) =>
          r.uraian?.toLowerCase().trim() === exactUraian.toLowerCase().trim()
      )?.nilai || '0'
    );
  };

  // ========================================
  // KOMODITAS BUDIDAYA HELPER FUNCTIONS
  // ========================================
  const getKomoditasByBudidaya = (jenis: string): KomoditasByBudidaya[] => {
    if (!data?.komoditas_budidaya) return [];
    const grouped = data.komoditas_budidaya.reduce((acc, item) => {
      if (!acc[item.komoditas]) {
        acc[item.komoditas] = {
          komoditas: item.komoditas,
          volume: 0,
          nilai: 0,
        };
      }
      switch (jenis) {
        case 'Laut':
          acc[item.komoditas].volume += item.laut_volume;
          acc[item.komoditas].nilai += item.laut_nilai;
          break;
        case 'Tambak':
          acc[item.komoditas].volume += item.tambak_volume;
          acc[item.komoditas].nilai += item.tambak_nilai;
          break;
        case 'Kolam':
          acc[item.komoditas].volume += item.kolam_volume;
          acc[item.komoditas].nilai += item.kolam_nilai;
          break;
        case 'Mina Padi':
          acc[item.komoditas].volume += item.mina_padi_volume;
          acc[item.komoditas].nilai += item.mina_padi_nilai;
          break;
        case 'Karamba':
          acc[item.komoditas].volume += item.karamba_volume;
          acc[item.komoditas].nilai += item.karamba_nilai;
          break;
        case 'Japung':
          acc[item.komoditas].volume += item.japung_volume;
          acc[item.komoditas].nilai += item.japung_nilai;
          break;
      }
      return acc;
    }, {} as Record<string, { komoditas: string; volume: number; nilai: number }>);

    return Object.values(grouped)
      .filter((item) => item.volume > 0 || item.nilai > 0)
      .sort((a, b) => b.volume - a.volume);
  };

  const getTotalVolumeByBudidaya = (jenis: string): number => {
    return getKomoditasByBudidaya(jenis).reduce(
      (sum, item) => sum + item.volume,
      0
    );
  };

  const getTotalNilaiByBudidaya = (jenis: string): number => {
    return getKomoditasByBudidaya(jenis).reduce(
      (sum, item) => sum + item.nilai,
      0
    );
  };

  const kpi = {
    luas: parseFloat(getKpiValue('Jumlah total luasan budidaya')),
    pembudidaya: parseInt(getKpiValue('Jumlah total pembudidaya'), 10),
    pembenihan: parseInt(getKpiValue('Jumlah unit pembenihan'), 10),
    volume: parseFloat(getKpiValue('Volume total produksi budidaya')),
    nilai: parseFloat(getKpiValue('Nilai produksi total budidaya')),
    komoditas:
      data?.komoditas_budidaya
        ? [...new Set(data.komoditas_budidaya.map((item) => item.no))].length
        : 0,
  };

  // ========================================
  // FETCH DATA - UPDATED FOR SELECT ALL
  // ========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ MODE 1: SELECT ALL - Fetch semua tahun
        if (isAllOrNone(selectedYear)) {
          const response = await fetch(
            '/samudata/api/budidaya_fetch_all.php',
            { credentials: 'include' }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          if (!result.ok) {
            throw new Error(result.message || 'Error dari server');
          }
          // ✅ Pastikan array tidak undefined
          setAvailableYears(Array.isArray(result.available_years) ? result.available_years : []);
          setAllYearsData(Array.isArray(result.yearly_data) ? result.yearly_data : []);
          setData(null);
          setLoading(false);
        }
        // ✅ MODE 2: TAHUN SPESIFIK - Fetch data per tahun
        else {
          const res = await fetch(
            `/samudata/api/budidaya_fetch.php?tahun=${selectedYear}`,
            { credentials: 'include' }
          );
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
        console.error('Error fetching Perikanan Budidaya:', err);
        setError(err.message || 'Gagal memuat data');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  // ========================================
  // EXPORT EXCEL
  // ========================================
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

  // ========================================
  // IKAN HIAS HELPER FUNCTIONS
  // ========================================
  const getTotalIkanHias = () => {
    if (!data?.produksi_ikan_hias || !data?.nilai_ikan_hias) {
      return { volume: 0, nilai: 0 };
    }
    const totalVolume = data.produksi_ikan_hias.reduce((sum, item) => {
      return (
        sum + (parseFloat(item.total_volume?.toString() || '0') || 0)
      );
    }, 0);
    const totalNilai = data.nilai_ikan_hias.reduce((sum, item) => {
      return sum + (parseFloat(item.total_value?.toString() || '0') || 0);
    }, 0);
    return { volume: totalVolume, nilai: totalNilai };
  };

  const getTopJenisIkanHias = (limit: number = 10) => {
    if (!data?.produksi_ikan_hias) return [];
    const jenisMap: { [key: string]: number } = {};
    data.produksi_ikan_hias.forEach((item) => {
      const addIfPositive = (key: string, value: any) => {
        const num = parseFloat(value?.toString() || '0') || 0;
        if (num > 0) {
          jenisMap[key] = (jenisMap[key] || 0) + num;
        }
      };
      addIfPositive('Arwana', item.arwana);
      addIfPositive('Koi', item.koi);
      addIfPositive('Grass Carp', item.grasscarp);
      addIfPositive('Mas', item.mas);
      addIfPositive('Mas Koki', item.mas_koki);
      addIfPositive('Mutiara', item.mutiara);
      addIfPositive('Akara', item.akara);
      addIfPositive('Barbir', item.barbir);
      addIfPositive('Gapi', item.gapi);
      addIfPositive('Cupang', item.cupang);
      addIfPositive('Lalia', item.lalia);
      addIfPositive('Manvis', item.manvis);
      addIfPositive('Black Molly', item.black_molly);
      addIfPositive('Oskar', item.oskar);
      addIfPositive('Platy', item.platy);
      addIfPositive('Rainbow', item.rainbow);
      addIfPositive('Louhan', item.louhan);
      addIfPositive('Sumatra', item.sumatra);
      addIfPositive('Lele Blorok', item.lele_blorok);
      addIfPositive('Komet', item.komet);
      addIfPositive('Black Ghost', item.blackghost);
      addIfPositive('Kar Tetra', item.kar_tetra);
      addIfPositive('Marble', item.marble);
      addIfPositive('Golden', item.golden);
      addIfPositive('Discus', item.discus);
      addIfPositive('Zebra', item.zebra);
      addIfPositive('Cawang', item.cawang);
      addIfPositive('Balasak', item.balasak);
      addIfPositive('Red Fin', item.red_fin);
      addIfPositive('Lemon', item.lemon);
      addIfPositive('Niasa', item.niasa);
      addIfPositive('Lobster', item.lobster);
      addIfPositive('Silver', item.silver);
      addIfPositive('Juani', item.juani);
      addIfPositive('Lainnya', item.lainnya);
    });
    return Object.entries(jenisMap)
      .map(([jenis, volume]) => ({ jenis, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  };

  // ========================================
  // ✅ SUMMARY DASHBOARD - TAMPILKAN SAAT SELECT ALL
  // ========================================
  if (isAllOrNone(selectedYear)) {
    // Loading state untuk Select All
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16 bg-gray-50 min-h-[500px]">
          <div className="text-center bg-white px-8 py-6 rounded-xl shadow-md border border-gray-200">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-800">Memuat ringkasan semua tahun...</p>
            <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
          </div>
        </div>
      );
    }

    // Error state untuk Select All
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

    // ✅ NO DATA STATE UNTUK SELECT ALL - DIPERBAIKI
    if (availableYears.length === 0 || allYearsData.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ringkasan Perikanan Budidaya
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Tidak ada data statistik yang tersedia untuk semua tahun.
            </p>
            <div className="bg-blue-50 text-blue-800 rounded-lg p-4 text-sm">
              <p className="font-medium">Informasi:</p>
              <p>Data akan ditampilkan setelah proses input data selesai dilakukan oleh administrator.</p>
            </div>
          </div>
        </div>
      );
    }

    // ✅ TAMPILKAN DASHBOARD SUMMARY JIKA ADA DATA
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold mb-1">Ringkasan Perikanan Budidaya</h1>
          <p className="text-blue-100 opacity-90">
            Perbandingan Data Tahun {availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
            {availableYears.length > 0 ? availableYears[0] : ''}
          </p>
        </div>
        <div className="p-6">

                    {/* Tabel Statistik */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tabel Statistik Perbandingan Tahun</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tahun</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Luas Budidaya (Ha)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Pembudidaya (Orang)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Pembenihan (Unit)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Volume Produksi (Ton)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Nilai Produksi (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allYearsData.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.tahun}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatHa(item.luas_total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pembudidaya_total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pembenihan_total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium text-blue-800">
                        {formatTon(item.volume_total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium text-red-700">
                        {formatCurrency(item.nilai_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Line Chart - Volume Produksi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              Trend Volume Produksi Perikanan Budidaya ({availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
              {availableYears.length > 0 ? availableYears[0] : ''})
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={allYearsData}
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



          {/* Line Chart - Nilai Produksi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
              Trend Nilai Produksi Perikanan Budidaya ({availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
              {availableYears.length > 0 ? availableYears[0] : ''})
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={allYearsData}
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

          {/* Bar Chart Perbandingan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Perbandingan Volume Produksi per Tahun</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={allYearsData}
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
    );
  }

  // ========================================
  // LOADING STATE - UNTUK TAHUN SPESIFIK
  // ========================================
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">
            {isAllOrNone(selectedYear)
              ? 'Memuat ringkasan semua tahun...'
              : `Memuat data ${selectedYear}...`}
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE - UNTUK TAHUN SPESIFIK
  // ========================================
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

  // ========================================
  // ✅ NO DATA STATE - UNTUK TAHUN SPESIFIK (DIPERBAIKI)
  // ========================================
  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shrimp className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Data Perikanan Budidaya - {selectedYear}
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

  // ========================================
  // SAFELY COMPUTE DERIVED DATA
  // ========================================
  const wilayahTop5 = data?.matrix?.rows
    ? data.matrix.rows
        .map((row) => {
          const total =
            (row.Volume_Laut || 0) +
            (row.Volume_Tambak || 0) +
            (row.Volume_Kolam || 0) +
            (row.Volume_MinaPadi || 0) +
            (row.Volume_Karamba || 0) +
            (row.Volume_JaringApung || 0);
          return {
            name: row.Wilayah,
            value: total,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : [];

  // ========================================
  // MAIN RENDER - EXISTING CODE FOR SPECIFIC YEAR
  // ========================================
  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* ========================================
      OVERVIEW: 7 CARDS
      ======================================== */}
      {!activeCard && (
        <div className="p-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <div
            className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveCard('luas')}
          >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <MapPin className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Luas Budidaya</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatHa(kpi.luas)}
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
            onClick={() => setActiveCard('pembudidaya')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-green-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Jumlah Pembudidaya</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatNumber(kpi.pembudidaya)}
                </p>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Orang
                </p>
              </div>
            </div>
          </div>


          <div
            className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveCard('pembenihan')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <FlaskConical className="w-5 h-5 text-yellow-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Unit Pembenihan</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatNumber(kpi.pembenihan)}
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
                  {formatTon(kpi.volume)}
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
                  {formatCurrency(kpi.nilai)}
                </p>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Rupiah
                </p>
              </div>
            </div>
          </div>


          <div
            className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              setActiveCard('komoditas');
              setActiveBudidaya(null);
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <Leaf className="w-5 h-5 text-orange-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Jumlah Komoditas</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatNumber(kpi.komoditas)}
                </p>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Jenis
                </p>
              </div>
            </div>
          </div>
                    

          <div
            className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveCard('ikan_hias')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                    <Shrimp className="w-5 h-5 text-cyan-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Produksi Ikan Hias</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatNumber(getTotalIkanHias().volume)}
                </p>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                  Ekor
                </p>
              </div>
            </div>
          </div>
        </div>

          {/* Visualisasi Sederhana di Overview */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Bar Chart Luas Budidaya - GANTI DENGAN INI */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Perbandingan Volume Produksi antar Komoditas ({selectedYear})
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    {
                      name: 'Laut',
                      volume: data.matrix.rows.reduce(
                        (sum, row) => sum + (Number(row.Volume_Laut) || 0),
                        0
                      ),
                    },
                    {
                      name: 'Tambak',
                      volume: data.matrix.rows.reduce(
                        (sum, row) => sum + (Number(row.Volume_Tambak) || 0),
                        0
                      ),
                    },
                    {
                      name: 'Kolam',
                      volume: data.matrix.rows.reduce(
                        (sum, row) => sum + (Number(row.Volume_Kolam) || 0),
                        0
                      ),
                    },
                    {
                      name: 'Mina Padi',
                      volume: data.matrix.rows.reduce(
                        (sum, row) => sum + (Number(row.Volume_MinaPadi) || 0),
                        0
                      ),
                    },
                    {
                      name: 'Karamba',
                      volume: data.matrix.rows.reduce(
                        (sum, row) => sum + (Number(row.Volume_Karamba) || 0),
                        0
                      ),
                    },
                    {
                      name: 'Jaring Apung',
                      volume: data.matrix.rows.reduce(
                        (sum, row) => sum + (Number(row.Volume_JaringApung) || 0),
                        0
                      ),
                    },
                  ]}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    tickFormatter={formatTon} 
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatTon(Number(value)), 'Ton']} 
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
                    name="Volume Produksi" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart Jumlah Pembudidaya */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Jumlah Pembudidaya per Jenis ({selectedYear})
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={
                    data.pembudidaya
                      .filter((p) => p.subsektor && p.jumlah)
                      .reduce(
                        (
                          acc: Array<{ Jenis: string; Jumlah: number }>,
                          p: PembudidayaItem
                        ) => {
                          const idx = acc.findIndex((item) => item.Jenis === p.subsektor);
                          if (idx >= 0) {
                            acc[idx].Jumlah += parseInt(p.jumlah, 10) || 0;
                          } else {
                            acc.push({
                              Jenis: p.subsektor,
                              Jumlah: parseInt(p.jumlah, 10) || 0,
                            });
                          }
                          return acc;
                        },
                        []
                      )
                      .sort((a, b) => b.Jumlah - a.Jumlah)
                      .slice(0, 5)
                  }
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={formatNumber} />
                  <YAxis dataKey="Jenis" type="category" width={120} />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), 'Jumlah Pembudidaya']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar
                    dataKey="Jumlah"
                    fill="#10B981"
                    name="Jumlah Pembudidaya"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    

      {/* ========================================
      DETAIL VIEW: KOMODITAS BUDIDAYA (BARU)
      ======================================== */}
      {activeCard === 'komoditas' && (
        <div className="p-6">
          <button
            onClick={() => {
              setActiveCard(null);
              setActiveBudidaya(null);
            }}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Komoditas Budidaya ({selectedYear})
          </h3>
          {/* Jika belum pilih jenis budidaya, tampilkan 6 card */}
          {!activeBudidaya && (
            <>
              {/* Total Komoditas */}
              <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Total Komoditas Budidaya</p>
                <p className="text-5xl font-bold text-orange-900">{kpi.komoditas}</p>
                <p className="text-xs text-orange-700 mt-1">Jenis Komoditas</p>
              </div>
              {/* 6 Card Jenis Budidaya */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                {['Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Japung'].map((jenis) => {
                  const totalVolume = getTotalVolumeByBudidaya(jenis);
                  const totalNilai = getTotalNilaiByBudidaya(jenis);
                  const itemCount = getKomoditasByBudidaya(jenis).length;
                  // Warna berbeda untuk setiap jenis
                  const colorMap: { [key: string]: string } = {
                      Laut: 'orange',
                      Tambak: 'orange',
                      Kolam: 'orange',
                      Karamba: 'orange',
                      'Jaring Apung': 'orange',
                      'Mina Padi': 'orange',
                  };
                  const color = colorMap[jenis] || 'gray';
                  return (
                    <div
                      key={jenis}
                      onClick={() => setActiveBudidaya(jenis as ActiveBudidaya)}
                      className="cursor-pointer rounded-lg shadow p-4 border-l-4 hover:shadow-md transition-shadow"
                      style={{ borderColor: `var(--color-${color}-500)` }}
                    >
                      <div className={`bg-${color}-50 p-3 rounded-lg mb-3`}>
                        <MapPin className="w-6 h-6 mx-auto" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-center mb-2">{jenis}</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Total Volume</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatTon(totalVolume)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Total Nilai</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(totalNilai * 1000)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Jumlah Komoditas</p>
                          <p className="text-base font-bold text-gray-900">{itemCount}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {/* Jika sudah pilih jenis budidaya, tampilkan detail */}
          {activeBudidaya && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 mb-6">
                <div className="flex">
                  <button
                    onClick={() => setActiveBudidaya(null)}
                    className="px-6 py-3 font-medium text-blue-600 hover:text-blue-800"
                  >
                    ← Kembali ke Jenis Budidaya
                  </button>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Komoditas {activeBudidaya} ({selectedYear})
              </h4>
              {/* Volume Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h5 className="font-bold text-gray-900 mb-4">
                  Volume Produksi per Komoditas ({activeBudidaya})
                </h5>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getKomoditasByBudidaya(activeBudidaya)}
                    margin={{ top: 20, right: 30, left: 80, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="komoditas"
                      tick={<CustomXAxisTick />}
                      height={80}
                    />
                    <YAxis
                      tickFormatter={formatTon}
                      label={{
                        value: 'Volume (Kg)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#4b5563',
                        style: { textAnchor: 'middle' },
                      }}
                      width={200}
                    />
                    <Tooltip formatter={(value: number) => [formatTon(value), 'Volume']} />
                    <Bar dataKey="volume" fill="#f97316" name="Volume (Kg)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Nilai Chart */}
              <div className="bg-gray-50 rounded-lg p-6 mt-6">
                <h5 className="font-bold text-gray-900 mb-4">
                  Nilai Produksi per Komoditas ({activeBudidaya})
                </h5>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getKomoditasByBudidaya(activeBudidaya)}
                    margin={{ top: 20, right: 30, left: 80, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="komoditas"
                      tick={<CustomXAxisTick />}
                      height={80}
                    />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value * 1000)}
                      label={{
                        value: 'Nilai (Rp)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#4b5563',
                        style: { textAnchor: 'middle' },
                      }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value * 1000), 'Nilai']}
                    />
                    <Bar dataKey="nilai" fill="#ef4444" name="Nilai (Rp)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Tabel Statistik */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <h5 className="font-bold text-gray-900 text-lg">
                    Tabel Statistik Komoditas {activeBudidaya} ({selectedYear})
                  </h5>
                  <button
                    onClick={() => {
                      const tableData = getKomoditasByBudidaya(activeBudidaya).map((row) => ({
                        Komoditas: row.komoditas,
                        Volume_Produksi: row.volume,
                        Nilai_Produksi: row.nilai * 1000,
                      }));
                      handleExportExcel(
                        tableData,
                        `Komoditas_${activeBudidaya.replace(' ', '_')}`,
                        ['Komoditas', 'Volume Produksi (Kg)', 'Nilai Produksi (Rp)']
                      );
                    }}
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
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Komoditas
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Volume (Kg)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Nilai (Rp)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getKomoditasByBudidaya(activeBudidaya).map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {row.komoditas}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatTon(row.volume)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(row.nilai * 1000)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ... (SISA KODE DETAIL VIEW LAINNYA TETAP SAMA) ... */}
      
      {/* ========================================
      DETAIL VIEW: PRODUKSI IKAN HIAS
      ======================================== */}
      {activeCard === 'ikan_hias' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Produksi Ikan Hias ({selectedYear})
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
                Tabel Statistik Lengkap
              </button>
            </div>
          </div>
          {activeView === 'summary' && data.produksi_ikan_hias && data.nilai_ikan_hias && (
            <div className="space-y-6">
              {/* Total Produksi */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-cyan-50 border-l-4 border-cyan-600 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Volume Produksi</p>
                  <p className="text-5xl font-bold text-cyan-900">
                    {formatNumber(getTotalIkanHias().volume)}
                  </p>
                  <p className="text-xs text-cyan-700 mt-1">100 Ekor</p>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Nilai Produksi</p>
                  <p className="text-4xl font-bold text-amber-900">
                    {formatCurrency(getTotalIkanHias().nilai)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">Rp 1.000</p>
                </div>
              </div>
              {/* Top 10 Jenis Ikan Hias */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">
                  Top 10 Jenis Ikan Hias by Volume ({selectedYear})
                </h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getTopJenisIkanHias(10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="jenis" tick={<CustomXAxisTick />} height={80} />
                    <YAxis tickFormatter={formatNumber} />
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Volume (100 Ekor)']}
                    />
                    <Legend />
                    <Bar
                      dataKey="volume"
                      fill="#06b6d4"
                      name="Volume (100 Ekor)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Pie Chart Distribusi */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">
                  Distribusi Produksi per Kabupaten/Kota ({selectedYear})
                </h4>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={data.produksi_ikan_hias
                        .filter((item) => parseFloat(item.total_volume?.toString() || '0') > 0)
                        .map((item) => ({
                          name: item.kabupaten_kota,
                          value: parseFloat(item.total_volume?.toString() || '0'),
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 10)}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={150}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Volume (100 Ekor)']}
                    />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeView === 'table' && data.produksi_ikan_hias && data.nilai_ikan_hias && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">
                  Tabel Produksi Ikan Hias per Kabupaten/Kota (Satuan 1000 ekor) ({selectedYear})
                </h4>
                <button
                  onClick={() => {
                    const tableData = data.produksi_ikan_hias.map((item) => {
                      const nilaiItem = data.nilai_ikan_hias.find(
                        (n) => n.kabupaten_kota === item.kabupaten_kota
                      );
                      return {
                        Kabupaten_Kota: item.kabupaten_kota,
                        Total_Volume_100_Ekor: item.total_volume,
                        Nilai_Produksi_Rp_1000: nilaiItem?.total_value || 0,
                        Arwana: item.arwana,
                        Koi: item.koi,
                        Grass_Carp: item.grasscarp,
                        Mas: item.mas,
                        Mas_Koki: item.mas_koki,
                        Mutiara: item.mutiara,
                        Akara: item.akara,
                        Barbir: item.barbir,
                        Gapi: item.gapi,
                        Cupang: item.cupang,
                        Lalia: item.lalia,
                        Manvis: item.manvis,
                        Black_Molly: item.black_molly,
                        Oskar: item.oskar,
                        Platy: item.platy,
                        Rainbow: item.rainbow,
                        Louhan: item.louhan,
                        Sumatra: item.sumatra,
                        Lele_Blorok: item.lele_blorok,
                        Komet: item.komet,
                        Black_Ghost: item.blackghost,
                        Kar_Tetra: item.kar_tetra,
                        Marble: item.marble,
                        Golden: item.golden,
                        Discus: item.discus,
                        Zebra: item.zebra,
                        Cawang: item.cawang,
                        Balasak: item.balasak,
                        Red_Fin: item.red_fin,
                        Lemon: item.lemon,
                        Niasa: item.niasa,
                        Lobster: item.lobster,
                        Silver: item.silver,
                        Juani: item.juani,
                        Lainnya: item.lainnya,
                      };
                    });
                    handleExportExcel(
                      tableData,
                      'Produksi_Ikan_Hias_Lengkap',
                      [
                        'Kabupaten_Kota',
                        'Total_Volume_100_Ekor',
                        'Nilai_Produksi_Rp_1000',
                        'Arwana',
                        'Koi',
                        'Grass_Carp',
                        'Mas',
                        'Mas_Koki',
                        'Mutiara',
                        'Akara',
                        'Barbir',
                        'Gapi',
                        'Cupang',
                        'Lalia',
                        'Manvis',
                        'Black_Molly',
                        'Oskar',
                        'Platy',
                        'Rainbow',
                        'Louhan',
                        'Sumatra',
                        'Lele_Blorok',
                        'Komet',
                        'Black_Ghost',
                        'Kar_Tetra',
                        'Marble',
                        'Golden',
                        'Discus',
                        'Zebra',
                        'Cawang',
                        'Balasak',
                        'Red_Fin',
                        'Lemon',
                        'Niasa',
                        'Lobster',
                        'Silver',
                        'Juani',
                        'Lainnya',
                      ]
                    );
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[2200px]">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Kabupaten/Kota
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Total Volume<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-amber-100">
                        Nilai Produksi<br />
                        (Rp 1.000)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Arwana<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Koi<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Grass Carp<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Mas<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Mas Koki<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Mutiara<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Akara<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Barbir<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Gapi<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Cupang<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Lalia<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Manvis<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Black Molly<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Oskar<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Platy<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Rainbow<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Louhan<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Sumatra<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Lele Blorok<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Komet<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Black Ghost<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Kar Tetra<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Marble<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Golden<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Discus<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Zebra<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Cawang<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Balasak<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Red Fin<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Lemon<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Niasa<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Lobster<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Silver<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Juani<br />
                        (100 Ekor)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                        Lainnya<br />
                        (100 Ekor)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.produksi_ikan_hias.map((item, idx) => {
                      const nilaiItem = data.nilai_ikan_hias.find(
                        (n) => n.kabupaten_kota === item.kabupaten_kota
                      );
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.kabupaten_kota}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            {formatNumber(parseFloat(item.total_volume?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-amber-900 bg-amber-50">
                            {formatNumber(parseFloat(nilaiItem?.total_value?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.arwana?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.koi?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.grasscarp?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.mas?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.mas_koki?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.mutiara?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.akara?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.barbir?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.gapi?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.cupang?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.lalia?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.manvis?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.black_molly?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.oskar?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.platy?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.rainbow?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.louhan?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.sumatra?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.lele_blorok?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.komet?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.blackghost?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.kar_tetra?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.marble?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.golden?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.discus?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.zebra?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.cawang?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.balasak?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.red_fin?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.lemon?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.niasa?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.lobster?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.silver?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.juani?.toString() || '0'))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatNumber(parseFloat(item.lainnya?.toString() || '0'))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Legend/Info Box */}
              <div className="bg-blue-50 border-t border-blue-200 p-4">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">ℹ️ Info:</span>
                  Data volume dalam satuan <span className="font-bold">Ekor</span> (dikalikan 1000 dari
                  satuan database "1000 ekor"). Tabel dapat di-scroll horizontal untuk melihat semua
                  jenis ikan hias.
                </p>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ========================================
      DETAIL VIEW: LUAS BUDIDAYA
      ======================================== */}
      {activeCard === 'luas' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Luas Budidaya ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          
          {activeView === 'summary' && data.luas_per_komponen && (
            <div className="space-y-6">
              {/* 6 Komponen Utama */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {data.luas_per_komponen
                  .filter((item) =>
                    item?.komponen &&
                    ['Laut', 'Tambak', 'Kolam', 'Karamba', 'Jaring Apung', 'Mina Padi'].includes(item.komponen)
                  )
                  .map((item, idx) => {
                    const colorMap: { [key: string]: string } = {
                      Laut: 'blue',
                      Tambak: 'blue',
                      Kolam: 'blue',
                      Karamba: 'blue',
                      'Jaring Apung': 'blue',
                      'Mina Padi': 'blue',
                    };
                    const color = colorMap[item.komponen] || 'gray';
                    return (
                      <div
                        key={idx}
                        className={`bg-${color}-50 border-l-4 border-${color}-600 p-6 rounded-lg`}
                      >
                        <p className="text-sm text-gray-600 mb-2">{item.komponen}</p>
                        <p className={`text-4xl font-bold text-${color}-900`}>
                          {formatHa(toNumber(item.luas) || 0)}
                        </p>
                        <p className={`text-xs text-${color}-700 mt-1`}>Ha</p>
                      </div>
                    );
                  })}
              </div>
              
              {/* Pie Chart Distribusi */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Distribusi Luas per Komponen ({selectedYear})</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.luas_per_komponen
                        .filter((item) =>
                          ['Laut', 'Tambak', 'Kolam', 'Karamba', 'Jaring Apung', 'Mina Padi'].includes(item.komponen)
                        )
                        .map((item) => ({ name: item.komponen, value: toNumber(item.luas) || 0 }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {COLORS.slice(0, 6).map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatHa(Number(value)), 'Ha']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeView === 'table' && data.luas_per_komponen && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">Tabel Statistik Luas Budidaya ({selectedYear})</h4>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.luas_per_komponen.map((item) => ({
                        Komponen: item.komponen,
                        Luas: item.luas,
                      })),
                      'Luas_Budidaya',
                      ['Komponen', 'Luas (Ha)']
                    )
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Komponen</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Luas (Ha)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.luas_per_komponen.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.komponen}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatHa(toNumber(item.luas) || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================
      DETAIL VIEW: PEMBUDIDAYA
      ======================================== */}
      {activeCard === 'pembudidaya' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Jumlah Pembudidaya ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          
          {activeView === 'summary' && data.pembudidaya_per_komponen && (
            <div className="space-y-6">
              {/* 6 Komponen Utama */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {data.pembudidaya_per_komponen
                  .filter((item) =>
                    ['Laut', 'Tambak', 'Kolam', 'Karamba', 'Jaring Apung', 'Mina Padi'].includes(item.komponen)
                  )
                  .map((item, idx) => {
                    const colorMap: { [key: string]: string } = {
                      Laut: 'green',
                      Tambak: 'green',
                      Kolam: 'green',
                      Karamba: 'green',
                      'Jaring Apung': 'green',
                      'Mina Padi': 'green',
                    };
                    const color = colorMap[item.komponen] || 'gray';
                    return (
                      <div
                        key={idx}
                        className={`bg-${color}-50 border-l-4 border-${color}-600 p-6 rounded-lg`}
                      >
                        <p className="text-sm text-gray-600 mb-2">{item.komponen}</p>
                        <p className={`text-4xl font-bold text-${color}-900`}>
                          {formatNumber(item.jumlah || 0)}
                        </p>
                        <p className={`text-xs text-${color}-700 mt-1`}>Orang</p>
                      </div>
                    );
                  })}
              </div>
              
              {/* Pie Chart Distribusi */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Distribusi Pembudidaya per Komponen ({selectedYear})</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.pembudidaya_per_komponen
                        .filter((item) =>
                          ['Laut', 'Tambak', 'Kolam', 'Karamba', 'Jaring Apung', 'Mina Padi'].includes(item.komponen)
                        )
                        .map((item) => ({ name: item.komponen, value: toNumber(item.jumlah) || 0 }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {COLORS.slice(0, 6).map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Orang']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeView === 'table' && data.pembudidaya_per_komponen && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">Tabel Statistik Pembudidaya ({selectedYear})</h4>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.pembudidaya_per_komponen.map((item) => ({
                        Komponen: item.komponen,
                        Jumlah: item.jumlah,
                      })),
                      'Pembudidaya',
                      ['Komponen', 'Jumlah (Orang)']
                    )
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Komponen</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Jumlah (Orang)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.pembudidaya_per_komponen.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.komponen}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatNumber(item.jumlah || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================
      DETAIL VIEW: PEMBENIHAN
      ======================================== */}
      {activeCard === 'pembenihan' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Unit Pembenihan ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          
          {activeView === 'summary' && data.pembenihan && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Unit Pembenihan Air Tawar</p>
                  <p className="text-4xl font-bold text-yellow-900">
                    {formatNumber(
                      data.pembenihan
                        .filter((p) => p.jenis_air === 'Tawar')
                        .reduce((sum, p) => sum + p.bbi + p.upr + p.hsrt + p.swasta, 0)
                    )}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">Unit</p>
                  <div className="mt-3 text-sm text-gray-700">
                    <div>BBI: {formatNumber(data.pembenihan.find((p) => p.jenis_air === 'Tawar')?.bbi || 0)}</div>
                    <div>UPR: {formatNumber(data.pembenihan.find((p) => p.jenis_air === 'Tawar')?.upr || 0)}</div>
                    <div>HSRT: {formatNumber(data.pembenihan.find((p) => p.jenis_air === 'Tawar')?.hsrt || 0)}</div>
                    <div>Swasta: {formatNumber(data.pembenihan.find((p) => p.jenis_air === 'Tawar')?.swasta || 0)}</div>
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Unit Pembenihan Air Payau</p>
                  <p className="text-4xl font-bold text-yellow-900">
                    {formatNumber(
                      data.pembenihan
                        .filter((p) => p.jenis_air === 'Payau')
                        .reduce((sum, p) => sum + p.bbi + p.upr + p.hsrt + p.swasta, 0)
                    )}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">Unit</p>
                  <div className="mt-3 text-sm text-gray-700">
                    <div>BBI: {formatNumber(data.pembenihan.find((p) => p.jenis_air === 'Payau')?.bbi || 0)}</div>
                    <div>HSRT: {formatNumber(data.pembenihan.find((p) => p.jenis_air === 'Payau')?.hsrt || 0)}</div>
                    <div>Swasta: {formatNumber(data.pembenihan.find((p) => p.jenis_air === 'Payau')?.swasta || 0)}</div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Unit Pembenihan Jawa Timur</p>
                <p className="text-5xl font-bold text-yellow-900">
                  {formatNumber(kpi.pembenihan)}
                </p>
                <p className="text-xs text-yellow-700 mt-1">Unit</p>
              </div>
            </div>
          )}

                    {/* Bar Chart Distribusi */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Distribusi Unit Pembenihan ({selectedYear})</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.pembenihan.flatMap((p) =>
                  [
                    { Jenis: `${p.jenis_air} - BBI`, Jumlah: p.bbi },
                    { Jenis: `${p.jenis_air} - UPR`, Jumlah: p.upr },
                    { Jenis: `${p.jenis_air} - HSRT`, Jumlah: p.hsrt },
                    { Jenis: `${p.jenis_air} - Swasta`, Jumlah: p.swasta },
                    { Jenis: `${p.jenis_air} - Pembibit Rula`, Jumlah: p.pembibit_rula || 0 },
                  ].filter((item) => item.Jumlah > 0)
                )}
                layout="vertical"
                margin={{ left: 150 }}
              >
                <XAxis type="number" tickFormatter={formatNumber} />
                <YAxis dataKey="Jenis" type="category" width={150} />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), 'Jumlah Unit']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="Jumlah" fill="#F59E0B" name="Jumlah Unit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          
          {activeView === 'table' && data.pembenihan && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">Tabel Statistik Pembenihan ({selectedYear})</h4>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.pembenihan.flatMap((p) =>
                        [
                          { Jenis_Air: p.jenis_air, Tipe: 'BBI', Jumlah: p.bbi },
                          { Jenis_Air: p.jenis_air, Tipe: 'UPR', Jumlah: p.upr },
                          { Jenis_Air: p.jenis_air, Tipe: 'HSRT', Jumlah: p.hsrt },
                          { Jenis_Air: p.jenis_air, Tipe: 'Swasta', Jumlah: p.swasta },
                          { Jenis_Air: p.jenis_air, Tipe: 'Pembibit Rula', Jumlah: p.pembibit_rula || 0 },
                        ].filter((item) => item.Jumlah > 0)
                      ),
                      'Pembenihan',
                      ['Jenis_Air', 'Tipe', 'Jumlah']
                    )
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Jenis Air</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Tipe Unit</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.pembenihan.flatMap((p, idx) => [
                      p.bbi > 0 && (
                        <tr key={`${idx}-bbi`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{p.jenis_air}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">BBI</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(p.bbi)}
                          </td>
                        </tr>
                      ),
                      p.upr > 0 && (
                        <tr key={`${idx}-upr`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{p.jenis_air}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">UPR</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(p.upr)}
                          </td>
                        </tr>
                      ),
                      p.hsrt > 0 && (
                        <tr key={`${idx}-hsrt`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{p.jenis_air}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">HSRT</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(p.hsrt)}
                          </td>
                        </tr>
                      ),
                      p.swasta > 0 && (
                        <tr key={`${idx}-swasta`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{p.jenis_air}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">Swasta</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(p.swasta)}
                          </td>
                        </tr>
                      ),
                      (p.pembibit_rula || 0) > 0 && (
                        <tr key={`${idx}-rula`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{p.jenis_air}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">Pembibit Rula</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatNumber(p.pembibit_rula)}
                          </td>
                        </tr>
                      ),
                    ].filter(Boolean))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================
      DETAIL VIEW: VOLUME PRODUKSI
      ======================================== */}
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
                  activeView === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          
          {activeView === 'summary' && data.volume_bulanan && (
            <div className="space-y-6">
              {/* 6 Komponen Utama */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {data.volume_bulanan
                  .filter((item) =>
                    ['Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Jaring Apung'].includes(item.komponen)
                  )
                  .map((item, idx) => {
                    const colorMap: { [key: string]: string } = {
                      Laut: 'purple',
                      Tambak: 'purple',
                      Kolam: 'purple',
                      Karamba: 'purple',
                      'Jaring Apung': 'purple',
                      'Mina Padi': 'purple',
                    };
                    const color = colorMap[item.komponen] || 'gray';
                    const total =
                      toNumber(item.jan) +
                      toNumber(item.feb) +
                      toNumber(item.mar) +
                      toNumber(item.apr) +
                      toNumber(item.mei) +
                      toNumber(item.jun) +
                      toNumber(item.jul) +
                      toNumber(item.agu) +
                      toNumber(item.sep) +
                      toNumber(item.okt) +
                      toNumber(item.nov) +
                      toNumber(item.des);
                    return (
                      <div
                        key={idx}
                        className={`bg-${color}-50 border-l-4 border-${color}-600 p-6 rounded-lg`}
                      >
                        <p className="text-sm text-gray-600 mb-2">{item.komponen}</p>
                        <p className={`text-4xl font-bold text-${color}-900`}>
                          {formatTon(total)}
                        </p>
                        <p className={`text-xs text-${color}-700 mt-1`}>Ton</p>
                      </div>
                    );
                  })}
              </div>
              
              {/* Line Chart Bulanan */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Volume Produksi Bulanan per Komponen ({selectedYear})</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={[
                      { bulan: 'Jan', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Feb', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Mar', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Apr', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Mei', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Jun', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Jul', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Agu', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Sep', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Okt', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Nov', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Des', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                    ].map((monthData) => {
                      const bulanMap: { [key: string]: keyof BulananItem } = {
                        Jan: 'jan',
                        Feb: 'feb',
                        Mar: 'mar',
                        Apr: 'apr',
                        Mei: 'mei',
                        Jun: 'jun',
                        Jul: 'jul',
                        Agu: 'agu',
                        Sep: 'sep',
                        Okt: 'okt',
                        Nov: 'nov',
                        Des: 'des',
                      };
                      const bulanKey = bulanMap[monthData.bulan];
                      data.volume_bulanan
                        .filter((item) =>
                          ['Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Jaring Apung'].includes(item.komponen)
                        )
                        .forEach((item) => {
                          if (bulanKey) {
                            const value = item[bulanKey];
                            const numericValue =
                              typeof value === 'string' ? parseFloat(value) || 0 : (value as number) || 0;
                            (monthData as any)[item.komponen] = numericValue;
                          }
                        });
                      return monthData;
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis tickFormatter={formatTon} />
                    <Tooltip formatter={(value: number) => [formatTon(value), 'Ton']} />
                    <Legend />
                    <Line type="monotone" dataKey="Laut" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="Tambak" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="Kolam" stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey="Mina Padi" stroke="#ff7300" strokeWidth={2} />
                    <Line type="monotone" dataKey="Karamba" stroke="#a4de6c" strokeWidth={2} />
                    <Line type="monotone" dataKey="Jaring Apung" stroke="#d0ed57" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeView === 'table' && data.volume_bulanan && (
            <>
              {/* Tabel Bulanan */}
              <div className="bg-white border rounded-lg overflow-hidden mb-6">
                <div className="flex justify-between items-center p-4 border-b">
                  <h4 className="font-bold text-gray-900 text-lg">Tabel Statistik Volume Bulanan ({selectedYear})</h4>
                  <button
                    onClick={() =>
                      handleExportExcel(
                        data.volume_bulanan.map((item) => ({
                          Komponen: item.komponen,
                          Jan: item.jan,
                          Feb: item.feb,
                          Mar: item.mar,
                          Apr: item.apr,
                          Mei: item.mei,
                          Jun: item.jun,
                          Jul: item.jul,
                          Agu: item.agu,
                          Sep: item.sep,
                          Okt: item.okt,
                          Nov: item.nov,
                          Des: item.des,
                        })),
                        'Volume_Bulanan',
                        ['Komponen', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                      )
                    }
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                      <tr>
                        <th className="px-5 py-4 text-left text-sm font-semibold">Komponen</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Jan</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Feb</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Mar</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Apr</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Mei</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Jun</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Jul</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Agu</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Sep</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Okt</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Nov</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Des</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.volume_bulanan
                        .filter((item) =>
                          ['Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Jaring Apung'].includes(item.komponen)
                        )
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.komponen}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.jan))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.feb))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.mar))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.apr))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.mei))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.jun))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.jul))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.agu))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.sep))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.okt))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.nov))}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatTon(toNumber(item.des))}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Tabel Kabupaten/Kota */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Tabel Produksi Perikanan Budidaya per Kabupaten/Kota ({selectedYear})
                  </h4>
                  <button
                    onClick={() =>
                      handleExportExcel(
                        data.matrix.rows.map((row) => {
                          const total =
                            toNumber(row.Volume_Laut) +
                            toNumber(row.Volume_Tambak) +
                            toNumber(row.Volume_Kolam) +
                            toNumber(row.Volume_MinaPadi) +
                            toNumber(row.Volume_Karamba) +
                            toNumber(row.Volume_JaringApung);
                          return {
                            Wilayah: row.Wilayah,
                            Laut: toNumber(row.Volume_Laut),
                            Tambak: toNumber(row.Volume_Tambak),
                            Kolam: toNumber(row.Volume_Kolam),
                            'Mina Padi': toNumber(row.Volume_MinaPadi),
                            Karamba: toNumber(row.Volume_Karamba),
                            'Jaring Apung': toNumber(row.Volume_JaringApung),
                            Total: total,
                          };
                        }),
                        'Produksi_Per_Kabupaten',
                        ['Wilayah', 'Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Jaring Apung', 'Total']
                      )
                    }
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                      <tr>
                        <th className="px-5 py-4 text-left text-sm font-semibold">Wilayah</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Laut</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Tambak</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Kolam</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Mina Padi</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Karamba</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Jaring Apung</th>
                        <th className="px-5 py-4 text-right text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.matrix.rows
                        .sort((a, b) => {
                          const totalA =
                            toNumber(a.Volume_Laut) +
                            toNumber(a.Volume_Tambak) +
                            toNumber(a.Volume_Kolam) +
                            toNumber(a.Volume_MinaPadi) +
                            toNumber(a.Volume_Karamba) +
                            toNumber(a.Volume_JaringApung);
                          const totalB =
                            toNumber(b.Volume_Laut) +
                            toNumber(b.Volume_Tambak) +
                            toNumber(b.Volume_Kolam) +
                            toNumber(b.Volume_MinaPadi) +
                            toNumber(b.Volume_Karamba) +
                            toNumber(b.Volume_JaringApung);
                          return totalB - totalA;
                        })
                        .map((row, idx) => {
                          const total =
                            toNumber(row.Volume_Laut) +
                            toNumber(row.Volume_Tambak) +
                            toNumber(row.Volume_Kolam) +
                            toNumber(row.Volume_MinaPadi) +
                            toNumber(row.Volume_Karamba) +
                            toNumber(row.Volume_JaringApung);
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{row.Wilayah}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatTon(toNumber(row.Volume_Laut))}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatTon(toNumber(row.Volume_Tambak))}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatTon(toNumber(row.Volume_Kolam))}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatTon(toNumber(row.Volume_MinaPadi))}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatTon(toNumber(row.Volume_Karamba))}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {formatTon(toNumber(row.Volume_JaringApung))}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 font-bold">
                                {formatTon(total)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================
      DETAIL VIEW: NILAI PRODUKSI
      ======================================== */}
      {activeCard === 'nilai' && (
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Detail Nilai Produksi ({selectedYear})
          </h3>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveView('summary')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-6 py-3 font-medium ${
                  activeView === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 inline mr-2" />
                Tabel Statistik
              </button>
            </div>
          </div>
          
          {activeView === 'summary' && data.nilai_bulanan && (
            <div className="space-y-6">
              {/* 6 Komponen Utama */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {data.nilai_bulanan
                  .filter((item) =>
                    ['Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Jaring Apung'].includes(item.komponen)
                  )
                  .map((item, idx) => {
                    const colorMap: { [key: string]: string } = {
                      Laut: 'red',
                      Tambak: 'red',
                      Kolam: 'red',
                      Karamba: 'red',
                      'Jaring Apung': 'red',
                      'Mina Padi': 'red',
                    };
                    const color = colorMap[item.komponen] || 'gray';
                    const total =
                      toNumber(item.jan) +
                      toNumber(item.feb) +
                      toNumber(item.mar) +
                      toNumber(item.apr) +
                      toNumber(item.mei) +
                      toNumber(item.jun) +
                      toNumber(item.jul) +
                      toNumber(item.agu) +
                      toNumber(item.sep) +
                      toNumber(item.okt) +
                      toNumber(item.nov) +
                      toNumber(item.des);
                    return (
                      <div
                        key={idx}
                        className={`bg-${color}-50 border-l-4 border-${color}-600 p-6 rounded-lg`}
                      >
                        <p className="text-sm text-gray-600 mb-2">{item.komponen}</p>
                        <p className={`text-3xl font-bold text-${color}-900`}>
                          {formatCurrency(total * 1000)}
                        </p>
                      </div>
                    );
                  })}
              </div>
              
              {/* Line Chart Bulanan */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Nilai Produksi Bulanan per Komponen ({selectedYear})</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={[
                      { bulan: 'Jan', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Feb', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Mar', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Apr', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Mei', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Jun', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Jul', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Agu', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Sep', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Okt', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Nov', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                      { bulan: 'Des', Laut: 0, Tambak: 0, Kolam: 0, 'Mina Padi': 0, Karamba: 0, 'Jaring Apung': 0 },
                    ].map((monthData) => {
                      const bulanMap: { [key: string]: keyof BulananItem } = {
                        Jan: 'jan',
                        Feb: 'feb',
                        Mar: 'mar',
                        Apr: 'apr',
                        Mei: 'mei',
                        Jun: 'jun',
                        Jul: 'jul',
                        Agu: 'agu',
                        Sep: 'sep',
                        Okt: 'okt',
                        Nov: 'nov',
                        Des: 'des',
                      };
                      const bulanKey = bulanMap[monthData.bulan];
                      data.nilai_bulanan
                        .filter((item) =>
                          ['Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Jaring Apung'].includes(item.komponen)
                        )
                        .forEach((item) => {
                          if (bulanKey) {
                            const value = item[bulanKey];
                            const numericValue =
                              typeof value === 'string' ? parseFloat(value) || 0 : (value as number) || 0;
                            (monthData as any)[item.komponen] = numericValue * 1000;
                          }
                        });
                      return monthData;
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Rp']} />
                    <Legend />
                    <Line type="monotone" dataKey="Laut" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="Tambak" stroke="#f97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="Kolam" stroke="#eab308" strokeWidth={2} />
                    <Line type="monotone" dataKey="Mina Padi" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="Karamba" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Jaring Apung" stroke="#a78bfa" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeView === 'table' && data.nilai_bulanan && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-900 text-lg">
                  Tabel Statistik Nilai Bulanan (x Rp 1.000) ({selectedYear})
                </h4>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.nilai_bulanan.map((item) => ({
                        Komponen: item.komponen,
                        Jan: item.jan,
                        Feb: item.feb,
                        Mar: item.mar,
                        Apr: item.apr,
                        Mei: item.mei,
                        Jun: item.jun,
                        Jul: item.jul,
                        Agu: item.agu,
                        Sep: item.sep,
                        Okt: item.okt,
                        Nov: item.nov,
                        Des: item.des,
                      })),
                      'Nilai_Bulanan',
                      ['Komponen', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                    )
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Komponen</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Jan</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Feb</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Mar</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Apr</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Mei</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Jun</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Jul</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Agu</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Sep</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Okt</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Nov</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold">Des</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.nilai_bulanan
                      .filter((item) =>
                        ['Laut', 'Tambak', 'Kolam', 'Mina Padi', 'Karamba', 'Jaring Apung'].includes(item.komponen)
                      )
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.komponen}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.jan) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.feb) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.mar) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.apr) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.mei) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.jun) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.jul) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.agu) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.sep) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.okt) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.nov) * 1000)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(toNumber(item.des) * 1000)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========================================
// METRIC CARD COMPONENT
// ========================================
function MetricCard({
  icon: Icon,
  title,
  value,
  unit,
  color,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  unit: string;
  color: string;
  onClick: () => void;
}) {
  const colorClasses = {
    blue: 'border-l-blue-500 bg-blue-50',
    green: 'border-l-green-500 bg-green-50',
    yellow: 'border-l-yellow-500 bg-yellow-50',
    purple: 'border-l-purple-500 bg-purple-50',
    red: 'border-l-red-500 bg-red-50',
    orange: 'border-l-orange-500 bg-orange-50',
    cyan: 'border-l-cyan-500 bg-cyan-50',
  };
  
  return (
   <div
      onClick={onClick}
      className="cursor-pointer rounded-lg shadow p-4 border-l-4 border-blue-600 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value} {unit && <span className="text-sm font-normal text-gray-600">{unit}</span>}
      </p>
    </div>
  );
}