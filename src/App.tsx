import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { DataStatistik } from './pages/DataStatistik/index';
import { FileManager } from './pages/FileManager';
import { PengaturanAkun } from './pages/PengaturanAkun';
import { Login } from './pages/Login';
import { type SelectedYearType } from './pages/DataStatistik/types';

interface User {
  role: 'admin' | 'user';
  username: string;
  email: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedBidang, setSelectedBidang] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<SelectedYearType | null>(null);
  
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Initialize app - check session dan restore state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Cek session dari localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // 2. Validasi session dengan backend
          const response = await fetch('http://localhost/samudata/api/check_session.php', {
            method: 'GET',
            credentials: 'include',
          });
          
          const data = await response.json();
          
          if (data.ok && data.user) {
            // Session valid
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            restoreNavigationState();
          } else {
            // Session invalid, clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('currentPage');
            localStorage.removeItem('selectedBidang');
            localStorage.removeItem('selectedYear');
            setUser(null);
            setCurrentPage('landing');
          }
        } else {
          // No saved user, restore navigation state anyway
          restoreNavigationState();
        }
      } catch (err) {
        console.error('Error initializing app:', err);
        // Clear invalid session data
        localStorage.removeItem('user');
        localStorage.removeItem('currentPage');
        localStorage.removeItem('selectedBidang');
        localStorage.removeItem('selectedYear');
        setUser(null);
        setCurrentPage('landing');
      } finally {
        setIsLoadingSession(false);
        setIsCheckingSession(false);
      }
    };

    initializeApp();
  }, []);

  const restoreNavigationState = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const parts = hash.split('/');
      const page = parts[0];
      const bidang = parts[1] || null;
      const year = parts[2] || null;
      
      if (page) {
        setCurrentPage(page);
        if (bidang) setSelectedBidang(bidang);
        if (year) {
          if (year === 'all') {
            setSelectedYear('all');
          } else {
            setSelectedYear(Number(year));
          }
        }
      }
    } else {
      // Jika tidak ada hash, cek localStorage
      const savedPage = localStorage.getItem('currentPage');
      const savedBidang = localStorage.getItem('selectedBidang');
      const savedYear = localStorage.getItem('selectedYear');
      
      if (savedPage) setCurrentPage(savedPage);
      if (savedBidang) setSelectedBidang(savedBidang);
      if (savedYear) {
        if (savedYear === 'all') {
          setSelectedYear('all');
        } else if (savedYear === 'null') {
          setSelectedYear(null);
        } else {
          setSelectedYear(Number(savedYear));
        }
      }
    }
  };

  // Simpan state ke localStorage saat berubah
  useEffect(() => {
    if (currentPage) localStorage.setItem('currentPage', currentPage);
    if (selectedBidang) localStorage.setItem('selectedBidang', selectedBidang);
    if (selectedYear !== undefined && selectedYear !== null) {
      localStorage.setItem('selectedYear', selectedYear.toString());
    } else if (selectedYear === null) {
      localStorage.setItem('selectedYear', 'null');
    }
  }, [currentPage, selectedBidang, selectedYear]);

  // Simpan user ke localStorage saat login/logout
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleNavigate = (page: string, bidang?: string, year?: SelectedYearType) => {
    setCurrentPage(page);
    setSelectedBidang(bidang || null);
    setSelectedYear(year || null);
    
    // Update hash URL
    const hash = bidang 
      ? (year ? `${page}/${bidang}/${year}` : `${page}/${bidang}`)
      : (year ? `${page}/${year}` : page);
    window.location.hash = hash;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
    // Simpan ke localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost/samudata/api/logout.php', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedBidang(null);
    setSelectedYear(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('selectedBidang');
    localStorage.removeItem('selectedYear');
  };

  // Loading state saat checking session
  if (isLoadingSession || isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const adminOnlyRoutes = ['file-manager', 'pengaturan-akun'];

    // Validasi akses route admin-only
    if (adminOnlyRoutes.includes(currentPage)) {
      if (!user) {
        return (
          <Login
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        );
      }
      if (user.role !== 'admin') {
        setCurrentPage('dashboard');
        return (
          <Dashboard
            onNavigate={handleNavigate}
            isAdmin={false}
            onLogout={handleLogout}
            user={user}
          />
        );
      }
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;

      case 'login':
        if (user) {
          // Jika sudah login, redirect ke dashboard
          setCurrentPage('dashboard');
          return (
            <Dashboard
              onNavigate={handleNavigate}
              isAdmin={user.role === 'admin'}
              onLogout={handleLogout}
              user={user}
            />
          );
        }
        return (
          <Login
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            isAdmin={user?.role === 'admin'}
            onLogout={handleLogout}
            user={user}
          />
        );

      // ===== BIDANG STATISTIK =====
      case 'perikanan-tangkap':
      case 'perikanan-budidaya':
      case 'garam':
      case 'pengolahan-pemasaran':
      case 'ekspor':
      case 'investasi':
        return (
          <DataStatistik
            bidang={currentPage}
            onNavigate={handleNavigate}
            isAdmin={user?.role === 'admin'}
            onLogout={handleLogout}
            user={user}
            initialYear={selectedYear ?? 'all'}
          />
        );

      case 'file-manager':
        return (
          <FileManager 
            onNavigate={handleNavigate} 
            user={user} 
            onLogout={handleLogout}  
          />
        );

      case 'pengaturan-akun':
        return (
          <PengaturanAkun 
            onNavigate={handleNavigate} 
            user={user} 
            onLogout={handleLogout}
          />
        );

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderPage()}</div>;
}