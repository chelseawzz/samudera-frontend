// src/pages/DataStatistik/PengolahanPemasaran.tsx
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Factory,
  ArrowLeft,
  Download,
  BarChart3,
  Table as TableIcon,
  Users,
  PieChart as PieChartIcon,
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

// ========================================
// INTERFACES - UPDATED FOR NEW BACKEND STRUCTURE
// ========================================
interface PemasaranData {
  tahun: number;
  kab_kota: string;
  pengecer: number;
  pengumpul: number;
  jumlah_unit: number;
}

interface OlahanKabData {
  tahun: number;
  kab_kota: string;
  fermentasi: number;
  pelumatan_daging_ikan: number;
  pembekuan: number;
  pemindangan: number;
  penanganan_produk_segar: number;
  pengalengan: number;
  pengasapan_pemanggangan: number;
  pereduksian_ekstraksi: number;
  penggaraman_pengeringan: number;
  pengolahan_lainnya: number;
  jumlah_unit: number;
}

interface ApiData {
  ok: boolean;
  tahun: number;
  aki: any[];
  pemasaran: PemasaranData[];
  olahankab: OlahanKabData[];
  olahjenis: any[];
  message?: string;
}

// Backend mengirim semua data dalam satu array yearly_data
interface BackendYearlyData {
  tahun: number;
  // Pemasaran fields
  pemasaran_pengecer: number;
  pemasaran_pengumpul: number;
  pemasaran_unit: number;
  // Pengolahan fields - 10 jenis kegiatan
  pengolahan_unit: number;
  pengolahan_fermentasi: number;
  pengolahan_pelumatan_daging_ikan: number;
  pengolahan_pembekuan: number;
  pengolahan_pemindangan: number;
  pengolahan_penanganan_produk_segar: number;
  pengolahan_pengalengan: number;
  pengolahan_pengasapan_pemanggangan: number;
  pengolahan_pereduksian_ekstraksi: number;
  pengolahan_penggaraman_pengeringan: number;
  pengolahan_lainnya: number;
}

interface YearlySummaryPemasaran {
  tahun: number;
  total_pengecer: number;
  total_pengumpul: number;
  total_unit: number;
}

interface YearlySummaryPengolahan {
  tahun: number;
  total_unit: number;
  fermentasi: number;
  pelumatan_daging_ikan: number;
  pembekuan: number;
  pemindangan: number;
  penanganan_produk_segar: number;
  pengalengan: number;
  pengasapan_pemanggangan: number;
  pereduksian_ekstraksi: number;
  penggaraman_pengeringan: number;
  pengolahan_lainnya: number;
}

type ActiveCard = 'pemasaran' | 'olahan' | null;
type ActiveView = 'summary' | 'table';

function isAllOrNone(year: any): year is 'all' | null {
  return year === 'all' || year === null;
}

// ========================================
// MAIN COMPONENT
// ========================================
export function PengolahanPemasaran({
  bidang,
  title,
  icon,
  color,
  selectedYear,
  onYearChange,
  onNavigate,
}: DataStatistikBaseProps) {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [activeView, setActiveView] = useState<ActiveView>('summary');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk Select All dengan interface yang benar
  const [allYearsDataPemasaran, setAllYearsDataPemasaran] = useState<YearlySummaryPemasaran[]>([]);
  const [allYearsDataPengolahan, setAllYearsDataPengolahan] = useState<YearlySummaryPengolahan[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  
const colors = ["#3b8256", "#6aa84f", "#8e7cc3", "#3c78d8", "#e69138"];

  // Reset view when switching cards
  useEffect(() => {
    if (activeCard) {
      setActiveView('summary');
    }
  }, [activeCard]);

  // Calculate summary data
  const summary = data
    ? {
        total_pengecer: data.pemasaran.reduce((sum, item) => sum + item.pengecer, 0),
        total_pengumpul: data.pemasaran.reduce((sum, item) => sum + item.pengumpul, 0),
        total_unit_pemasaran: data.pemasaran.reduce((sum, item) => sum + item.jumlah_unit, 0),
        total_unit_olahan: data.olahankab.reduce((sum, item) => sum + item.jumlah_unit, 0),
        total_kabupaten: data.pemasaran.length,
      }
    : null;

  // ========================================
  // FETCH DATA - UPDATED FOR NEW BACKEND
  // ========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isAllOrNone(selectedYear)) {
          // Fetch all years data for comparison dashboard
          const response = await fetch(
            'http://localhost/samudata/api/pengolahan_pemasaran_fetch_all.php',
            { credentials: 'include' }
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!result.ok) {
            throw new Error(result.error || 'Error dari server');
          }

          // Debug logging
          console.log('Available Years:', result.available_years);
          console.log('Yearly Data Sample:', result.yearly_data[0]);

          setAvailableYears(result.available_years || []);

          // Konversi data backend ke format yang diharapkan komponen
          const yearlyData: BackendYearlyData[] = result.yearly_data || [];

          // Mapping untuk Pemasaran
          setAllYearsDataPemasaran(
            yearlyData.map((item: BackendYearlyData) => ({
              tahun: item.tahun,
              total_unit: item.pemasaran_unit,
              total_pengecer: item.pemasaran_pengecer,
              total_pengumpul: item.pemasaran_pengumpul
            }))
          );

          // Mapping untuk Pengolahan - LENGKAP 10 JENIS
          setAllYearsDataPengolahan(
            yearlyData.map((item: BackendYearlyData) => ({
              tahun: item.tahun,
              total_unit: item.pengolahan_unit,
              fermentasi: item.pengolahan_fermentasi,
              pelumatan_daging_ikan: item.pengolahan_pelumatan_daging_ikan,
              pembekuan: item.pengolahan_pembekuan,
              pemindangan: item.pengolahan_pemindangan,
              penanganan_produk_segar: item.pengolahan_penanganan_produk_segar,
              pengalengan: item.pengolahan_pengalengan,
              pengasapan_pemanggangan: item.pengolahan_pengasapan_pemanggangan,
              pereduksian_ekstraksi: item.pengolahan_pereduksian_ekstraksi,
              penggaraman_pengeringan: item.pengolahan_penggaraman_pengeringan,
              pengolahan_lainnya: item.pengolahan_lainnya
            }))
          );

          setData(null);
          setLoading(false);
        } else {
          // Fetch single year data
          const res = await fetch(
            `http://localhost/samudata/api/pengolahan_pemasaran_fetch.php?tahun=${selectedYear}`,
            { credentials: 'include' }
          );
          
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          
          const json = await res.json();
          
         if (!json?.ok || (!json.pemasaran?.length && !json.olahankab?.length)) {
          setData(null);
          setLoading(false);
          return;
        }

          setData(json);
          setAllYearsDataPemasaran([]);
          setAllYearsDataPengolahan([]);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching Pengolahan & Pemasaran', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const handleExportExcel = (dataToExport: any[], fileName: string, headers: string[]) => {
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
  // SELECT ALL VIEW - TAMPILAN PERBANDINGAN TAHUN
  // ========================================
  if (isAllOrNone(selectedYear)) {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Memuat ringkasan semua tahun...</p>
          </div>
        </div>
      );
    }

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

    if (availableYears.length === 0 || allYearsDataPemasaran.length === 0 || allYearsDataPengolahan.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Factory className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ringkasan Pengolahan & Pemasaran</h2>
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

    // Hitung total summary dan siapkan data untuk tabel
    const tableData = availableYears.map((year) => {
      const pemasaranYear = allYearsDataPemasaran.find((item) => item.tahun === year);
      const pengolahanYear = allYearsDataPengolahan.find((item) => item.tahun === year);
      return {
        tahun: year,
        unit_pemasaran: pemasaranYear?.total_unit || 0,
        pengecer: pemasaranYear?.total_pengecer || 0,
        pengumpul: pemasaranYear?.total_pengumpul || 0,
        unit_pengolahan: pengolahanYear?.total_unit || 0,
        fermentasi: pengolahanYear?.fermentasi || 0,
        pelumatan: pengolahanYear?.pelumatan_daging_ikan || 0,
        pembekuan: pengolahanYear?.pembekuan || 0,
        pemindangan: pengolahanYear?.pemindangan || 0,
        penanganan: pengolahanYear?.penanganan_produk_segar || 0,
        pengalengan: pengolahanYear?.pengalengan || 0,
        pengasapan: pengolahanYear?.pengasapan_pemanggangan || 0,
        pereduksian: pengolahanYear?.pereduksian_ekstraksi || 0,
        penggaraman: pengolahanYear?.penggaraman_pengeringan || 0,
        lainnya: pengolahanYear?.pengolahan_lainnya || 0,
      };
    });

    // Hitung total keseluruhan
    const totalPemasaran = tableData.reduce((sum, item) => sum + item.unit_pemasaran, 0);
    const totalPengolahan = tableData.reduce((sum, item) => sum + item.unit_pengolahan, 0);
    const totalPengecer = tableData.reduce((sum, item) => sum + item.pengecer, 0);
    const totalPengumpul = tableData.reduce((sum, item) => sum + item.pengumpul, 0);

    // Siapkan data untuk chart (diurutkan dari tahun terkecil ke terbesar)
    const chartData = [...availableYears]
      .sort((a, b) => a - b)
      .map((year) => {
        const pemasaranYear = allYearsDataPemasaran.find((item) => item.tahun === year);
        const pengolahanYear = allYearsDataPengolahan.find((item) => item.tahun === year);
        return {
          tahun: year,
          pemasaran: pemasaranYear?.total_unit || 0,
          pengolahan: pengolahanYear?.total_unit || 0,
        };
      });

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold mb-1">Ringkasan Pengolahan & Pemasaran</h1>
          <p className="text-blue-100 opacity-90">
            Perbandingan Data Tahun {availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
            {availableYears.length > 0 ? availableYears[0] : ''}
          </p>
        </div>

        <div className="p-6">
          {/* Tabel Perbandingan Tahun - DIPINDAH KE ATAS (TANPA CARD KPI) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Tabel Perbandingan Tahun</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {availableYears.length} Tahun Data
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th rowSpan={2} className="px-4 py-3 text-left text-sm font-semibold align-middle">Tahun</th>
                    <th colSpan={3} className="px-4 py-2 text-center text-sm font-semibold border-b border-blue-600">Pemasaran</th>
                    <th colSpan={10} className="px-4 py-2 text-center text-sm font-semibold border-b border-blue-600">Pengolahan (10 Jenis)</th>
                    <th rowSpan={2} className="px-4 py-3 text-right text-sm font-semibold">Total Pengolahan</th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pengecer</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pengumpul</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Total</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Fermentasi</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pelumatan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pembekuan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pemindangan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Penanganan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pengalengan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pengasapan</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Pereduksian</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Penggaraman</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Lainnya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.map((item) => (
                    <tr key={item.tahun} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.tahun}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pengecer)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pengumpul)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-purple-600 font-bold">
                        {formatNumber(item.unit_pemasaran)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.fermentasi)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pelumatan)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pembekuan)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pemindangan)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.penanganan)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pengalengan)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pengasapan)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.pereduksian)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.penggaraman)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(item.lainnya)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-orange-600 font-bold">
                        {formatNumber(item.unit_pengolahan)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-sm">TOTAL</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(totalPengecer)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(totalPengumpul)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-purple-600">
                      {formatNumber(totalPemasaran)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.fermentasi, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.pelumatan, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.pembekuan, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.pemindangan, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.penanganan, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.pengalengan, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.pengasapan, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.pereduksian, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.penggaraman, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(tableData.reduce((sum, item) => sum + item.lainnya, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">
                      {formatNumber(totalPengolahan)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <strong className="text-blue-800">Analisis:</strong> Tabel di atas menunjukkan perbandingan komprehensif antara unit pemasaran dan pengolahan dari tahun ke tahun.
            </p>
          </div>

          {/* Tren Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              Tren Unit Pemasaran & Pengolahan ({availableYears.length > 0 ? availableYears[availableYears.length - 1] : ''} -{' '}
              {availableYears.length > 0 ? availableYears[0] : ''})
            </h3>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 45, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="tahun"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Tahun', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatNumber(value)}
                    tick={{ fontSize: 11 }}
                    domain={[0, 'dataMax']}
                    label={{ value: 'Jumlah Unit', angle: -90, position: 'insideLeft', offset: 0 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), 'Unit']}
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
                    dataKey="pemasaran"
                    name="Unit Pemasaran"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pengolahan"
                    name="Unit Pengolahan"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ========================================
   BAR CHART COMPACT - 10 JENIS PENGOLAHAN
   ======================================== */}
<div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-bold text-gray-900">Visualisasi 10 Jenis Pengolahan</h3>
    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
      {availableYears.length} Tahun
    </span>
  </div>
  
  {/* Grid Layout - 4 Charts per Baris */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    
    {/* Chart 1: Fermentasi */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Fermentasi</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="fermentasi"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 2: Pelumatan Daging Ikan */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Pelumatan</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="pelumatan_daging_ikan"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 3: Pembekuan */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Pembekuan</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="pembekuan"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 4: Pemindangan */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Pemindangan</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="pemindangan"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 5: Penanganan Produk Segar */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Penanganan</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="penanganan_produk_segar"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 6: Pengalengan */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Pengalengan</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="pengalengan"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 7: Pengasapan/Pemanggangan */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Pengasapan</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="pengasapan_pemanggangan"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 8: Pereduksian/Ekstraksi */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Pereduksian</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="pereduksian_ekstraksi"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 9: Penggaraman/Pengeringan */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Penggaraman</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="penggaraman_pengeringan"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Chart 10: Pengolahan Lainnya */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-64">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Lainnya</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allYearsDataPengolahan} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="tahun"
              angle={-45}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Unit']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Tahun: ${label}`}
            />
            <Bar
              dataKey="pengolahan_lainnya"
              radius={[4, 4, 0, 0]}
              maxBarSize={70}
              label={{ position: 'top', formatter: (value: number) => formatNumber(value), fill: '#4b5563', fontSize: 10 }}
            >
              {allYearsDataPengolahan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

  </div>

  <p className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
    <strong className="text-blue-800">📊 Info:</strong> Visualisasi di atas menampilkan tren 10 jenis kegiatan pengolahan perikanan dari tahun ke tahun. Setiap chart menunjukkan jumlah unit untuk masing-masing jenis pengolahan dengan warna yang berbeda untuk setiap tahun.
  </p>
</div>

          {/* Pie Chart - Distribusi Jenis Pengolahan */}
          {allYearsDataPengolahan.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Distribusi Jenis Pengolahan ({allYearsDataPengolahan[0].tahun})
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Fermentasi', value: allYearsDataPengolahan[0].fermentasi },
                      { name: 'Pelumatan Daging Ikan', value: allYearsDataPengolahan[0].pelumatan_daging_ikan },
                      { name: 'Pembekuan', value: allYearsDataPengolahan[0].pembekuan },
                      { name: 'Pemindangan', value: allYearsDataPengolahan[0].pemindangan },
                      { name: 'Penanganan Produk Segar', value: allYearsDataPengolahan[0].penanganan_produk_segar },
                      { name: 'Pengalengan', value: allYearsDataPengolahan[0].pengalengan },
                      { name: 'Pengasapan/Pemanggangan', value: allYearsDataPengolahan[0].pengasapan_pemanggangan },
                      { name: 'Pereduksian/Ekstraksi', value: allYearsDataPengolahan[0].pereduksian_ekstraksi },
                      { name: 'Penggaraman/Pengeringan', value: allYearsDataPengolahan[0].penggaraman_pengeringan },
                      { name: 'Pengolahan Lainnya', value: allYearsDataPengolahan[0].pengolahan_lainnya },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                      '#6366f1', '#ef4444', '#14b8a6', '#f43f5e', '#94a3b8'
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Jumlah Unit']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // LOADING STATE
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
  // ERROR STATE
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

  // No data state
  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-2xl mx-auto">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Factory className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pengolahan & Pemasaran - {selectedYear}
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

  // ========================================
  // OVERVIEW VIEW - HANYA 2 CARD
  // ========================================
  if (!activeCard) {
    // Top 10 Kabupaten by Pemasaran
    const top10Pemasaran = [...data.pemasaran]
      .sort((a, b) => b.jumlah_unit - a.jumlah_unit)
      .slice(0, 10);

    // Top 10 Kabupaten by Pengolahan
    const top10Pengolahan = [...data.olahankab]
      .sort((a, b) => b.jumlah_unit - a.jumlah_unit)
      .slice(0, 10);

    return (
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6">
          {/* 2 Main Cards - HANYA INI YANG DITAMPILKAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Total Unit Pemasaran Card */}
            <div
              className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setActiveCard('pemasaran')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Total Unit Pemasaran</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(summary!.total_unit_pemasaran)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Unit
                  </p>
                </div>
              </div>
            </div>

            {/* Total Unit Pengolahan Card */}
            <div
              className="bg-white border-l-4 border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setActiveCard('olahan')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Factory className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Total Unit Pengolahan</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(summary!.total_unit_olahan)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Unit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Kabupaten by Pemasaran */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Kabupaten - Unit Pemasaran</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={top10Pemasaran} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="kab_kota"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), 'Unit']}
                    labelFormatter={(label) => `Kabupaten: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="jumlah_unit" name="Jumlah Unit" fill="#e69138" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 10 Kabupaten by Pengolahan */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Kabupaten - Unit Pengolahan</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={top10Pengolahan} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="kab_kota"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), 'Unit']}
                    labelFormatter={(label) => `Kabupaten: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="jumlah_unit" name="Jumlah Unit" fill="#3b8256" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // PEMASARAN VIEW
  // ========================================
  if (activeCard === 'pemasaran') {
    return (
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Data Pemasaran ({selectedYear})
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

          {/* SUMMARY VIEW */}
          {activeView === 'summary' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Pengecer</p>
                  <p className="text-4xl font-bold text-blue-900">{formatNumber(summary!.total_pengecer)}</p>
                  <p className="text-xs text-blue-600 mt-1">Unit</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Pengumpul</p>
                  <p className="text-4xl font-bold text-green-900">{formatNumber(summary!.total_pengumpul)}</p>
                  <p className="text-xs text-green-600 mt-1">Unit</p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Unit Pemasaran</p>
                  <p className="text-4xl font-bold text-purple-900">{formatNumber(summary!.total_unit_pemasaran)}</p>
                  <p className="text-xs text-purple-600 mt-1">Unit</p>
                </div>
              </div>

              {/* BAR CHART */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Perbandingan Total Pengecer vs Pengumpul ({selectedYear})
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={[
                      { name: 'Pengecer', value: summary!.total_pengecer, color: '#3b82f6' },
                      { name: 'Pengumpul', value: summary!.total_pengumpul, color: '#10b981' }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Jumlah Unit']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={150}
                    >
                      {[
                        { name: 'Pengecer', color: '#3b82f6' },
                        { name: 'Pengumpul', color: '#10b981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* PIE CHART */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Distribusi Persentase Pemasaran ({selectedYear})
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pengecer', value: summary!.total_pengecer },
                        { name: 'Pengumpul', value: summary!.total_pengumpul }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Jumlah Unit']}
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
                      formatter={(value) => (
                        <span className="text-sm font-medium text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TABLE VIEW */}
          {activeView === 'table' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">
                  Tabel Lengkap Data Pemasaran ({selectedYear})
                </h3>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.pemasaran.map((item) => ({
                        Kabupaten_Kota: item.kab_kota,
                        Pengecer: item.pengecer,
                        Pengumpul: item.pengumpul,
                        Jumlah_Unit: item.jumlah_unit,
                      })),
                      'Data_Pemasaran_Lengkap',
                      ['Kabupaten_Kota', 'Pengecer', 'Pengumpul', 'Jumlah_Unit']
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kabupaten/Kota</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pengecer</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pengumpul</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Unit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.pemasaran.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.kab_kota}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatNumber(item.pengecer)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatNumber(item.pengumpul)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{formatNumber(item.jumlah_unit)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-sm"></td>
                      <td className="px-6 py-4 text-sm">TOTAL</td>
                      <td className="px-6 py-4 text-sm text-right">{formatNumber(summary!.total_pengecer)}</td>
                      <td className="px-6 py-4 text-sm text-right">{formatNumber(summary!.total_pengumpul)}</td>
                      <td className="px-6 py-4 text-sm text-right">{formatNumber(summary!.total_unit_pemasaran)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // OLAHAN VIEW
  // ========================================
  if (activeCard === 'olahan') {
    // Hitung total untuk setiap jenis pengolahan se-provinsi
    const totalFermentasi = data.olahankab.reduce((sum, item) => sum + item.fermentasi, 0);
    const totalPelumatan = data.olahankab.reduce((sum, item) => sum + item.pelumatan_daging_ikan, 0);
    const totalPembekuan = data.olahankab.reduce((sum, item) => sum + item.pembekuan, 0);
    const totalPemindangan = data.olahankab.reduce((sum, item) => sum + item.pemindangan, 0);
    const totalPenanganan = data.olahankab.reduce((sum, item) => sum + item.penanganan_produk_segar, 0);
    const totalPengalengan = data.olahankab.reduce((sum, item) => sum + item.pengalengan, 0);
    const totalPengasapan = data.olahankab.reduce((sum, item) => sum + item.pengasapan_pemanggangan, 0);
    const totalPereduksian = data.olahankab.reduce((sum, item) => sum + item.pereduksian_ekstraksi, 0);
    const totalPenggaraman = data.olahankab.reduce((sum, item) => sum + item.penggaraman_pengeringan, 0);
    const totalLainnya = data.olahankab.reduce((sum, item) => sum + item.pengolahan_lainnya, 0);

    // Siapkan data untuk chart (diurutkan descending)
    const jenisPengolahanData = [
      { name: 'Fermentasi', value: totalFermentasi },
      { name: 'Pelumatan Daging Ikan', value: totalPelumatan },
      { name: 'Pembekuan', value: totalPembekuan },
      { name: 'Pemindangan', value: totalPemindangan },
      { name: 'Penanganan Produk Segar', value: totalPenanganan },
      { name: 'Pengalengan', value: totalPengalengan },
      { name: 'Pengasapan/Pemanggangan', value: totalPengasapan },
      { name: 'Pereduksian/Ekstraksi', value: totalPereduksian },
      { name: 'Penggaraman/Pengeringan', value: totalPenggaraman },
      { name: 'Pengolahan Lainnya', value: totalLainnya },
    ].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Overview
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Data Pengolahan ({selectedYear})
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

          {/* SUMMARY VIEW */}
          {activeView === 'summary' && (
            <div className="space-y-6">
              {/* Total Unit Pengolahan Card */}
              <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Unit Pengolahan</p>
                <p className="text-4xl font-bold text-orange-900">
                  {formatNumber(summary!.total_unit_olahan)}
                </p>
                <p className="text-xs text-orange-600 mt-1">Unit</p>
              </div>

              {/* BAR CHART */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Perbandingan Jenis Kegiatan Pengolahan ({selectedYear})
                </h3>
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart
                    data={jenisPengolahanData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 200, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={180}
                      tick={{ fontSize: 11, textAnchor: 'end' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Jumlah Unit']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#f97316"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* PIE CHART */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Distribusi Persentase Jenis Kegiatan ({selectedYear})
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={jenisPengolahanData.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Jumlah Unit']}
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
                      formatter={(value) => (
                        <span className="text-sm font-medium text-gray-700">{value}</span>
                      )}
                      wrapperStyle={{ paddingTop: '20px', maxHeight: '100px', overflowY: 'auto' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TABLE VIEW */}
          {activeView === 'table' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">
                  Tabel Lengkap Data Pengolahan ({selectedYear})
                </h3>
                <button
                  onClick={() =>
                    handleExportExcel(
                      data.olahankab.map((item) => ({
                        Kabupaten_Kota: item.kab_kota,
                        Fermentasi: item.fermentasi,
                        Pelumatan_Daging_Ikan: item.pelumatan_daging_ikan,
                        Pembekuan: item.pembekuan,
                        Pemindangan: item.pemindangan,
                        Penanganan_Produk_Segar: item.penanganan_produk_segar,
                        Pengalengan: item.pengalengan,
                        Pengasapan_Pemanggangan: item.pengasapan_pemanggangan,
                        Pereduksian_Ekstraksi: item.pereduksian_ekstraksi,
                        Penggaraman_Pengeringan: item.penggaraman_pengeringan,
                        Pengolahan_Lainnya: item.pengolahan_lainnya,
                        Jumlah_Unit: item.jumlah_unit,
                      })),
                      'Data_Pengolahan_Lengkap',
                      [
                        'Kabupaten_Kota',
                        'Fermentasi',
                        'Pelumatan_Daging_Ikan',
                        'Pembekuan',
                        'Pemindangan',
                        'Penanganan_Produk_Segar',
                        'Pengalengan',
                        'Pengasapan_Pemanggangan',
                        'Pereduksian_Ekstraksi',
                        'Penggaraman_Pengeringan',
                        'Pengolahan_Lainnya',
                        'Jumlah_Unit',
                      ]
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kabupaten/Kota</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fermentasi</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pelumatan Daging Ikan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pembekuan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pemindangan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Penanganan Produk Segar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pengalengan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pengasapan/Pemanggangan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pereduksian/Ekstraksi</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Penggaraman/Pengeringan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pengolahan Lainnya</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Unit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.olahankab.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.kab_kota}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.fermentasi)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pelumatan_daging_ikan)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pembekuan)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pemindangan)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.penanganan_produk_segar)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pengalengan)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pengasapan_pemanggangan)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pereduksian_ekstraksi)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.penggaraman_pengeringan)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(item.pengolahan_lainnya)}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-orange-600">{formatNumber(item.jumlah_unit)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm"></td>
                      <td className="px-4 py-3 text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalFermentasi)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPelumatan)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPembekuan)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPemindangan)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPenanganan)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPengalengan)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPengasapan)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPereduksian)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalPenggaraman)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(totalLainnya)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatNumber(summary!.total_unit_olahan)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}