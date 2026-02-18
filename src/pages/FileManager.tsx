import { useState, useEffect } from 'react';
import {
  FileText, Download, Upload, Search, FileSpreadsheet,
  X, Trash2, Plus, AlertCircle, CheckCircle, Loader, ArrowLeft
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';

// ========================================
// TEMPLATE HEADERS SESUAI NAMA KOLON DATABASE (LOWER CASE + UNDERSCORE)
// ========================================

// ===== PERIKANAN TANGKAP =====
const TANGKAP_RINGKASAN = [
  'cabang_usaha', 'nelayan_orang', 'rtp_pp', 'armada_buah', 
  'alat_tangkap_unit', 'volume_ton', 'nilai_rp_1000'
];
const TANGKAP_WILAYAH = [
  'kab_kota', 'jenis_perairan', 'nelayan_orang', 'armada_buah', 
  'alat_tangkap_unit', 'rtp_pp', 'volume_ton', 'nilai_rp'
];
const TANGKAP_PRODUKSI_MATRIX = [
  'kab_kota', 'subsektor', 'volume_ton'
];
const TANGKAP_VOLUME_BULANAN = [
  'uraian', 'januari', 'februari', 'maret', 'april', 'mei', 'juni', 
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember', 'jumlah'
];
const TANGKAP_NILAI_BULANAN = [
  'uraian', 'januari', 'februari', 'maret', 'april', 'mei', 'juni', 
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember', 'jumlah'
];
const TANGKAP_KOMODITAS = [
  'no', 'komoditas', 'volume'
];
// ===== PERIKANAN BUDIDAYA =====
const BUDIDAYA_RINGKASAN = ['uraian', 'nilai', 'satuan'];
const BUDIDAYA_MATRIX_KABKOTA = ['kab_kota', 'subsektor', 'volume_ton', 'nilai_rp'];
const BUDIDAYA_PEMBUDIDAYA_DETAIL = ['kab_kota', 'subsektor', 'peran', 'jumlah'];
const BUDIDAYA_PEMBENIHAN_RINGKAS = ['jenis_air', 'bbi', 'upr', 'hsrt', 'swasta', 'pembibit_rula'];
const KOMODITAS_BUDIDAYA = [
  'no', 'komoditas', 'laut_volume', 'laut_nilai', 'tambak_volume', 'tambak_nilai', 
  'kolam_volume', 'kolam_nilai', 'mina_padi_volume', 'mina_padi_nilai', 
  'karamba_volume', 'karamba_nilai', 'japung_volume', 'japung_nilai'
];
const BUDIDAYA_LUAS = ['uraian', 'luas_bersih_ha'];
const BUDIDAYA_PEMBUDIDAYA = ['uraian', 'jumlah'];
const BUDIDAYA_VOLUME_BULANAN = [
  'uraian', 'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'
];
const BUDIDAYA_NILAI_BULANAN = [
  'uraian', 'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'
];
const PRODUKSI_IKAN_HIAS_VOLUME = [
  'kabupaten_kota', 'total_volume', 'arwana', 'koi', 'grasscarp', 'mas', 'mas_koki', 'mutiara', 
  'akara', 'barbir', 'gapi', 'cupang', 'lalia', 'manvis', 'black_molly', 'oskar', 'platy', 
  'rainbow', 'louhan', 'sumatra', 'lele_blorok', 'komet', 'blackghost', 'kar_tetra', 'marble', 
  'golden', 'discus', 'zebra', 'cawang', 'balasak', 'red_fin', 'lemon', 'niasa', 'lobster', 
  'silver', 'juani', 'lainnya'
];
const NILAI_IKAN_HIAS = [
  'kabupaten_kota', 'total_value', 'arwana', 'koi', 'grasscarp', 'mas', 'mas_koki', 'mutiara', 
  'akara', 'barbir', 'gapi', 'cupang', 'lalia', 'manvis', 'black_molly', 'oskar', 'platy', 
  'rainbow', 'louhan', 'sumatra', 'lele_blorok', 'komet', 'blackghost', 'kar_tetra', 'marble', 
  'golden', 'discus', 'zebra', 'cawang', 'balasak', 'red_fin', 'lemon', 'niasa', 'lobster', 
  'silver', 'juani', 'lainnya'
];
// ===== GARAM (KPP) =====
const KPP_GARAM = [
  'kab_kota', 'l_total_ha', 'luas_lahan_ha', 'jumlah_kelompok', 
  'sigma_petambak', 'sigma_prod_ton', 'jumlah_petambak', 'volume_produksi_ton'
];
// ===== PENGOLAHAN & PEMASARAN =====
const PENGOLAHAN_AKI = ['kab_kota', 'kidrt', 'kilrt', 'ktt', 'aki'];
const PENGOLAHAN_PEMASARAN = ['kab_kota', 'pengecer', 'pengumpul', 'jumlah_unit'];
const PENGOLAHAN_OLAHANKAB = [
  'kab_kota', 'fermentasi', 'pelumatan_daging_ikan', 'pembekuan', 'pemindangan', 
  'penanganan_produk_segar', 'pengalengan', 'pengasapan_pemanggangan', 
  'pereduksian_ekstraksi', 'penggaraman_pengeringan', 'pengolahan_lainnya', 'jumlah_unit'
];
const PENGOLAHAN_OLAHJENIS = ['jenis_kegiatan_pengolahan', 'jumlah_upi'];
// ===== EKSPOR PERIKANAN =====
const EKSPOR_TOTAL = ['komoditas', 'volume_ton', 'nilai_usd'];
const EKSPOR_UTAMA = ['sisi', 'no_urut', 'komoditas', 'angka'];
const EKSPOR_RINGKASAN = ['urut', 'negara', 'jumlah_ton', 'nilai_usd'];

// ========================================
// STRUKTUR TEMPLATE PER BIDANG
// ========================================
const TEMPLATES: { [key: string]: { name: string; headers: string[] }[] } = {
  tangkap: [
    { name: 'Ringkasan', headers: TANGKAP_RINGKASAN },
    { name: 'Wilayah', headers: TANGKAP_WILAYAH },
    { name: 'Produksi Matrix', headers: TANGKAP_PRODUKSI_MATRIX },
    { name: 'Volume Bulanan', headers: TANGKAP_VOLUME_BULANAN },
    { name: 'Nilai Bulanan', headers: TANGKAP_NILAI_BULANAN },
    { name: 'Komoditas', headers: TANGKAP_KOMODITAS }
  ],
  budidaya: [
    { name: 'Ringkasan', headers: BUDIDAYA_RINGKASAN },
    { name: 'Matrix Kab/Kota', headers: BUDIDAYA_MATRIX_KABKOTA },
    { name: 'Pembudidaya Detail', headers: BUDIDAYA_PEMBUDIDAYA_DETAIL },
    { name: 'Pembenihan Ringkas', headers: BUDIDAYA_PEMBENIHAN_RINGKAS },
    { name: 'Komoditas Budidaya', headers: KOMODITAS_BUDIDAYA },
    { name: 'Luas Area', headers: BUDIDAYA_LUAS },
    { name: 'Pembudidaya', headers: BUDIDAYA_PEMBUDIDAYA },
    { name: 'Volume Bulanan', headers: BUDIDAYA_VOLUME_BULANAN },
    { name: 'Nilai Bulanan', headers: BUDIDAYA_NILAI_BULANAN },
    { name: 'Produksi Ikan Hias (Volume)', headers: PRODUKSI_IKAN_HIAS_VOLUME },
    { name: 'Nilai Ikan Hias', headers: NILAI_IKAN_HIAS }
  ],
  kpp: [
    { name: 'Data Garam', headers: KPP_GARAM }
  ],
  pengolahan: [
    { name: 'AKI', headers: PENGOLAHAN_AKI },
    { name: 'Pemasaran', headers: PENGOLAHAN_PEMASARAN },
    { name: 'Olahan per Kab/Kota', headers: PENGOLAHAN_OLAHANKAB },
    { name: 'Olahan per Jenis', headers: PENGOLAHAN_OLAHJENIS }
  ],
  ekspor: [
    { name: 'Total Ekspor', headers: EKSPOR_TOTAL },
    { name: 'Komoditas Utama', headers: EKSPOR_UTAMA },
    { name: 'Ringkasan Negara', headers: EKSPOR_RINGKASAN }
  ]
};

// ========================================
// CONTOH NILAI & KETERANGAN (SESUAI DATABASE)
// ========================================
const EXAMPLE_VALUES: { [key: string]: { [key: string]: string } } = {
  tangkap: {
    'cabang_usaha': 'Laut - Non Pelabuhan', 'nelayan_orang': '208050', 'rtp_pp': '100601',
    'armada_buah': '54854', 'alat_tangkap_unit': '225233', 'volume_ton': '586139',
    'nilai_rp_1000': '11425436', 'kab_kota': 'Pacitan', 'jenis_perairan': 'Laut',
    'nilai_rp': '74750000', 'subsektor': 'Laut - Non Pelabuhan', 'uraian': 'Laut',
    'januari': '38485', 'februari': '38753', 'no': '1', 'komoditas': 'Tongkol', 'volume': '52060.18'
  },
  budidaya: {
    'uraian': 'Volume total produksi budidaya', 'nilai': '1404680.92', 'satuan': 'Ton',
    'kab_kota': 'Pacitan', 'subsektor': 'Laut', 'volume_ton': '15.00', 'nilai_rp': '74750000',
    'peran': 'Pemilik', 'jumlah': '169', 'jenis_air': 'Tawar', 'bbi': '56', 'upr': '7368',
    'hsrt': '0', 'swasta': '1', 'pembibit_rula': '0', 'laut_volume': '0.00', 'laut_nilai': '0.00',
    'luas_bersih_ha': '1956.90', 'jan': '45381.53', 'feb': '49865.03', 'total_volume': '2.78',
    'arwana': '0.00', 'koi': '2.78', 'total_value': '277500.00'
  },
  kpp: {
    'kab_kota': 'Sumenep', 'l_total_ha': '1956.90', 'luas_lahan_ha': '1956.90',
    'jumlah_kelompok': '162', 'sigma_petambak': '1662', 'sigma_prod_ton': '147374.31',
    'jumlah_petambak': '1662', 'volume_produksi_ton': '147374.31'
  },
  pengolahan: {
    'kab_kota': 'Pacitan', 'kidrt': '19.09', 'kilrt': '20.60', 'ktt': '3.18', 'aki': '44.04',
    'pengecer': '515.18', 'pengumpul': '23.81', 'jumlah_unit': '538.98', 'fermentasi': '24.20',
    'pelumatan_daging_ikan': '55.12', 'pembekuan': '5.93', 'pemindangan': '15.31',
    'penanganan_produk_segar': '186.70', 'pengalengan': '0', 'pengasapan_pemanggangan': '10.18',
    'pereduksian_ekstraksi': '5.47', 'penggaraman_pengeringan': '46.85', 'pengolahan_lainnya': '27.23',
    'jenis_kegiatan_pengolahan': 'Fermentasi', 'jumlah_upi': '256.25'
  },
  ekspor: {
    'komoditas': 'UDANG', 'volume_ton': '71476.84', 'nilai_usd': '697931215.68',
    'sisi': 'VOL', 'no_urut': '1', 'angka': '71476.84', 'urut': '1', 'negara': 'CHINA',
    'jumlah_ton': '115125.03'
  }
};

const HEADER_DESCRIPTIONS: { [key: string]: { [key: string]: string } } = {
  tangkap: {
    'cabang_usaha': 'Nama cabang usaha (contoh: "Laut - Non Pelabuhan")',
    'nelayan_orang': 'Jumlah nelayan dalam satuan orang (angka tanpa titik)',
    'rtp_pp': 'Jumlah Rumah Tangga Perikanan (RTP/PP)',
    'armada_buah': 'Jumlah armada perikanan dalam satuan buah',
    'alat_tangkap_unit': 'Jumlah alat tangkap dalam satuan unit',
    'volume_ton': 'Volume produksi dalam satuan ton (angka desimal dengan titik)',
    'nilai_rp_1000': 'Nilai produksi dalam satuan ribu rupiah (contoh: 11425436 = Rp 11.425.436.000)',
    'kab_kota': 'Nama kabupaten/kota (contoh: "Pacitan")',
    'jenis_perairan': 'Jenis perairan (Laut / Perairan Umum Darat)',
    'nilai_rp': 'Nilai produksi dalam rupiah (angka tanpa titik)',
    'subsektor': 'Subsektor perikanan (contoh: "Laut - Non Pelabuhan")',
    'uraian': 'Uraian data (contoh: "Laut", "Perairan Umum Darat")',
    'januari': 'Volume/nilai produksi bulan Januari',
    'februari': 'Volume/nilai produksi bulan Februari',
    'no': 'Nomor urut komoditas',
    'komoditas': 'Nama komoditas perikanan',
    'volume': 'Volume produksi komoditas'
  },
  budidaya: {
    'uraian': 'Deskripsi data (contoh: "Volume total produksi budidaya")',
    'nilai': 'Nilai numerik (boleh desimal, gunakan titik sebagai pemisah)',
    'satuan': 'Satuan pengukuran (contoh: "Ton", "( Rp. 1.000,-")',
    'kab_kota': 'Nama kabupaten/kota',
    'subsektor': 'Subsektor budidaya (Laut, Tambak, Kolam, dll)',
    'volume_ton': 'Volume produksi dalam satuan ton',
    'nilai_rp': 'Nilai produksi dalam rupiah',
    'peran': 'Peran pembudidaya (Pemilik, Pendega, dll)',
    'jumlah': 'Jumlah pembudidaya',
    'jenis_air': 'Jenis air (Tawar, Payau, Laut)',
    'bbi': 'Benih Bersertifikat Instansi',
    'upr': 'Unit Pembenihan Rakyat',
    'hsrt': 'Hatchery Skala Rumah Tangga',
    'swasta': 'Hatchery Swasta',
    'pembibit_rula': 'Pembibit Rumah Tangga',
    'laut_volume': 'Volume produksi di laut',
    'laut_nilai': 'Nilai produksi di laut',
    'luas_bersih_ha': 'Luas area budidaya bersih dalam hektar',
    'jan': 'Volume/nilai produksi bulan Januari',
    'feb': 'Volume/nilai produksi bulan Februari',
    'total_volume': 'Total volume produksi ikan hias',
    'arwana': 'Volume/nilai produksi ikan Arwana',
    'koi': 'Volume/nilai produksi ikan Koi',
    'total_value': 'Total nilai produksi ikan hias'
  },
  kpp: {
    'kab_kota': 'Nama kabupaten/kota penghasil garam',
    'l_total_ha': 'Luas total lahan garam dalam hektar',
    'luas_lahan_ha': 'Luas lahan garam dalam hektar',
    'jumlah_kelompok': 'Jumlah kelompok petambak garam',
    'sigma_petambak': 'Total jumlah petambak garam',
    'sigma_prod_ton': 'Total volume produksi garam dalam ton',
    'jumlah_petambak': 'Jumlah petambak garam',
    'volume_produksi_ton': 'Volume produksi garam dalam ton'
  },
  pengolahan: {
    'kab_kota': 'Nama kabupaten/kota',
    'kidrt': 'Konsumsi Ikan Domestik Rumah Tangga',
    'kilrt': 'Konsumsi Ikan Luar Rumah Tangga',
    'ktt': 'Konsumsi Total',
    'aki': 'Angka Konsumsi Ikan',
    'pengecer': 'Jumlah pengecer (dalam satuan unit)',
    'pengumpul': 'Jumlah pengumpul (dalam satuan unit)',
    'jumlah_unit': 'Total jumlah unit pemasaran',
    'fermentasi': 'Jumlah unit pengolahan fermentasi',
    'pelumatan_daging_ikan': 'Jumlah unit pelumatan daging ikan',
    'pembekuan': 'Jumlah unit pembekuan',
    'pemindangan': 'Jumlah unit pemindangan',
    'penanganan_produk_segar': 'Jumlah unit penanganan produk segar',
    'pengalengan': 'Jumlah unit pengalengan',
    'pengasapan_pemanggangan': 'Jumlah unit pengasapan/pemanggangan',
    'pereduksian_ekstraksi': 'Jumlah unit pereduksian/ekstraksi',
    'penggaraman_pengeringan': 'Jumlah unit pengaraman/pengeringan',
    'pengolahan_lainnya': 'Jumlah unit pengolahan lainnya',
    'jenis_kegiatan_pengolahan': 'Jenis kegiatan pengolahan',
    'jumlah_upi': 'Jumlah Unit Pengolahan Ikan'
  },
  ekspor: {
    'komoditas': 'Nama komoditas ekspor perikanan',
    'volume_ton': 'Volume ekspor dalam satuan ton',
    'nilai_usd': 'Nilai ekspor dalam satuan USD',
    'sisi': 'Sisi data (VOL untuk volume, USD untuk nilai)',
    'no_urut': 'Nomor urut komoditas',
    'angka': 'Angka volume atau nilai sesuai sisi',
    'urut': 'Nomor urut negara/komoditas',
    'negara': 'Nama negara tujuan ekspor',
    'jumlah_ton': 'Jumlah volume ekspor dalam ton'
  }
};

// ========================================
// ✅ HELPER: SLUGIFY UNTUK NAMA TEMPLATE (DI LUAR COMPONENT - PASTI TERDETEKSI)
// ========================================
const slugifyTemplateName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')          // Spasi → underscore
    .replace(/[\/\\]/g, '_')       // Slash → underscore (untuk "Kab/Kota")
    .replace(/[^\w\-_]/g, '')      // Hapus karakter non-alphanumeric
    .replace(/_{2,}/g, '_')        // Multiple underscore → single
    .replace(/^-+|-+$/g, '');      // Hapus underscore di awal/akhir
};

interface User {
  role: 'admin' | 'user';
  username: string;
  email: string;
}
interface FileData {
  id: number;
  bidang: string;
  tahun: number;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  uploaded_by: number | null;
  file_size?: number;
  status?: string;
}
interface FileManagerProps {
  onNavigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
}

export function FileManager({ onNavigate, user, onLogout }: FileManagerProps) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidang, setSelectedBidang] = useState('semua');
  const [selectedTahun, setSelectedTahun] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // State untuk upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadBidang, setUploadBidang] = useState('');
  const [uploadTahun, setUploadTahun] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  // State untuk konfirmasi delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (user.role !== 'admin') {
      onNavigate('dashboard');
    }
  }, [user, onNavigate]);

  useEffect(() => {
    fetchFiles();
  }, [selectedBidang, selectedTahun]);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedBidang !== 'semua') {
        params.append('bidang', selectedBidang);
      }
      if (selectedTahun) {
        params.append('tahun', selectedTahun.toString());
      }
      const url = `http://localhost/samudata/api/file_manager_api.php${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      if (data.ok) {
        setFiles(data.files || []);
      } else {
        setError(data.error || 'Gagal mengambil data file');
      }
    } catch (err) {
      console.error('Fetch files error:', err);
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Pilih file terlebih dahulu');
      return;
    }
    if (!uploadBidang || !uploadTahun) {
      setError('Pilih bidang dan tahun terlebih dahulu');
      return;
    }
    const tahunNum = parseInt(uploadTahun);
    if (tahunNum < 2000 || tahunNum > 2100) {
      setError('Tahun harus antara 2000-2100');
      return;
    }
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Hanya file Excel (.xls, .xlsx) yang diperbolehkan');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('bidang', uploadBidang);
    formData.append('tahun', uploadTahun);
    setIsUploading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost/samudata/api/upload_handler.php', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const result = await response.json();
      if (result.ok) {
        setSuccess(`File berhasil diupload dan diimport! ${result.rows_imported} baris data berhasil diproses.`);
        window.location.reload();
        setSelectedFile(null);
        setUploadBidang('');
        setUploadTahun('');
        setShowUploadModal(false);
        fetchFiles();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Gagal upload file');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Gagal terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('id', fileId.toString());
      
      const response = await fetch(
        `http://localhost/samudata/api/file_manager_api.php`, 
        {
          method: 'POST',  
          credentials: 'include',
          body: formData,  
          
        }
      );
      
      if (!response.ok) {
        let errorMsg = `Gagal menghapus file (Status ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      if (data.ok) {
        setSuccess(data.message || 'File berhasil dihapus');
        fetchFiles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Respons tidak valid dari server');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(`${err instanceof Error ? err.message : 'Gagal terhubung ke server'}`);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

    const handleFileDownload = async (filePath: string) => {
      try {
        const response = await fetch(`http://localhost/samudata/api/download_file.php?path=${encodeURIComponent(filePath)}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('File tidak ditemukan');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filePath.split('/').pop() || 'file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSuccess(`File berhasil diunduh!`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Download error:', err);
        setError('Gagal mengunduh file');
      }
    };

    // ✅ FUNGSI BARU: DOWNLOAD TEMPLATE PER KOMPONEN (HAPUS FUNGSI LAMA handleDownloadTemplate)
    const handleDownloadComponentTemplate = async (bidang: string, templateName: string) => {
      const templateSlug = slugifyTemplateName(templateName);
      try {
        const response = await fetch(
          `http://localhost/samudata/api/download_template.php?bidang=${bidang}&template=${templateSlug}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Template "${templateName}" tidak tersedia di server`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template_${bidang}_${templateSlug}_${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess(`✅ Template "${templateName}" berhasil diunduh!`);
        setTimeout(() => setSuccess(''), 4000);
      } catch (err) {
        console.error('Download template error:', err);
        setError(`❌ Gagal download template "${templateName}": ${err instanceof Error ? err.message : 'Error tidak diketahui'}`);
      }
    };

  const filteredFiles = files.filter(file => {
    const matchesSearch =
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.bidang.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBidang = selectedBidang === 'semua' || file.bidang === selectedBidang;
    const matchesTahun = !selectedTahun || file.tahun === selectedTahun;
    return matchesSearch && matchesBidang && matchesTahun;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getBidangLabel = (bidang: string) => {
    const labels: { [key: string]: string } = {
      'tangkap': 'Perikanan Tangkap',
      'budidaya': 'Perikanan Budidaya',
      'kpp': 'Garam (KPP)',
      'pengolahan': 'Pengolahan & Pemasaran',
      'ekspor': 'Ekspor Perikanan',
    };
    return labels[bidang] || bidang;
  };

  const getBidangColor = (bidang: string) => {
    const colors: { [key: string]: string } = {
      'tangkap': 'bg-blue-100 text-blue-800',
      'budidaya': 'bg-green-100 text-green-800',
      'kpp': 'bg-yellow-100 text-yellow-800',
      'pengolahan': 'bg-purple-100 text-purple-800',
      'ekspor': 'bg-red-100 text-red-800',
    };
    return colors[bidang] || 'bg-gray-100 text-gray-800';
  };

  const getHeaderDescription = (bidang: string, header: string) => {
    return HEADER_DESCRIPTIONS[bidang]?.[header] || 'Data sesuai kolom database';
  };

  const getExampleValue = (bidang: string, header: string) => {
    return EXAMPLE_VALUES[bidang]?.[header] || '-';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        currentPage="file-manager"
        onNavigate={onNavigate}
        isAdmin={true}
        onLogout={onLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success & Error Messages */}
        {success && (
          <div className="mb-4">
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="semua">Semua Bidang</option>
              <option value="tangkap">Perikanan Tangkap</option>
              <option value="budidaya">Perikanan Budidaya</option>
              <option value="kpp">Garam (KPP)</option>
              <option value="pengolahan">Pengolahan & Pemasaran</option>
              <option value="ekspor">Ekspor Perikanan</option>
            </select>
            <select
              value={selectedTahun || ''}
              onChange={(e) => setSelectedTahun(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Tahun</option>
              {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* ✅ SECTION TEMPLATE TUNGGAL - TANPA DUPLIKAT (HANYA 1 SECTION) */}
        {selectedBidang !== 'semua' && TEMPLATES[selectedBidang] && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-blue-900 flex items-center">
                <FileSpreadsheet className="w-6 h-6 mr-2 text-blue-600" />
                Panduan Format Excel: {getBidangLabel(selectedBidang)}
              </h2>
              <p className="text-sm text-blue-800 mt-1">
                Klik tombol <span className="font-medium text-emerald-700">"Template Excel"</span> pada setiap komponen untuk download template spesifik
              </p>
            </div>
            
            <div className="space-y-6">
              {TEMPLATES[selectedBidang].map((component, compIndex) => {
                const componentSlug = slugifyTemplateName(component.name);
                
                return (
                  <div key={compIndex} className="bg-white rounded-lg border border-blue-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-800 font-bold text-sm">{compIndex + 1}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{component.name}</h3>
                      </div>
                      {/* ✅ BUTTON DOWNLOAD PER KOMPONEN - HANYA 1 BUTTON PER KOMPONEN */}
                      <button
                        onClick={() => handleDownloadComponentTemplate(selectedBidang, component.name)}
                        className="flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs shadow-sm hover:shadow"
                        title={`Download template untuk ${component.name}`}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Template Excel
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-600 text-white">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold">Nama Kolom Database</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold">Keterangan</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold">Contoh Isi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {component.headers.map((header, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-blue-50/30 transition-colors"
                              title={getHeaderDescription(selectedBidang, header)}
                            >
                              <td className="px-4 py-3 text-sm font-medium text-blue-800">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <code className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded font-mono text-sm border border-blue-200 block">
                                  {header}
                                </code>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {getHeaderDescription(selectedBidang, header).split('.')[0]}...
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-green-700">
                                {getExampleValue(selectedBidang, header)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="ml-2 text-sm text-blue-800">
                  <span className="font-bold">PENTING:</span> Setiap komponen memiliki template terpisah. 
                  Download template sesuai komponen yang akan diisi. Header Excel HARUS persis seperti kolom database 
                  (lowercase + underscore, case-sensitive). Format angka: gunakan titik (.) sebagai pemisah desimal, 
                  tanpa titik ribuan. Kolom kosong akan diisi 0 secara otomatis.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* File List Section - TANPA SECTION TEMPLATE DUPLIKAT */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Daftar File</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {filteredFiles.length} file ditemukan
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Tidak ada file yang ditemukan</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Upload File Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Bidang</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Tahun</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Nama File</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Ukuran</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Tanggal Upload</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, index) => (
                    <tr
                      key={file.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBidangColor(file.bidang)}`}>
                          {getBidangLabel(file.bidang)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{file.tahun}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-900">{file.file_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(file.file_size)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(file.uploaded_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleFileDownload(file.file_path)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                          <button
                            onClick={() => {
                              setFileToDelete(file.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-bold text-blue-900 mb-2">Informasi:</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>File Excel yang diupload akan otomatis diimport ke database sesuai komponen</li>
            <li>Header Excel HARUS persis seperti kolom database (lowercase + underscore)</li>
            <li>Data yang sudah ada akan di-update (tidak ada duplikasi)</li>
            <li>Fitur upload dan delete hanya tersedia untuk admin</li>
            <li>Semua aktivitas upload akan dicatat dalam sistem</li>
          </ul>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Upload File Excel</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <form onSubmit={handleFileUpload} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bidang Data *
                </label>
                <select
                  value={uploadBidang}
                  onChange={(e) => setUploadBidang(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Pilih Bidang</option>
                  <option value="tangkap">Perikanan Tangkap</option>
                  <option value="budidaya">Perikanan Budidaya</option>
                  <option value="kpp">Garam (KPP)</option>
                  <option value="pengolahan">Pengolahan & Pemasaran</option>
                  <option value="ekspor">Ekspor Perikanan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Data *
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={uploadTahun}
                  onChange={(e) => setUploadTahun(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: 2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Excel *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          setError('File terlalu besar (max 10MB)');
                          return;
                        }
                        setSelectedFile(file);
                        setError('');
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <FileSpreadsheet className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">
                          Klik untuk memilih file Excel
                        </p>
                        <p className="text-xs text-gray-500">
                          Format: .xlsx atau .xls (Max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Mengupload & Mengimport...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Import ke Database
                    </>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-sm text-gray-600">File ini akan dihapus secara permanen</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleFileDelete(fileToDelete!)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFileToDelete(null);
                }}
                className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}