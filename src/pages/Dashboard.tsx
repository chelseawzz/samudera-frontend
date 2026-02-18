import { DashboardHeader } from '../pages/DashboardHeader';
import { Footer } from '../pages/Footer';
import { StatCard } from '../pages/StatCard';
import { Fish, Waves, Ship, TrendingUp, Factory, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import NilaiBulanan from "../pages/tangkap/NilaiBulanan";
import JatimMap from '../pages/JatimMap';

// ===== TYPE DEFINITIONS =====
interface City {
  name: string;
  x: number;
  y: number;
  komoditas: string;
  volume: number;
}

interface User {
  role: 'admin' | 'user';
  username: string;
  email: string;
}

interface DashboardProps {
  onNavigate: (page: string, bidang?: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
  user: User | null;
}

interface RingkasanItem {
  'CABANG USAHA': string;
  'Nelayan (Orang)': number;
  'RTP/PP (Orang/Unit)': number;
  'Armada Perikanan (Buah)': number;
  'Alat Tangkap (Unit)': number;
  'Volume (Ton)': number;
  'Nilai (Rp 1.000)': number;
}

interface MatrixRow {
  Wilayah: string;
  'JUMLAH - Total': number;
  'Laut - Non Pelabuhan': number;
  'Perairan Umum - Open Water': number;
  [key: string]: any;
}

interface DashboardAPIResponse {
  ringkasan: RingkasanItem[];
  matrix: {
    subsectors: string[];
    rows: MatrixRow[];
  };
  volume_bulanan: Array<{
    Uraian: string;
    Januari: number; Februari: number; Maret: number; April: number; Mei: number; Juni: number;
    Juli: number; Agustus: number; September: number; Oktober: number; November: number; Desember: number;
    Jumlah: number;
  }>;
  nilai_bulanan: Array<{
    Uraian: string;
    Januari: number; Februari: number; Maret: number; April: number; Mei: number; Juni: number;
    Juli: number; Agustus: number; September: number; Oktober: number; November: number; Desember: number;
    Jumlah: number;
  }>;
  komoditas: Array<{
    no: number | null;
    komoditas: string;
    volume: string;
    is_sub: number;
    is_note: number;
  }>;
}

export default function Dashboard({ onNavigate, isAdmin, onLogout, user}: DashboardProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [dashboardData, setDashboardData] = useState<DashboardAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== FETCH DATA DARI API =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost/samudata/api/tangkap_fetch.php?tahun=${selectedYear}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: DashboardAPIResponse = await response.json();
        console.log("Dashboard Data:", data);
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // ===== HELPER FUNCTIONS =====
  const calculateTotalVolume = (): number => {
    if (!dashboardData?.ringkasan) return 0;
    
    return dashboardData.ringkasan.reduce((total, item) => {
      return total + (item['Volume (Ton)'] || 0);
    }, 0);
  };

  const calculateTotalNilai = (): number => {
    if (!dashboardData?.ringkasan) return 0;
    
    return dashboardData.ringkasan.reduce((total, item) => {
      return total + (item['Nilai (Rp 1.000)'] || 0);
    }, 0);
  };

  const calculateTotalNelayan = (): number => {
    if (!dashboardData?.ringkasan) return 0;
    
    return dashboardData.ringkasan.reduce((total, item) => {
      return total + (item['Nelayan (Orang)'] || 0);
    }, 0);
  };

  const calculateTotalArmada = (): number => {
    if (!dashboardData?.ringkasan) return 0;
    
    return dashboardData.ringkasan.reduce((total, item) => {
      return total + (item['Armada Perikanan (Buah)'] || 0);
    }, 0);
  };

  // ===== STATISTIK DENGAN DATA REAL =====
  const stats = [
    {
      title: 'Perikanan Tangkap',
      value: loading ? '...' : dashboardData ? 
        (calculateTotalVolume() / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : 
        '0',
      unit: 'rb ton',
      icon: Fish,
      color: 'border-blue-500',
      id: 'perikanan-tangkap'
    },
    {
      title: 'Total Nelayan',
      value: loading ? '...' : dashboardData ? 
        calculateTotalNelayan().toLocaleString('id-ID') : 
        '0',
      unit: 'orang',
      icon: Waves,
      color: 'border-cyan-500',
      id: 'total-nelayan'
    },
    {
      title: 'Armada Perikanan',
      value: loading ? '...' : dashboardData ? 
        calculateTotalArmada().toLocaleString('id-ID') : 
        '0',
      unit: 'unit',
      icon: Ship,
      color: 'border-orange-500',
      id: 'armada'
    },
    {
      title: 'Nilai Produksi',
      value: loading ? '...' : dashboardData ? 
        `Rp ${(calculateTotalNilai() / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}` : 
        '0',
      unit: 'miliar',
      icon: TrendingUp,
      color: 'border-green-500',
      id: 'nilai-produksi'
    },
    {
      title: 'Total Wilayah',
      value: loading ? '...' : dashboardData?.matrix?.rows?.length?.toString() || '0',
      unit: 'kab/kota',
      icon: Factory,
      color: 'border-purple-500',
      id: 'kabupaten'
    },
    {
      title: 'Tahun Data',
      value: selectedYear,
      unit: '',
      icon: Package,
      color: 'border-red-500',
      id: 'tahun-data'
    },
  ];

  // ===== KOTA DENGAN TIPE YANG JELAS =====
  const cities: City[] = dashboardData?.matrix?.rows?.map((row) => {
    // Cari komoditas utama untuk wilayah ini
    const komoditasList = dashboardData.komoditas
      ?.filter(k => k.is_sub === 1 && k.komoditas === row.Wilayah)
      .map(k => k.komoditas) || [];
    
    // Generate koordinat berdasarkan nama wilayah (untuk demo visual)
    const nameHash = row.Wilayah.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const x = 20 + (nameHash % 60); // 20-80
    const y = 30 + ((nameHash * 7) % 40); // 30-70
    
    return {
      name: row.Wilayah,
      x,
      y,
      komoditas: komoditasList.length > 0 
        ? komoditasList.slice(0, 2).join(', ') 
        : 'Data komoditas tidak tersedia',
      volume: row['JUMLAH - Total'] || 0
    };
  }) || [
    // Fallback dengan tipe City yang konsisten
    { name: 'Surabaya', x: 65, y: 45, komoditas: 'Ikan Kerapu, Udang', volume: 0 },
    { name: 'Malang', x: 50, y: 60, komoditas: 'Ikan Nila, Lele', volume: 0 },
    { name: 'Banyuwangi', x: 85, y: 70, komoditas: 'Ikan Tuna, Cakalang', volume: 0 },
    { name: 'Situbondo', x: 80, y: 50, komoditas: 'Ikan Tongkol, Kembung', volume: 0 },
    { name: 'Probolinggo', x: 70, y: 40, komoditas: 'Ikan Bandeng, Udang', volume: 0 },
    { name: 'Pasuruan', x: 60, y: 48, komoditas: 'Ikan Kakap, Kerapu', volume: 0 },
    { name: 'Sidoarjo', x: 58, y: 52, komoditas: 'Udang Vannamei, Bandeng', volume: 0 },
    { name: 'Gresik', x: 55, y: 38, komoditas: 'Ikan Kakap, Bandeng', volume: 0 },
    { name: 'Lamongan', x: 45, y: 35, komoditas: 'Ikan Bandeng, Udang', volume: 0 },
    { name: 'Tuban', x: 35, y: 30, komoditas: 'Ikan Tongkol, Layur', volume: 0 },
  ];

  // ===== ERROR HANDLING =====
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Muat Ulang Halaman
            </button>
            <button 
              onClick={() => setError(null)}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="dashboard" onNavigate={onNavigate} isAdmin={isAdmin} onLogout={onLogout} />
      
      {/* Full Page Map Container */}
      <div className="h-[calc(100vh-72px)] w-full">
        <JatimMap />
        
      </div>
      
      <Footer />
    </div>
  );
}