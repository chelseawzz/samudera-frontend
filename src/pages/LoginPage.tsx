import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, X } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (role: 'admin') => void;
  onBack: () => void;
}

export default function AdminLoginPage({ onLogin, onBack }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('userType', 'admin');
    formData.append('access_code', adminCode || '');

    try {
      const response = await fetch(
        'http://localhost/samudata/api/login_api.php',
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const res = await response.json();

      if (res.ok) {
        onLogin('admin');
      } else {
        alert(res.message || 'Gagal login');
      }
    } catch (err) {
      alert('Gagal terhubung ke server');
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
        // Reset form setelah 3 detik
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

  // Jika showForgotPassword true, tampilkan modal/form forgot password
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A5276] via-[#3498DB] to-[#85C1E9] flex items-center justify-center px-4 relative">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowForgotPassword(false)}
        ></div>

        {/* Forgot Password Modal */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1A5276]/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#1A5276]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Lupa Password</h2>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Success Message */}
            {forgotSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Terkirim!
                </h3>
                <p className="text-gray-600 mb-4">
                  Silakan cek email <strong>{forgotEmail}</strong> untuk link reset password.
                </p>
                <p className="text-sm text-gray-500">
                  ⏰ Link akan kadaluarsa dalam <strong>1 jam</strong>
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="px-6 py-2 bg-[#1A5276] text-white rounded-lg hover:bg-[#3498DB] transition-all"
                  >
                    Kembali ke Login
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Terdaftar
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotError('');
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:border-transparent text-gray-900 ${
                          forgotError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="nama@email.com"
                        required
                        autoFocus
                      />
                    </div>
                    {forgotError && (
                      <p className="text-red-500 text-sm mt-1">{forgotError}</p>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                    <p className="text-sm text-blue-800">
                      🔒 Kami akan mengirimkan link reset password ke email Anda. Pastikan email sudah terdaftar di sistem SAMUDERA.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !forgotEmail}
                    className="w-full py-3 bg-[#1A5276] text-white rounded-lg hover:bg-[#3498DB] transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      'Kirim Link Reset Password'
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 pt-4 border-t text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-[#1A5276] hover:text-[#3498DB] font-medium flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeft size={16} />
                    Kembali ke Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F8FF] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/samudera-logo.png" 
              alt="SAMUDERA Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1A5276] mb-1">SAMUDERA</h1>
          <p className="text-gray-600 text-sm">
            Sistem Manajemen Data Kelautan & Perikanan
          </p>
          <p className="text-[#1A5276] font-medium text-sm mt-1">
            Provinsi Jawa Timur
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:border-transparent text-gray-900"
              placeholder="nama@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:border-transparent pr-10 text-gray-900"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Lupa Password Link - DI BAWAH PASSWORD */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-[#1A5276] hover:text-[#3498DB] font-medium hover:underline text-sm"
            >
              Lupa password?
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Administrator
            </label>
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:border-transparent text-gray-900"
              placeholder="Masukkan kode khusus admin"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Hubungi tim IT DKP Jatim untuk mendapatkan kode administrator
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1A5276] text-white rounded-lg hover:bg-[#3498DB] transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Login →
          </button>
        </form>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a 
            href="#" 
            onClick={onBack}
            className="text-[#1A5276] hover:text-[#3498DB] font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Kembali ke Halaman Utama
          </a>
        </div>
      </div>
    </div>
  );
}