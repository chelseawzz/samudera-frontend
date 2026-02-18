import Header from './Header';          
import { Footer } from './Footer';     
import { StatCard } from './StatCard'; 
import { StatPortraitCard } from './StatPortraitCard';

import { Fish, Waves, Factory, Package, Ship, TrendingUp, MapPin, ChevronDown, Loader } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

interface StatData {
  title: string;
  value: string;
  unit: string;
  image: string;
  id: string;
  description: string;
  loading?: boolean;
  navigateTo: string;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const tentangRef = useRef<HTMLElement>(null);
  const panduanRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  const [stats, setStats] = useState<StatData[]>([
    {
      title: 'Perikanan Tangkap',
      value: '-',
      unit: 'ton',
      image: '/tangkap.jpg',
      id: 'perikanan-tangkap',
      description: 'Produksi hasil laut dari aktivitas penangkapan',
      loading: true,
      navigateTo: 'perikanan-tangkap'
    },
    {
      title: 'Perikanan Budidaya',
      value: '-',
      unit: 'ton',
      image: '/budidaya.jpg',
      id: 'perikanan-budidaya',
      description: 'Produksi perikanan hasil budidaya',
      loading: true,
      navigateTo: 'perikanan-budidaya'
    },
    {
      title: 'Garam (KPP)',
      value: '-',
      unit: 'ton',
      image: '/garam.jpg',
      id: 'garam',
      description: 'Produksi garam rakyat dan industri',
      loading: true,
      navigateTo: 'garamn'
    },
    {
      title: 'Pengolahan & Pemasaran',
      value: '-',
      unit: 'unit',
      image: '/pengolahan.jpg',
      id: 'pengolahan-pemasaran',
      description: 'Produk olahan hasil perikanan',
      loading: true,
      navigateTo: 'pengolahan-pemasaran'
    },
    {
      title: 'Ekspor Perikanan',
      value: '-',
      unit: 'ton',
      image: '/ekspor.jpg',
      id: 'ekspor',
      description: 'Volume ekspor perikanan Jawa Timur',
      loading: true,
      navigateTo: 'ekspor'
    },
    {
      title: 'Investasi Kelautan',
      value: '-',
      unit: 'Rp',
      image: '/investasi.jpg',
      id: 'investasi',
      description: 'Total investasi sektor kelautan',
      loading: true,
      navigateTo: 'investasi'
    },
  ]);

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost/samudata/api/landing_stats.php', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.ok) {
          const data = result.data;
          
          setStats([
            {
              title: 'Perikanan Tangkap',
              value: formatNumber(data.tangkap?.value || 0),
              unit: 'ton',
              image: '/tangkap.jpg',
              id: 'perikanan-tangkap',
              description: 'Produksi hasil laut dari aktivitas penangkapan',
              loading: false,
              navigateTo: 'perikanan-tangkap'
            },
            {
              title: 'Perikanan Budidaya',
              value: formatNumber(data.budidaya?.value || 0),
              unit: 'ton',
              image: '/budidaya.jpg',
              id: 'perikanan-budidaya',
              description: 'Produksi perikanan hasil budidaya',
              loading: false,
              navigateTo: 'perikanan-budidaya'
            },
            {
              title: 'Garam (KPP)',
              value: formatNumber(data.kpp?.value || 0),
              unit: 'ton',
              image: '/garam.jpg',
              id: 'garam',
              description: 'Produksi garam rakyat dan industri',
              loading: false,
              navigateTo: 'garam'
            },
            {
              title: 'Pengolahan & Pemasaran',
              value: formatNumber(data.pengolahan?.value || 0),
              unit: 'unit',
              image: '/pengolahan.jpg',
              id: 'pengolahan-pemasaran',
              description: 'Produk olahan hasil perikanan',
              loading: false,
              navigateTo: 'pengolahan-pemasaran'
            },
            {
              title: 'Ekspor Perikanan',
              value: formatNumber(data.ekspor?.value || 0),
              unit: 'ton',
              image: '/ekspor.jpg',
              id: 'ekspor',
              description: 'Volume ekspor perikanan Jawa Timur',
              loading: false,
              navigateTo: 'ekspor'
            },
            {
              title: 'Investasi Kelautan',
              value: formatNumber(data.investasi?.value || 0),
              unit: 'Rp',
              image: '/investasi.jpg',
              id: 'investasi',
              description: 'Total investasi sektor kelautan',
              loading: false,
              navigateTo: 'investasi'
            },
          ]);
          
          setLoadingStats(false);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'M';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'Jt';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'rb';
    }
    return num.toString();
  };

  const handleScrollTo = (section: string) => {
    let ref;
    switch (section) {
      case 'tentang':
        ref = tentangRef;
        break;
      case 'panduan':
        ref = panduanRef;
        break;
      case 'faq':
        ref = faqRef;
        break;
    }
    
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardClick = (navigateTo: string) => {
    onNavigate(navigateTo);
  };

  const faqs = [
    {
      question: 'Dari mana sumber data ini berasal?',
      answer: 'Data berasal dari Dinas Kelautan dan Perikanan Provinsi Jawa Timur yang dikumpulkan dari seluruh kabupaten/kota di Jawa Timur.'
    },
    {
      question: 'Seberapa sering data diperbarui?',
      answer: 'Data diperbarui secara berkala setiap bulan dan tahun sesuai dengan periode pelaporan statistik perikanan.'
    },
    {
      question: 'Apakah data ini resmi?',
      answer: 'Ya, semua data yang ditampilkan adalah data resmi dari Dinas Kelautan dan Perikanan Provinsi Jawa Timur.'
    },
  ];

  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        backgroundImage: "url('/bg5.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header onNavigate={onNavigate} onScrollTo={handleScrollTo} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blue-900 text-white">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>

          <path fill="url(#waveGradient)">
            <animate
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="
                M0,200 C240,160 480,260 720,220 960,180 1200,160 1440,200 L1440,0 L0,0 Z;
                M0,220 C240,200 480,300 720,260 960,220 1200,200 1440,220 L1440,0 L0,0 Z;
                M0,200 C240,160 480,260 720,220 960,180 1200,160 1440,200 L1440,0 L0,0 Z
              "
            />
          </path>
        </svg>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-[60%_40%] gap-12 items-center">
            <div>
              <div className="inline-block bg-blue-700/50 px-4 py-2 rounded-full mb-6">
                <p className="text-sm">Portal Data Terpadu Provinsi Jawa Timur</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Portal Data Kelautan dan Perikanan<br className="hidden md:block" /> Provinsi Jawa Timur
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Pusat Data Statistik Kelautan dan Perikanan, Budidaya, dan Ekspor Berbasis Spasial
              </p>
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Masuk Portal Data
              </button>

              <div className="flex items-center gap-4 mt-8 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>38 Kabupaten/Kota</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fish className="w-4 h-4" />
                  <span>Data Historis Kelautan dan Perikanan Jawa Timur</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-700/50">
                <div className="rounded-xl overflow-hidden shadow-lg border border-blue-600/30">
                  <img
                    src="/bg2.jpg"
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-blue-300" />
        </div>
      </section>

      {/* Statistik Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Data Statistik Perikanan</h2>
          <p className="text-xl text-blue-200">
            {loadingStats ? 'Memuat data...' : 'Klik card untuk melihat detail'}
          </p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-12 h-12 text-white animate-spin" />
            <p className="ml-4 text-white text-lg">Memuat statistik...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.id}
                onClick={() => handleCardClick(stat.navigateTo)}
                className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <StatPortraitCard
                  {...stat}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tentang Section */}
      <section ref={tentangRef} className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-white mb-12">
            Tentang Portal Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">
                Keterbukaan Data
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Menyediakan data perikanan Jawa Timur yang transparan, terstandarisasi,
                dan mudah diakses oleh publik.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">
                Data Terintegrasi
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Menggabungkan data statistik perikanan tangkap, budidaya,
                pengolahan, dan ekspor dalam satu platform.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">
                Visual & Spasial
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Menyajikan data dalam bentuk grafik, peta interaktif,
                dan visualisasi yang mudah dipahami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Panduan Section */}
      <section ref={panduanRef} className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-white mb-12">
            Cara Menggunakan Portal Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">
                1. Eksplorasi Data
              </h3>
              <p className="text-gray-700">
                Telusuri data perikanan berdasarkan wilayah,
                komoditas, dan jenis usaha.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">
                2. Analisis Statistik
              </h3>
              <p className="text-gray-700">
                Gunakan grafik dan ringkasan statistik
                untuk memahami tren dan potensi perikanan.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">
                3. Unduh & Gunakan
              </h3>
              <p className="text-gray-700">
                Unduh data untuk keperluan riset,
                perencanaan, dan pengambilan kebijakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} id="faq" className="relative py-16 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white/95 backdrop-blur-sm p-6 rounded-lg border border-white/30 shadow-lg">
              <summary className="font-semibold text-[#1A5276] cursor-pointer">
                Bagaimana cara mendaftar akun?
              </summary>
              <p className="mt-3 text-gray-700">
                Klik tombol "Masuk" di header, lalu pilih "Daftar Akun Baru". Isi formulir dengan email valid dan buat password. Verifikasi email akan dikirimkan untuk aktivasi akun.
              </p>
            </details>

            <details className="bg-white/95 backdrop-blur-sm p-6 rounded-lg border border-white/30 shadow-lg">
              <summary className="font-semibold text-[#1A5276] cursor-pointer">
                Apakah data bisa diunduh?
              </summary>
              <p className="mt-3 text-gray-700">
                Ya, pengguna terdaftar dapat melihat data dan mengajukan permintaan file. Administrator akan meninjau dan menyetujui permintaan sesuai kebijakan.
              </p>
            </details>

            <details className="bg-white/95 backdrop-blur-sm p-6 rounded-lg border border-white/30 shadow-lg">
              <summary className="font-semibold text-[#1A5276] cursor-pointer">
                Bagaimana cara mengakses data untuk wilayah tertentu?
              </summary>
              <p className="mt-3 text-gray-700">
                Setelah login, pilih kategori data yang diinginkan. Gunakan filter wilayah untuk memilih kabupaten/kota di Jawa Timur. Grafik dan tabel akan disesuaikan secara otomatis.
              </p>
            </details>

            <details className="bg-white/95 backdrop-blur-sm p-6 rounded-lg border border-white/30 shadow-lg">
              <summary className="font-semibold text-[#1A5276] cursor-pointer">
                Siapa yang bisa menjadi administrator?
              </summary>
              <p className="mt-3 text-gray-700">
                Administrator adalah pegawai resmi DKP Jatim yang ditunjuk. Untuk mendapatkan akses admin, hubungi tim IT DKP Jatim dengan kode akses khusus.
              </p>
            </details>

            <details className="bg-white/95 backdrop-blur-sm p-6 rounded-lg border border-white/30 shadow-lg">
              <summary className="font-semibold text-[#1A5276] cursor-pointer">
                Apa yang harus dilakukan jika lupa password?
              </summary>
              <p className="mt-3 text-gray-700">
                Klik "Lupa Password" di halaman login. Masukkan email terdaftar, dan link reset password akan dikirimkan ke email Anda.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Wave Animation */}
      <div className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#1e3a8a"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z"
          >
            <animate
              attributeName="d"
              dur="6s"
              repeatCount="indefinite"
              values="
                M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z;
                M0,48L48,58C96,68,192,88,288,90C384,92,480,76,576,66C672,56,768,52,864,56C960,60,1056,76,1152,86C1248,96,1344,88,1392,80L1440,72L1440,120L0,120Z;
                M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z
              "
            />
          </path>

          <path
            fill="#1e40af"
            opacity="0.6"
            d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,85.3C672,85,768,75,864,74.7C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L0,120Z"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,85.3C672,85,768,75,864,74.7C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L0,120Z;
                M0,80L48,85C96,90,192,95,288,92C384,89,480,78,576,70C672,62,768,60,864,64C960,68,1056,78,1152,88C1248,98,1344,92,1392,86L1440,80L1440,120L0,120Z;
                M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,85.3C672,85,768,75,864,74.7C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L0,120Z
              "
            />
          </path>
        </svg>
      </div>

      <Footer />
    </div>
  );
}