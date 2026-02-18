import { ChevronDown, FileText, Settings, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';


interface DashboardHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function DashboardHeader({
  currentPage,
  onNavigate,
  isAdmin,
  onLogout,
}: DashboardHeaderProps) {

  const [showDropdown, setShowDropdown] = useState(false);

  const statistikItems = [
    { label: 'Perikanan Tangkap', id: 'perikanan-tangkap' },
    { label: 'Perikanan Budidaya', id: 'perikanan-budidaya' },
    { label: 'KPP (Garam)', id: 'garam' },
    { label: 'Pengolahan & Pemasaran', id: 'pengolahan-pemasaran' },
    { label: 'Ekspor Perikanan', id: 'ekspor' },
    { label: 'Investasi Kelautan', id: 'investasi' },
  ];

  const logoDKP = '/logo.png';


  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-2000">
      <div className="w-full px-8 py-4">
        {/* SATU BARIS: LOGO KIRI - MENU KANAN */}
        <div className="flex items-center">

          <button
          onClick={() => onNavigate('landing')}
          className="mr-6 flex items-center hover:opacity-80 transition"
          aria-label="Kembali ke Beranda"
        >
          <img
            src="/arrow.png"
            alt="Kembali"
            className="w-5 h-5"
          />
        </button>

         {/* LOGO & JUDUL */}
<div className="flex items-center gap-4 mr-10">
  <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center">
    <img
      src={logoDKP}
      alt="Logo DKP Jawa Timur"
      className="w-full h-full object-contain"
    />
  </div>

  <div>
    <h1 className="text-lg font-bold">
      SAMUDERA
    </h1>
    <p className="text-sm text-blue-100">
      Sistem Analisis dan Monitoring  Data Perikanan dan Kelautan Provinsi Jawa Timur
    </p>
  </div>
</div>

          {/* MENU (KANAN) */}
          <nav className="ml-auto flex items-center gap-1 bg-blue-800/50 rounded-lg p-1">


            {/* Dashboard */}
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-white text-blue-900'
                  : 'text-white hover:bg-blue-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            {/* Dropdown Statistik */}
            <div
              className="relative"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentPage.includes('perikanan') ||
                  currentPage.includes('garam') ||
                  currentPage.includes('pengolahan') ||
                  currentPage.includes('ekspor') ||
                  currentPage.includes('investasi')
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Data Statistik
                <ChevronDown className="w-4 h-4" />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50">
                  {statistikItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ADMIN ONLY */}
          {isAdmin && (
            <>
              {/* File Manager */}
              <button
                onClick={() => onNavigate('file-manager')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentPage === 'file-manager'
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                File Manager
              </button>

              {/* Pengaturan */}
              <button
                onClick={() => onNavigate('pengaturan-akun')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentPage === 'pengaturan-akun'
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                Pengaturan Akun
              </button>
            </>
          )}

          </nav>
          {/* LOGIN / LOGOUT */}
          <div className="ml-2">
            {!isAdmin ? (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-white text-blue-900 rounded-md font-semibold hover:bg-blue-100"
              >
                Login Admin
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>


        </div>
      </div>
    </header>
  );
}
