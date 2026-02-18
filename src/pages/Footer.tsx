import { Mail, Phone, Instagram, ExternalLink } from 'lucide-react';

const logoDKP = '/logo.png';

export function Footer() {
  return (
    <footer className="bg-blue-950 text-white mt-16">
      <div className="container mx-auto px-4 py-8">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">

          {/* ================= KONTAK + LINK TERKAIT ================= */}
          <div>
            <h3 className="text-base font-bold mb-3">Kontak Kami</h3>
            <div className="space-y-2 text-sm">
              <p>Jl. Ahmad Yani No. 152</p>
              <p>Surabaya, Jawa Timur 60231</p>

              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <a href="mailto:dkp@jatimprov.go.id" className="hover:text-blue-300">
                  dkp@jatimprov.go.id
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <a href="tel:0318281672" className="hover:text-blue-300">
                  (031) 8281672
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">

            {/* Instagram */}
            <a
              href="https://www.instagram.com/diskanlajatim"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300"
              aria-label="Instagram DKP Jatim"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Telepon */}
            <a
              href="tel:0318292016"
              className="hover:text-blue-300"
              aria-label="Telepon DKP Jatim"
            >
              <Phone className="w-4 h-4" />
            </a>

          </div>


            {/* LINK TERKAIT (PINDAH KE SINI) */}
            <div className="mt-5">
              <h4 className="text-sm font-semibold mb-2">Link Terkait</h4>
              <div className="space-y-2 text-sm">
                <a
                  href="https://kkp.go.id"
                  target="_blank"
                  className="flex items-center gap-1 hover:text-blue-300"
                >
                  Kementerian Kelautan dan Perikanan
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="https://dkp.jatimprov.go.id/"
                  target="_blank"
                  className="flex items-center gap-1 hover:text-blue-300"
                >
                  DKP Provinsi Jawa Timur
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* ================= SAMUDERA ================= */}
          <div>
            <div className="text-2xl font-bold text-blue-300 mb-1">
              SAMUDERA
            </div>
            <p className="text-sm font-semibold">
               Sistem Analisis dan Monitoring Data Perikanan dan Kelautan 
            </p>
            <p className="text-sm">Provinsi Jawa Timur</p>

            <p className="text-sm italic text-blue-200 mt-3 leading-relaxed">
              "Lautnya Luas, Datanya Jelas,<br />
              SAMUDERA Solusi Cerdas"
            </p>
          </div>

          {/* ================= MAP (DIPERLEBAR KE KIRI) ================= */}
          <div className="bg-blue-900/40 border border-blue-800 rounded-2xl p-4 md:col-span-2 w-full">
            <div className="rounded-xl overflow-hidden border border-blue-700/50 shadow-lg">
              <iframe
                title="DKP Jawa Timur"
                src="https://www.google.com/maps?q=Dinas+Kelautan+dan+Perikanan+Provinsi+Jawa+Timur&output=embed"
                className="w-full h-[240px] border-0"
                loading="lazy"
              />
            </div>

            <p className="text-sm text-blue-200 text-center mt-2">
              Lokasi Dinas Kelautan dan Perikanan Provinsi Jawa Timur
            </p>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-blue-800 mt-6 pt-4">
          <p className="text-center text-sm text-blue-300">
            © 2026 Dinas Kelautan dan Perikanan Provinsi Jawa Timur
          </p>
        </div>

      </div>
    </footer>
  );
}