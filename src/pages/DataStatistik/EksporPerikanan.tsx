// src/pages/DataStatistik/EksporPerikanan.tsx
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Table as TableIcon, 
  Download,
  TrendingUp,
  DollarSign,
  Package,
  ArrowLeft,
  MapPin,
  LineChart as LineChartIcon,
  Ship
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import type { DataStatistikBaseProps } from './types';
import { COLORS } from './types';
import { formatCurrency, formatNumber, formatTon } from './formatters';

// ========================================
// INTERFACES
// ========================================
interface EksporTotalItem {
  komoditas: string;
  volume_ton: number | null;
  nilai_usd: number | null;
}

interface EksporUtamaItem {
  tahun: number;
  sisi: string; // 'VOL' atau 'USD'
  no_urut: number;
  komoditas: string;
  angka: number;
}

interface EksporRingItem {
  tahun: number;
  urut: number | null;
  negara: string;
  jumlah_ton: number | null;
  nilai_usd: number | null;
}

interface EksporData {
  total: EksporTotalItem[];
  utama: EksporUtamaItem[];
  ring: EksporRingItem[];
}

// Interface untuk Select All mode
interface YearlyEksporSummary {
  tahun: number;
  total_volume: number;
  total_nilai_usd: number;
  komoditas: Array<{ komoditas: string; volume_ton: number; nilai_usd: number }>;
  komoditas_chart: Array<{ komoditas: string; volume_ton: number; nilai_usd: number }>;
  top_negara: Array<{ negara: string; jumlah_ton: number; nilai_usd: number }>;
}

type ActiveCard = 'komoditas' | 'volume' | 'nilai' | null;
type ActiveView = 'summary' | 'table';

function isAllOrNone(year: any): year is 'all' | null {
  return year === 'all' || year === null;
}

// ========================================
// CUSTOM TICK COMPONENT
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
export function EksporPerikanan({
  bidang,
  title,
  icon,
  color,
  selectedYear,
  onYearChange,
  onNavigate
}: DataStatistikBaseProps) {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [activeView, setActiveView] = useState<ActiveView>('summary');
  const [data, setData] = useState<EksporData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Select All mode
  const [allYearsData, setAllYearsData] = useState<YearlyEksporSummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Reset view when switching cards
  useEffect(() => {
    if (activeCard) {
      setActiveView('summary');
    }
  }, [activeCard]);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  
  // Get komoditas by sisi (VOL atau USD)
  const getKomoditasBySisi = (sisi: string): EksporUtamaItem[] => {
    if (!data?.utama) return [];
    return data.utama
      .filter(item => item.sisi === sisi)
      .sort((a, b) => a.no_urut - b.no_urut);
  };

  // Get total volume dari semua komoditas
  const getTotalVolume = (): number => {
    if (!data?.total) return 0;
    return data.total.reduce((sum, item) => sum + (item.volume_ton || 0), 0);
  };

  // Get total nilai USD dari semua komoditas
  const getTotalNilaiUSD = (): number => {
    if (!data?.total) return 0;
    return data.total.reduce((sum, item) => sum + (item.nilai_usd || 0), 0);
  };

  // Get total negara tujuan
  const getTotalNegara = (): number => {
    return data?.ring?.length || 0;
  };

  // Get top negara by volume
  const getTopNegaraByVolume = (limit: number = 10): EksporRingItem[] => {
    if (!data?.ring) return [];
    return [...data.ring]
      .filter(item => (item.jumlah_ton || 0) > 0)
      .sort((a, b) => (b.jumlah_ton || 0) - (a.jumlah_ton || 0))
      .slice(0, limit);
  };

  // Get top negara by nilai USD
  const getTopNegaraByNilai = (limit: number = 10): EksporRingItem[] => {
    if (!data?.ring) return [];
    return [...data.ring]
      .filter(item => (item.nilai_usd || 0) > 0)
      .sort((a, b) => (b.nilai_usd || 0) - (a.nilai_usd || 0))
      .slice(0, limit);
  };

  // ========================================
  // FETCH DATA
  // ========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isAllOrNone(selectedYear)) {
          // Fetch all years data for comparison dashboard
          const response = await fetch(
            '/samudata/api/ekspor_fetch_all.php',
            { credentials: 'include' }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (!result?.ok) {
            throw new Error(result?.error || 'Error dari server');
          }

          setAvailableYears(result.available_years || []);
          setAllYearsData(result.yearly_data || []);
          setData(null);
          setLoading(false);
        } else {
          // Fetch single year data
          const res = await fetch(
            `/samudata/api/ekspor_fetch.php?tahun=${selectedYear}`,
            { credentials: 'include' }
          );

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const json = await res.json();

          if (!json?.ok) {
            throw new Error(json?.error || 'Data tidak valid');
          }

          setData({
            total: json.total || [],
            utama: json.utama || [],
            ring: json.ring || []
          });
          setAllYearsData([]);
          setAvailableYears([]);
        }
      } catch (err: any) {
        console.error('Error fetching Ekspor data:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // ========================================
  // EXPORT EXCEL
  // ========================================
  const handleExportExcel = (dataToExport: any[], fileName: string, headers: string[]) => {
    import('xlsx').then((xlsx) => {
      const ws = xlsx.utils.aoa_to_sheet([headers, ...dataToExport.map((row) => Object.values(row))]);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Data');
      xlsx.writeFile(wb, `${fileName}_${selectedYear}.xlsx`);
    });
  };

  // ========================================
  // SELECT ALL VIEW - PERBANDINGAN ANTAR TAHUN
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
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      );
    }

    // ✅ PERBAIKAN: Gunakan allYearsData.length bukan allYearsDataPemasaran/Pengolahan
    if (availableYears.length === 0 || allYearsData.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ringkasan Ekspor Perikanan
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Tidak ada data statistik untuk perbandingan tahun.
            </p>
            <div className="bg-blue-50 text-blue-800 rounded-lg p-4 text-sm">
              <p className="font-medium">Informasi:</p>
              <p>Data akan ditampilkan setelah proses input data selesai dilakukan oleh administrator.</p>
            </div>
          </div>
        </div>
      );
    }

    // Siapkan data untuk line chart volume
    const volumeChartData = allYearsData.map(item => ({
      tahun: item.tahun,
      volume: item.total_volume
    })).sort((a, b) => a.tahun - b.tahun);

    // Siapkan data untuk line chart nilai USD
    const nilaiChartData = allYearsData.map(item => ({
      tahun: item.tahun,
      nilai: item.total_nilai_usd
    })).sort((a, b) => a.tahun - b.tahun);

    // Ambil SEMUA komoditas unik dari semua tahun (tidak dibatasi)
    const allKomoditasSet = new Set<string>();
    allYearsData.forEach(yearData => {
      yearData.komoditas.forEach(k => allKomoditasSet.add(k.komoditas));
    });
    const allKomoditas = Array.from(allKomoditasSet);

    // Hitung total volume untuk setiap komoditas
    const komoditasTotalMap = new Map<string, number>();
    allYearsData.forEach(yearData => {
      yearData.komoditas.forEach(k => {
        const current = komoditasTotalMap.get(k.komoditas) || 0;
        komoditasTotalMap.set(k.komoditas, current + (k.volume_ton || 0));
      });
    });

    // Urutkan semua komoditas berdasarkan total volume (descending)
    const sortedKomoditas = Array.from(komoditasTotalMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([komoditas, _]) => komoditas);

    // ✅ TAMPILKAN SEMUA KOMODITAS (tidak dibatasi)
    const allKomoditasSorted = sortedKomoditas;

    // Siapkan data untuk tabel perbandingan (SEMUA komoditas)
    const tableData = availableYears.map(tahun => {
      const yearData = allYearsData.find(y => y.tahun === tahun) || {
        total_volume: 0,
        total_nilai_usd: 0,
        komoditas: []
      };
      
      const komoditasMap = new Map(
        yearData.komoditas.map(k => [k.komoditas, { volume: k.volume_ton || 0, nilai: k.nilai_usd || 0 }])
      );
      
      return {
        tahun,
        total_volume: yearData.total_volume,
        total_nilai_usd: yearData.total_nilai_usd,
        ...Object.fromEntries(
          allKomoditasSorted.map(komoditas => [
            komoditas.replace(/\s+/g, '_').toLowerCase(),
            komoditasMap.get(komoditas)?.volume || 0
          ])
        )
      };
    });

    // Hitung total keseluruhan
    const totalVolumeAllYears = tableData.reduce((sum, item) => sum + item.total_volume, 0);
    const totalNilaiAllYears = tableData.reduce((sum, item) => sum + item.total_nilai_usd, 0);

    // Helper function untuk format currency dengan singkatan
    const formatCurrencyShort = (value: number): string => {
      if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
      return `$${value.toFixed(0)}`;
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold mb-1">Ringkasan Ekspor Perikanan</h1>
          <p className="text-blue-100 opacity-90">
            Perbandingan Data Tahun {Math.min(...availableYears)} - {Math.max(...availableYears)}
          </p>
        </div>
        
        <div className="p-6 space-y-8">
          
        {/* Tabel Perbandingan Komprehensif - SEMUA KOMODITAS */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Tabel Perbandingan Tahun - Semua Komoditas</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {availableYears.length} Tahun • {allKomoditasSorted.length} Komoditas
              </span>
            </div>
            
            <div className="overflow-x-auto">
              {/* Lebar minimum disesuaikan untuk 29+ komoditas */}
              <table className="w-full min-w-[3000px]">
                <thead className="bg-blue-700 text-white sticky top-0 z-10">
                  <tr>
                    <th rowSpan={2} className="px-4 py-3 text-left text-sm font-semibold align-middle whitespace-nowrap bg-blue-700">Tahun</th>
                    <th colSpan={2} className="px-4 py-2 text-center text-sm font-semibold border-b border-blue-600 bg-blue-700">Total</th>
                    <th colSpan={allKomoditasSorted.length} className="px-4 py-2 text-center text-sm font-semibold border-b border-blue-600 bg-blue-700">
                      Semua Komoditas ({allKomoditasSorted.length})
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-semibold whitespace-nowrap bg-blue-700">Volume (Ton)</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold whitespace-nowrap bg-blue-700">Nilai (USD)</th>
                    {allKomoditasSorted.map((komoditas, idx) => (
                      <th 
                        key={`kom-${idx}`} 
                        className="px-3 py-2 text-right text-xs font-semibold whitespace-nowrap max-w-[150px] bg-blue-700"
                        title={komoditas}
                      >
                        {komoditas}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.map((item) => (
                    <tr key={item.tahun} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.tahun}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-700">
                        {formatTon(item.total_volume)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-red-700">
                        {formatCurrency(item.total_nilai_usd)}
                      </td>
                      {allKomoditasSorted.map((komoditas, idx) => {
                        const key = komoditas.replace(/\s+/g, '_').toLowerCase();
                        const value = item[key as keyof typeof item] as number;
                        return (
                          <td 
                            key={`cell-${item.tahun}-${idx}`} 
                            className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-900 max-w-[150px]"
                            title={`${komoditas}: ${formatTon(value)}`}
                          >
                            {value > 0 ? formatTon(value) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold sticky bottom-0 z-10">
                  <tr>
                    <td className="px-4 py-3 text-sm">TOTAL</td>
                    <td className="px-4 py-3 text-sm text-right text-green-800">
                      {formatTon(tableData.reduce((sum, item) => sum + item.total_volume, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-800">
                      {formatCurrency(tableData.reduce((sum, item) => sum + item.total_nilai_usd, 0))}
                    </td>
                    {allKomoditasSorted.map((komoditas, idx) => {
                      const key = komoditas.replace(/\s+/g, '_').toLowerCase();
                      return (
                        <td 
                          key={`total-${idx}`} 
                          className="px-3 py-3 text-sm text-right"
                        >
                          {formatTon(tableData.reduce((sum, item) => sum + (item[key as keyof typeof item] as number), 0))}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Line Chart Volume */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Perbandingan Volume Ekspor ({Math.min(...availableYears)} - {Math.max(...availableYears)})
            </h3>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeChartData} margin={{ top: 20, right: 30, left: 45, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="tahun"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Tahun', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={formatTon}
                    tick={{ fontSize: 11 }}
                    domain={[0, 'dataMax']}
                    label={{ 
                      value: 'Volume (Ton)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      offset: 0,
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatTon(value), 'Volume']}
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
                    dataKey="volume"
                    name="Volume Ekspor"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
              <strong className="text-green-800"> Analisis:</strong> Grafik di atas menunjukkan tren volume ekspor perikanan dari tahun ke tahun. Peningkatan volume menunjukkan ekspansi pasar ekspor.
            </p>
          </div>

          {/* Line Chart Nilai USD */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-red-600 mr-2" />
              Perbandingan Nilai Ekspor ({Math.min(...availableYears)} - {Math.max(...availableYears)})
            </h3>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nilaiChartData} margin={{ top: 20, right: 30, left: 45, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="tahun"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Tahun', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={formatCurrencyShort}
                    tick={{ fontSize: 11 }}
                    domain={[0, 'dataMax']}
                    label={{ 
                      value: 'Nilai (USD)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      offset: 0,
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Nilai USD']}
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
                    dataKey="nilai"
                    name="Nilai Ekspor"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-gray-600 bg-red-50 p-4 rounded-lg">
              <strong className="text-red-800"> Analisis:</strong> Grafik di atas menunjukkan tren nilai ekspor dalam USD. Perubahan nilai tidak selalu sejalan dengan volume karena dipengaruhi harga komoditas global.
            </p>
          </div>

          {/* Visualisasi Komposisi Komoditas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              Komposisi Komoditas Ekspor per Tahun
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allYearsData.slice(0, 6).map((yearData) => (
                <div key={yearData.tahun} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-bold text-center mb-3 text-gray-900">
                    Tahun {yearData.tahun}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={yearData.komoditas_chart}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={1}
                          dataKey="volume_ton"
                          nameKey="komoditas"
                          labelLine={false}
                        >
                          {yearData.komoditas_chart.map((entry, index) => (
                            <Cell 
                              key={`cell-${yearData.tahun}-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [formatTon(value), 'Volume (Ton)']} 
                          labelFormatter={(label) => `Komoditas: ${label}`}
                        />
                        <Legend 
                          layout="horizontal" 
                          align="center" 
                          verticalAlign="bottom" 
                          height={60}
                          wrapperStyle={{ fontSize: '10px', overflow: 'hidden' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Total: <span className="font-bold text-green-700">{formatTon(yearData.total_volume)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {allYearsData.length > 6 && (
              <div className="mt-4 text-center text-sm text-gray-600 italic">
                Menampilkan {Math.min(6, allYearsData.length)} dari {allYearsData.length} tahun terakhir
              </div>
            )}
            
            <p className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <strong className="text-blue-800">Insight:</strong> Visualisasi pie chart di atas menunjukkan komposisi komoditas ekspor untuk setiap tahun. 
              Perubahan proporsi komoditas dari tahun ke tahun mencerminkan dinamika permintaan pasar global dan kebijakan ekspor.
            </p>
          </div>
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
          <p className="text-gray-600">Memuat data Ekspor Perikanan {selectedYear}...</p>
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
        <p className="text-gray-600 mb-4">{error}</p>
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
// NO DATA STATE
// ========================================
if (!data || (data.total.length === 0 && data.utama.length === 0 && data.ring.length === 0)) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <Ship className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ekspor Perikanan - {selectedYear}
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
  // MAIN RENDER - OVERVIEW (3 CARDS)
  // ========================================
  if (!activeCard) {
    return (
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6">
          {/* 3 Cards Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Komoditas Utama */}
            <div
              onClick={() => setActiveCard('komoditas')}
              className="cursor-pointer rounded-lg shadow p-6 border-l-4 border-blue-600 bg-blue-50 hover:shadow-md transition-shadow"
            >
              <div className="bg-blue-100 p-3 rounded-lg mb-4">
                <Package className="w-8 h-8 mx-auto text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-3">
                Komoditas Utama Ekspor
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Total Komoditas</p>
                  <p className="text-4xl font-bold text-blue-900">
                    {formatNumber(data.total.length)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Jenis Komoditas</p>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600">Top Komoditas (Volume)</p>
                  <p className="text-lg font-bold text-gray-900">
                    {getKomoditasBySisi('VOL')[0]?.komoditas || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Volume */}
            <div
              onClick={() => setActiveCard('volume')}
              className="cursor-pointer rounded-lg shadow p-6 border-l-4 border-blue-600 bg-blue-50 hover:shadow-md transition-shadow"
            >
              <div className="bg-blue-100 p-3 rounded-lg mb-4">
                <TrendingUp className="w-8 h-8 mx-auto text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-3">
                Volume Ekspor
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Total Volume</p>
                  <p className="text-4xl font-bold text-blue-900">
                    {formatTon(getTotalVolume())}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Ton</p>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600">Negara Tujuan</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(getTotalNegara())}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Negara</p>
                </div>
              </div>
            </div>

            {/* Card 3: Nilai */}
            <div
              onClick={() => setActiveCard('nilai')}
              className="cursor-pointer rounded-lg shadow p-6 border-l-4 border-blue-600 bg-blue-50 hover:shadow-md transition-shadow"
            >
              <div className="bg-blue-100 p-3 rounded-lg mb-4">
                <DollarSign className="w-8 h-8 mx-auto text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-3">
                Nilai Ekspor
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Total Nilai</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatCurrency(getTotalNilaiUSD())}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">USD</p>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600">Top Negara (Nilai)</p>
                  <p className="text-lg font-bold text-gray-900">
                    {getTopNegaraByNilai(1)[0]?.negara || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visualisasi Tambahan */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart Top 5 Komoditas by Volume */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Top 5 Komoditas by Volume ({selectedYear})
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getKomoditasBySisi('VOL').slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="angka"
                    nameKey="komoditas"
                    label={({ komoditas, percent }) => `${komoditas}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {COLORS.slice(0, 5).map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatTon(value), 'Volume (Ton)']} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart Top 5 Negara by Volume */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Top 5 Negara Tujuan by Volume ({selectedYear})
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getTopNegaraByVolume(5)}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={formatTon} />
                  <YAxis dataKey="negara" type="category" width={120} />
                  <Tooltip formatter={(value: number) => [formatTon(value), 'Volume (Ton)']} />
                  <Bar dataKey="jumlah_ton" fill="#3c78d8" name="Volume (Ton)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // DETAIL VIEW: KOMODITAS UTAMA
  // ========================================
  if (activeCard === 'komoditas') {
    const komoditasVol = getKomoditasBySisi('VOL');
    const komoditasUSD = getKomoditasBySisi('USD');

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setActiveCard(null)}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Overview
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Detail Komoditas Utama Ekspor ({selectedYear})
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

        {activeView === 'summary' && (
          <div className="space-y-6">
            {/* Volume Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Volume Ekspor per Komoditas ({selectedYear})
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={komoditasVol}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
                      value: 'Volume (Ton)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#4b5563',
                      style: { textAnchor: 'middle' }
                    }}
                    width={150}
                  />
                  <Tooltip formatter={(value: number) => [formatTon(value), 'Volume']} />
                  <Legend />
                  <Bar dataKey="angka" fill="#3B82F6" name="Volume (Ton)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Nilai USD Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Nilai Ekspor per Komoditas ({selectedYear})
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={komoditasUSD}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="komoditas"
                    tick={<CustomXAxisTick />}
                    height={80}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    label={{
                      value: 'Nilai (USD)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#4b5563',
                      style: { textAnchor: 'middle' }
                    }}
                    width={150}
                  />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Nilai']} />
                  <Legend />
                  <Bar dataKey="angka" fill="#EF4444" name="Nilai (USD)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'table' && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold text-gray-900 text-lg">
                Tabel Statistik Komoditas Ekspor ({selectedYear})
              </h4>
              <button
                onClick={() => {
                  const tableData = data.total.map((item, idx) => ({
                    No: idx + 1,
                    Komoditas: item.komoditas,
                    Volume_Ton: item.volume_ton || 0,
                    Nilai_USD: item.nilai_usd || 0,
                  }));
                  handleExportExcel(
                    tableData,
                    'Komoditas_Ekspor',
                    ['No', 'Komoditas', 'Volume_Ton', 'Nilai_USD']
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Komoditas</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Volume (Ton)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Nilai (USD)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.total.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.komoditas}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatTon(item.volume_ton || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(item.nilai_usd || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================
  // DETAIL VIEW: VOLUME
  // ========================================
  if (activeCard === 'volume') {
    const topNegaraVolume = getTopNegaraByVolume(10);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setActiveCard(null)}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Overview
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Detail Volume Ekspor ({selectedYear})
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

        {activeView === 'summary' && (
          <div className="space-y-6">
            {/* Total Volume Card */}
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Volume Ekspor</p>
              <p className="text-5xl font-bold text-green-900">
                {formatTon(getTotalVolume())}
              </p>
              <p className="text-xs text-green-700 mt-1">Ton</p>
            </div>

            {/* Bar Chart Top 10 Negara */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Top 10 Negara Tujuan by Volume ({selectedYear})
              </h4>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart
                  data={topNegaraVolume}
                  layout="vertical"
                  margin={{ left: 150 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={formatTon} />
                  <YAxis dataKey="negara" type="category" width={150} />
                  <Tooltip formatter={(value: number) => [formatTon(value), 'Volume (Ton)']} />
                  <Legend />
                  <Bar dataKey="jumlah_ton" fill="#10B981" name="Volume (Ton)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart Distribusi Negara */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Distribusi Volume per Negara ({selectedYear})
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={topNegaraVolume}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={150}
                    paddingAngle={2}
                    dataKey="jumlah_ton"
                    nameKey="negara"
                    label={({ negara, percent }) => `${negara}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatTon(value), 'Volume (Ton)']} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'table' && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold text-gray-900 text-lg">
                Tabel Statistik Volume Ekspor per Negara ({selectedYear})
              </h4>
              <button
                onClick={() => {
                  const tableData = data.ring.map((item, idx) => ({
                    No: idx + 1,
                    Negara: item.negara,
                    Volume_Ton: item.jumlah_ton || 0,
                    Nilai_USD: item.nilai_usd || 0,
                  }));
                  handleExportExcel(
                    tableData,
                    'Volume_Ekspor_Negara',
                    ['No', 'Negara', 'Volume_Ton', 'Nilai_USD']
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Negara</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Volume (Ton)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Nilai (USD)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.ring.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.negara}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatTon(item.jumlah_ton || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(item.nilai_usd || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================
  // DETAIL VIEW: NILAI
  // ========================================
  if (activeCard === 'nilai') {
    const topNegaraNilai = getTopNegaraByNilai(10);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setActiveCard(null)}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Overview
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Detail Nilai Ekspor ({selectedYear})
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

        {activeView === 'summary' && (
          <div className="space-y-6">
            {/* Total Nilai Card */}
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Nilai Ekspor</p>
              <p className="text-4xl font-bold text-red-900">
                {formatCurrency(getTotalNilaiUSD())}
              </p>
              <p className="text-xs text-red-700 mt-1">USD</p>
            </div>

            {/* Bar Chart Top 10 Negara by Nilai */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Top 10 Negara Tujuan by Nilai ({selectedYear})
              </h4>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart
                  data={topNegaraNilai}
                  layout="vertical"
                  margin={{ left: 150 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis dataKey="negara" type="category" width={150} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Nilai (USD)']} />
                  <Legend />
                  <Bar dataKey="nilai_usd" fill="#EF4444" name="Nilai (USD)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart Distribusi Nilai */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Distribusi Nilai per Negara ({selectedYear})
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={topNegaraNilai}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={150}
                    paddingAngle={2}
                    dataKey="nilai_usd"
                    nameKey="negara"
                    label={({ negara, percent }) => `${negara}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Nilai (USD)']} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'table' && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-bold text-gray-900 text-lg">
                Tabel Statistik Nilai Ekspor per Negara ({selectedYear})
              </h4>
              <button
                onClick={() => {
                  const tableData = data.ring
                    .sort((a, b) => (b.nilai_usd || 0) - (a.nilai_usd || 0))
                    .map((item, idx) => ({
                      No: idx + 1,
                      Negara: item.negara,
                      Volume_Ton: item.jumlah_ton || 0,
                      Nilai_USD: item.nilai_usd || 0,
                    }));
                  handleExportExcel(
                    tableData,
                    'Nilai_Ekspor_Negara',
                    ['No', 'Negara', 'Volume_Ton', 'Nilai_USD']
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Negara</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Volume (Ton)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Nilai (USD)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.ring
                    .sort((a, b) => (b.nilai_usd || 0) - (a.nilai_usd || 0))
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.negara}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatTon(item.jumlah_ton || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(item.nilai_usd || 0)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}