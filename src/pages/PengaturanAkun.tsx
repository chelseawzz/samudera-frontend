import { DashboardHeader } from './DashboardHeader';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, LogOut, Save, Loader } from 'lucide-react';

interface User {
  role: 'admin' | 'user';
  username: string;
  email: string;
}

interface PengaturanAkunProps {
  onNavigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
}

export function PengaturanAkun({ onNavigate, user, onLogout }: PengaturanAkunProps) {
  const [activeTab, setActiveTab] = useState<'profil' | 'password'>('profil');
  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    telp: '',
    jabatan: 'Administrator Sistem',
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (user.role !== 'admin') {
      onNavigate('dashboard');
    }
  }, [user, onNavigate]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch('http://localhost/samudata/api/get_user_profile.php', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data profil');
      }
      
      const data = await response.json();
      
      if (data.ok) {
        setProfile({
          nama: data.nama || user?.username || '',
          email: data.email || user?.email || '',
          telp: data.telp || '',
          jabatan: data.jabatan || 'Administrator Sistem',
        });
        setError(null);
      } else {
        throw new Error(data.message || 'Gagal memuat profil');
      }
    } catch (err) {
      console.error('Load profile error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      
      // Fallback ke data dari session
      if (user) {
        setProfile({
          nama: user.username,
          email: user.email,
          telp: '',
          jabatan: 'Administrator Sistem',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.nama || !profile.email) {
      alert('Nama dan email harus diisi!');
      return;
    }

    try {
      const response = await fetch('http://localhost/samudata/api/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams({
          nama: profile.nama,
          email: profile.email,
          telp: profile.telp,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        alert('Profil berhasil diperbarui!');
        // Update session data di localStorage
        const updatedUser = {
          ...user,
          username: profile.nama,
          email: profile.email,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert(data.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      alert('Gagal memperbarui profil. Coba lagi nanti.');
      console.error('Save profile error:', err);
    }
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    if (password.new.length < 8) {
      alert('Password minimal 8 karakter!');
      return;
    }

    try {
      const response = await fetch('http://localhost/samudata/api/change_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams({
          current_password: password.current,
          new_password: password.new,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        alert('Password berhasil diubah!');
        setPassword({ current: '', new: '', confirm: '' });
      } else {
        alert(data.message || 'Gagal mengubah password');
      }
    } catch (err) {
      alert('Gagal mengubah password. Coba lagi nanti.');
      console.error('Change password error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gagal Memuat Profil</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="pengaturan-akun" onNavigate={onNavigate} isAdmin={true} onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pengaturan Akun</h1>
                <p className="text-gray-600">Kelola profil dan keamanan akun Anda</p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.nama}</h2>
                <p className="text-gray-600">{profile.jabatan}</p>
                <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('profil')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'profil'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profil
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'password'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Ubah Password
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'profil' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.nama}
                        onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="nama@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.telp}
                        onChange={(e) => setProfile({ ...profile, telp: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+628xxxxxxxxxx"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Opsional</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jabatan
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.jabatan}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        placeholder="Administrator Sistem"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Jabatan default untuk admin</p>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Perubahan
                  </button>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Catatan:</strong> Password harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, dan angka.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password.current}
                        onChange={(e) => setPassword({ ...password, current: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan password saat ini"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password.new}
                        onChange={(e) => setPassword({ ...password, new: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Minimal 8 karakter"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password.confirm}
                        onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ketik ulang password baru"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                  >
                    <Lock className="w-5 h-5" />
                    Ubah Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}