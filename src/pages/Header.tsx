import { Menu } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  onScrollTo?: (section: string) => void;
}

export default function Header({ onNavigate, onScrollTo }: HeaderProps) {
  const menuItems = [
    { label: 'Beranda', id: 'landing' },
    { label: 'Tentang', id: 'tentang' },
    { label: 'Panduan', id: 'panduan' },
    { label: 'FAQ', id: 'faq' },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'landing') {
      onNavigate?.(id);
    } else {
      onScrollTo?.(id);
    }
  };

  const logoDKP = '/logo.png';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-8 py-4">
        <div className="flex items-center">

          {/* LOGO + JUDUL */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden border">
              <img
                src={logoDKP}
                alt="Logo DKP Jawa Timur"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-blue-900">
                SAMUDERA
              </h1>
              <p className="text-sm text-gray-600">Sistem Analisis dan Monitoring Data Perikanan dan Kelautan Provinsi Jawa Timur</p>
            </div>
          </div>

          {/* MENU */}
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className="text-gray-700 font-medium relative group transition-all duration-200
                  hover:text-blue-900 
                  hover:scale-105
                  after:content-['']
                  after:absolute
                  after:left-0
                  after:bottom-0
                  after:w-0
                  after:h-0.5
                  after:bg-blue-900
                  after:transition-all
                  after:duration-200
                  group-hover:after:w-full"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium
                hover:bg-blue-700 
                hover:shadow-md
                active:scale-95
                transition-all duration-200"
            >
              Masuk Portal Data
            </button>
          </nav>

          {/* MOBILE */}
          <button className="md:hidden ml-auto">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

        </div>
      </div>
    </header>
  );
}