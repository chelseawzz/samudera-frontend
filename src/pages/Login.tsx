import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader, Mail, X } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { role: 'admin'; username: string; email: string }) => void;
  onNavigate?: (page: string) => void;
}

export function Login({ onLogin, onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State untuk forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  if (!email || !password || !accessCode) {
    setError('Mohon lengkapi semua field');
    setIsLoading(false);
    return;
  }

  if (!filterEmail(email)) {
    setError('Format email tidak valid');
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost/samudata/api/login_api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      body: new URLSearchParams({
        email: email.trim(),
        password: password,
        userType: 'admin',
        access_code: accessCode.trim(),
      }),
    });

    const data = await response.json();

    if (data.ok) {
      const userData = {
        role: 'admin' as const,
        username: data.username,
        email: email.trim()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      onLogin(userData);
    } else {
      setError(data.message || 'Login gagal');
    }
  } catch (err) {
    setError('Gagal terhubung ke server. Pastikan backend berjalan.');
    console.error('Login error:', err);
  } finally {
    setIsLoading(false);
  }
};

  // Handle forgot password request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setForgotError('');
    setForgotSuccess(false);

    try {
      const formData = new FormData();
      formData.append('email', forgotEmail);

      const response = await fetch(
        'http://localhost/samudata/api/forgot_password.php',
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const res = await response.json();

      if (res.ok) {
        setForgotSuccess(true);
        setTimeout(() => {
          setForgotEmail('');
          setShowForgotPassword(false);
          setForgotSuccess(false);
        }, 3000);
      } else {
        setForgotError(res.message || 'Gagal mengirim link reset password');
      }
    } catch (err) {
      setForgotError('Gagal terhubung ke server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

 const handleBackToDashboard = () => {
  if (onNavigate) {
    // Jika sudah login, kembali ke dashboard
    // Jika belum login, kembali ke landing
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      onNavigate('dashboard');
    } else {
      onNavigate('landing');
    }
  }
};


  // Modal Forgot Password - Tampilan Baru yang Lebih Bagus
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowForgotPassword(false)}
        ></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with Logo */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Lupa Password?</h2>
                    <p className="text-sm opacity-90">Reset password akun Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {forgotSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/logo.png" 
                      alt="Logo SAMUDERA" 
                      className="w-24 h-auto object-contain"
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Email Terkirim! 
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Silakan cek email <strong className="text-blue-600">{forgotEmail}</strong> untuk link reset password.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-blue-800">
                      Link akan kadaluarsa dalam <strong>1 jam</strong>
                    </p>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowForgotPassword(false)}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Kembali ke Login
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <img 
                        src="/logo.png" 
                        alt="Logo SAMUDERA" 
                        className="w-28 h-auto object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Reset Password
                    </h3>
                    <p className="text-gray-600">
                      Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Terdaftar
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            setForgotError('');
                          }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm ${
                            forgotError ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="nama@email.com"
                          required
                          autoFocus
                        />
                      </div>
                      {forgotError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {forgotError}
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-blue-800">
                          <strong>Pastikan email yang Anda masukkan sudah terdaftar</strong> di sistem SAMUDERA. Link reset password akan dikirim ke email tersebut.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !forgotEmail}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Mengirim Email...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Kirim Link Reset Password
                        </>
                      )}
                    </button>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium py-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Kembali ke Halaman Login
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex">
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 bg-white relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="flex justify-center mb-4">
              <img
                src="/logo.png"
                alt="Logo SAMUDERA"
                className="w-48 h-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-blue-900 mb-2 text-center">SAMUDERA</h2>
            <p className="text-lg text-gray-700 text-center mb-2">Sistem Analisis dan Monitoring Data Kelautan & Perikanan</p>
            <p className="text-base text-gray-600 text-center">Provinsi Jawa Timur</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Login Administrator</h1>
            <p className="text-gray-600">Silakan masukkan kredensial admin untuk mengakses sistem</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Admin</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm pr-12"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* 🔑 LINK LUPA PASSWORD DI BAWAH PASSWORD */}
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-sm"
                >
                  Lupa password?
                </button>
              </div>
            </div>

            {/* Kode Administrator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Administrator
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Masukkan kode administrator"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                disabled={isLoading}
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Login →'
              )}
            </button>
          </form>

          {/* Back to Dashboard */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBackToDashboard}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}