# SAMUDERA Frontend  
## Sistem Analisis dan Monitoring Data Perikanan dan Kelautan Provinsi Jawa Timur  

**Slogan:** *"Lautnya Luas, Datanya Jelas – SAMUDERA, Solusi Cerdas."*

---

## 📋 Deskripsi

Frontend aplikasi **SAMUDERA** dibangun menggunakan **React.js + TypeScript** dengan antarmuka modern dan interaktif untuk visualisasi data statistik kelautan dan perikanan di Dinas Kelautan dan Perikanan (DKP) Provinsi Jawa Timur.

---

## ✨ Fitur Utama

### 🏠 Landing Page
- 6 kartu statistik real-time (Tangkap, Budidaya, KPP, Pengolahan, Ekspor, Investasi)
- Navigasi langsung ke halaman detail per bidang
- Animasi wave background dan desain modern

### 📊 Dashboard
- Ringkasan produksi per bidang dengan filter tahun (2020–2024)
- Grafik interaktif (Bar, Line, Pie) menggunakan Recharts
- Tabel data per kabupaten/kota dengan sorting & pagination
- Export data ke Excel

### 📈 Data Statistik per Bidang
- **Perikanan Tangkap:** Nelayan, Armada, Volume, Nilai, Komoditas  
- **Perikanan Budidaya:** Volume, Nilai, Pembudidaya, Luas Area, Ikan Hias  
- **KPP Garam:** Luas Lahan, Kelompok, Petambak, Volume Produksi  
- **Pengolahan & Pemasaran:** AKI, Pemasaran, Olahan per Kab/Kota  
- **Ekspor Perikanan:** Total Ekspor, Komoditas Utama, Negara Tujuan  

### 🗺️ Peta Interaktif (JatimMap)
- GeoJSON batas wilayah 38 kabupaten/kota Jawa Timur
- Color coding berdasarkan nilai produksi
- Tooltip detail saat hover
- Filter tahun & jenis perikanan

### 🗂️ File Manager (Admin Only)
- Upload file Excel dengan validasi otomatis
- Template Excel per komponen
- Delete file dengan cascade ke database
- Audit log aktivitas

### 🔐 Autentikasi & Keamanan
- Login khusus admin dengan session management
- Role-based access control
- Protected routes untuk halaman admin

### ⚙️ Pengaturan Akun (Admin)
- Edit profil: Nama, Email, Telepon
- Ubah password dengan validasi kompleksitas

---

## 🛠️ Teknologi

| Komponen | Teknologi | Versi |
|-----------|------------|-------|
| Framework | React.js + TypeScript | 18.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 2.x |
| Maps | Leaflet | 1.9.x |
| Icons | Lucide React | Latest |
| Build Tool | Vite | 4.x |
| HTTP Client | Fetch API | - |
| State Management | React Hooks | - |

### Node.js Requirements
- Node.js 18+
- npm 9+ atau yarn 1.22+

---

## 📁 Struktur Proyek

```bash
samudera-frontend/
├── public/
│   ├── jatim_kabkota_geojson.json
│   ├── bg5.jpg, bg2.jpg
│   ├── logo.png
│   └── favicon.ico
│
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── FileManager.tsx
│   │   ├── PengaturanAkun.tsx
│   │   └── DataStatistik/
│   │       ├── PerikananTangkap.tsx
│   │       ├── PerikananBudidaya.tsx
│   │       ├── KPP.tsx
│   │       ├── PengolahanPemasaran.tsx
│   │       ├── EksporPerikanan.tsx
│   │       └── types.ts
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatPortraitCard.tsx
│   │   └── JatimMap.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── index.html
└── README.md
```

---

## 🚀 Instalasi

### 1️⃣ Install Node.js
Download dari 👉 https://nodejs.org  

Cek instalasi:

```bash
node -v
npm -v
```

---

### 2️⃣ Clone Repository

```bash
git clone https://github.com/username/samudera-frontend.git
cd samudera-frontend
```

---

### 3️⃣ Install Dependencies

```bash
npm install
# atau
yarn install
```

---

### 4️⃣ Jalankan Project

```bash
npm run dev
```

Buka di browser:
```
http://localhost:5173
```

---

## 📌 Build Production

```bash
npm run build
```

Output ada di folder `dist/`.

---

## 🔗 Backend Connection

Pastikan backend SAMUDERA berjalan di server lokal/XAMPP.  
Edit endpoint API di file config jika perlu.

---

## 📞 Support

Untuk bantuan teknis, hubungi tim IT DKP Jawa Timur.

---

**SAMUDERA Frontend**  
*Lautnya Luas, Datanya Jelas – SAMUDERA, Solusi Cerdas.*
