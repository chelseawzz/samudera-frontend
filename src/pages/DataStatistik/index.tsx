// src/pages/DataStatistik/index.tsx
import { useState, useEffect } from 'react';
import { 
  Fish, 
  Shrimp, 
  Anchor, 
  Factory, 
  Ship, 
  DollarSign,
  Box
} from 'lucide-react';
import { PerikananTangkap } from './PerikananTangkap';
import { PerikananBudidaya } from './PerikananBudidaya';
import { KPP } from './KPP';
import { PengolahanPemasaran } from './PengolahanPemasaran';
import { EksporPerikanan } from './EksporPerikanan';
import { InvestasiKelautan } from './InvestasiKelautan';
import { DashboardHeader } from '../DashboardHeader';
import { Footer } from '../Footer';
import { ArrowLeft } from 'lucide-react';
import { type DataStatistikBaseProps, YEARS, type SelectedYearType } from './types';

interface User {
  role: 'admin' | 'user';
  username: string;
  email: string;
}

interface DataStatistikProps {
  bidang: string;
  onNavigate: (page: string, bidang?: string, year?: SelectedYearType) => void;
  isAdmin: boolean;
  onLogout: () => void;
  user: User | null;
  initialYear?: SelectedYearType;
}

// Helper function untuk mendapatkan ikon header yang profesional
const getHeaderIcon = (bidang: string, size: number = 48) => {
  const iconProps = { 
    className: "flex-shrink-0", 
    width: size, 
    height: size 
  };
  
  switch(bidang) {
    case 'perikanan-tangkap':
      return <Fish {...iconProps} className="text-blue-600" />;
    case 'perikanan-budidaya':
      return <Shrimp {...iconProps} className="text-blue-600" />;
    case 'garam':
      return <Anchor {...iconProps} className="text-blue-600" />;
    case 'pengolahan-pemasaran':
      return <Factory {...iconProps} className="text-blue-600" />;
    case 'ekspor':
      return <Ship {...iconProps} className="text-blue-600" />;
    case 'investasi':
      return <DollarSign {...iconProps} className="text-blue-600" />;
    default:
      return <Box {...iconProps} className="text-gray-400" />;
  }
};

// Helper function untuk mendapatkan warna yang sesuai bidang
const getBidangColor = (bidang: string): string => {
  switch(bidang) {
    case 'perikanan-tangkap': return '#3b82f6';
    case 'perikanan-budidaya': return '#3b82f6';
    case 'garam': return '#3b82f6'; 
    case 'pengolahan-pemasaran': return '#3b82f6'; 
    case 'ekspor': return '#3b82f6'; 
    case 'investasi': return '#3b82f6'; 
    default: return '#3b82f6'; 
  }
};

export function DataStatistik({ 
  bidang, 
  onNavigate, 
  isAdmin, 
  onLogout,
  initialYear = 'all',
}: DataStatistikProps) {
  // ===== STATE DENGAN DEFAULT 'all' DAN PERSISTENSI =====
  const [selectedYear, setSelectedYear] = useState<SelectedYearType>(() => {
    // Load dari localStorage saat pertama kali mount
    const savedYear = localStorage.getItem(`year_${bidang}`);
    if (savedYear) {
      if (savedYear === 'all') return 'all';
      if (savedYear === 'null') return null;
      return Number(savedYear);
    }
    // Default ke 'all' jika tidak ada data tersimpan
    return initialYear;
  });

  // ===== SIMPAN KE LOCALSTORAGE SAAT BIDANG ATAU TAHUN BERUBAH =====
  useEffect(() => {
    // Simpan tahun ke localStorage saat berubah
    if (selectedYear !== undefined) {
      localStorage.setItem(`year_${bidang}`, selectedYear?.toString() || 'null');
    }
  }, [selectedYear, bidang]);

  // Konfigurasi bidang dengan metadata lengkap
  const bidangConfig = {
    'perikanan-tangkap': {
      title: 'Perikanan Tangkap',
      description: 'Data statistik perikanan tangkap',
      color: getBidangColor('perikanan-tangkap')
    },
    'perikanan-budidaya': {
      title: 'Perikanan Budidaya',
      description: 'Data statistik perikanan budidaya',
      color: getBidangColor('perikanan-budidaya')
    },
    'garam': {
      title: 'KPP (Garam)',
      description: 'Data statistik komoditas garam',
      color: getBidangColor('garam')
    },
    'pengolahan-pemasaran': {
      title: 'Pengolahan & Pemasaran',
      description: 'Data statistik pengolahan dan pemasaran',
      color: getBidangColor('pengolahan-pemasaran')
    },
    'ekspor': {
      title: 'Ekspor Perikanan',
      description: 'Data statistik ekspor komoditas perikanan',
      color: getBidangColor('ekspor')
    },
    'investasi': {
      title: 'Investasi Kelautan',
      description: 'Data statistik investasi sektor kelautan',
      color: getBidangColor('investasi')
    },
  };

  const config = bidangConfig[bidang as keyof typeof bidangConfig] || {
    title: 'Data Statistik',
    description: 'Data statistik sektor kelautan dan perikanan',
    color: '#64748b'
  };

  // Render component berdasarkan bidang
  const renderBidangComponent = () => {
    switch(bidang) {
      case 'perikanan-tangkap':
        return (
          <PerikananTangkap 
            bidang={bidang}
            title={config.title}
            icon="fish"
            color={config.color}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onNavigate={(page: string, bidang?: string, year?: SelectedYearType) => 
              onNavigate(page, bidang, year)
            }
          />
        );
      case 'perikanan-budidaya':
        return (
          <PerikananBudidaya 
            bidang={bidang}
            title={config.title}
            icon="Shrimp"
            color={config.color}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onNavigate={(page: string, bidang?: string, year?: SelectedYearType) => 
              onNavigate(page, bidang, year)
            }
          />
        );
      case 'garam':
        return (
          <KPP 
            bidang={bidang}
            title={config.title}
            icon="anchor"
            color={config.color}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onNavigate={(page: string, bidang?: string, year?: SelectedYearType) => 
              onNavigate(page, bidang, year)
            }
          />
        );
      case 'pengolahan-pemasaran':
        return (
          <PengolahanPemasaran 
            bidang={bidang}
            title={config.title}
            icon="factory"
            color={config.color}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onNavigate={(page: string, bidang?: string, year?: SelectedYearType) => 
              onNavigate(page, bidang, year)
            }
          />
        );
      case 'ekspor':
        return (
          <EksporPerikanan 
            bidang={bidang}
            title={config.title}
            icon="ship"
            color={config.color}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onNavigate={(page: string, bidang?: string, year?: SelectedYearType) => 
              onNavigate(page, bidang, year)
            }
          />
        );
      case 'investasi':
        return (
          <InvestasiKelautan 
            bidang={bidang}
            title={config.title}
            icon="dollar-sign"
            color={config.color}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onNavigate={(page: string, bidang?: string, year?: SelectedYearType) => 
              onNavigate(page, bidang, year)
            }
          />
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Bidang tidak ditemukan</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage={bidang} onNavigate={onNavigate} isAdmin={isAdmin} onLogout={onLogout} />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 sm:p-6 mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Dashboard</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* IKON PROFESIONAL DENGAN BACKGROUND CIRCLE */}
              <div 
                className="flex items-center justify-center w-16 h-16 rounded-2xl" 
                style={{ backgroundColor: `${config.color}10` }} // 10% opacity
              >
                {getHeaderIcon(bidang, 32)}
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {config.title}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  {selectedYear === 'all' || selectedYear === null
                    ? 'Ringkasan Data Semua Tahun'
                    : `Data Statistik Tahun ${selectedYear}`}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {config.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dropdown Tahun dengan Desain Profesional */}
              <div className="relative">
                <select
                  value={selectedYear?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'all') {
                      setSelectedYear('all');
                    } else if (value === '') {
                      setSelectedYear(null);
                    } else {
                      setSelectedYear(Number(value));
                    }
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-xl py-2.5 px-4 pr-10 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-400 transition-all w-full sm:w-auto"
                >
                  <option value="all">Select All</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Render Bidang Component */}
        {renderBidangComponent()}
      </div>
      <Footer />
    </div>
  );
}