import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L as any).Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapPosition({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapLegend({ jenis }: { jenis: 'tangkap' | 'budidaya' }) {
  const legendColor = jenis === 'tangkap' ? 'bg-blue-500' : 'bg-green-500';
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 absolute top-4 left-4 z-[1000] max-w-xs">
      <h3 className="font-bold text-lg mb-2">
        {jenis === 'tangkap' ? 'Perikanan Tangkap' : 'Perikanan Budidaya'}
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        Warna wilayah menunjukkan volume produksi per kabupaten/kota
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded ${legendColor} opacity-30`}></div>
          <span className="text-xs">Rendah</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded ${legendColor} opacity-60`}></div>
          <span className="text-xs">Sedang</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded ${legendColor} opacity-100`}></div>
          <span className="text-xs">Tinggi</span>
        </div>
      </div>
    </div>
  );
}

function MapFilter({ 
  selectedYear, 
  setSelectedYear, 
  selectedJenis, 
  setSelectedJenis 
}: {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedJenis: 'tangkap' | 'budidaya';
  setSelectedJenis: (jenis: 'tangkap' | 'budidaya') => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 absolute top-4 right-4 z-[1000]">
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            {[2025, 2024, 2023, 2022, 2021].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Perikanan</label>
          <select
            value={selectedJenis}
            onChange={e => setSelectedJenis(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="tangkap">Perikanan Tangkap</option>
            <option value="budidaya">Perikanan Budidaya</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function JatimMap() {
  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedJenis, setSelectedJenis] = useState<'tangkap' | 'budidaya'>('tangkap');
  const [mapData, setMapData] = useState<{ [key: string]: { total: number; detail: { [key: string]: number } } }>({});
  const [loading, setLoading] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    fetch('/jatim_kabkota_geojson.json')
      .then(res => res.json())
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  useEffect(() => {
    setLoading(true);

    const url =
      selectedJenis === 'tangkap'
        ? `http://localhost/samudata/api/tangkap_fetch.php?tahun=${selectedYear}`
        : `http://localhost/samudata/api/budidaya_fetch.php?tahun=${selectedYear}`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        let productionData: { [key: string]: { total: number; detail: { [key: string]: number } } } = {};

        if (selectedJenis === 'tangkap') {
          const produksiWilayah = json.produksi_wilayah || [];
          produksiWilayah.forEach((item: any) => {
            const wilayahName = item.wilayah.toUpperCase();
            productionData[wilayahName] = {
              total: item.total || 0,
              detail: {
                laut: item.laut || 0,
                perairan: item.pud || 0,
              },
            };
          });
        }

        if (selectedJenis === 'budidaya') {
          const matrixRows = json.matrix?.rows || [];
          matrixRows.forEach((row: any) => {
            const total = 
              Number(row.Volume_Laut || 0) + 
              Number(row.Volume_Tambak || 0) + 
              Number(row.Volume_Kolam || 0) + 
              Number(row.Volume_MinaPadi || 0) + 
              Number(row.Volume_Karamba || 0) + 
              Number(row.Volume_JaringApung || 0);
            
            const wilayahName = row.Wilayah?.toUpperCase() || '';
            productionData[wilayahName] = {
              total,
              detail: {
                laut: Number(row.Volume_Laut || 0),
                tambak: Number(row.Volume_Tambak || 0),
                kolam: Number(row.Volume_Kolam || 0),
                minapadi: Number(row.Volume_MinaPadi || 0),
                karamba: Number(row.Volume_Karamba || 0),
                japung: Number(row.Volume_JaringApung || 0),
              },
            };
          });
        }

        setMapData(productionData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, [selectedYear, selectedJenis]);

  const getColor = (value: number) => {
    if (!value || value === 0) return '#cccccc';
    
    const values = Object.values(mapData).map(d => d.total).filter(v => v > 0);
    const maxProduction = values.length > 0 ? Math.max(...values) : 1;
    const ratio = value / maxProduction;
    
    if (selectedJenis === 'tangkap') {
      return ratio > 0.7 ? '#1e3a8a' :
             ratio > 0.5 ? '#1e40af' :
             ratio > 0.3 ? '#3b82f6' :
             ratio > 0.1 ? '#60a5fa' : '#93c5fd';
    } else {
      return ratio > 0.7 ? '#065f46' :
             ratio > 0.5 ? '#047857' :
             ratio > 0.3 ? '#10b981' :
             ratio > 0.1 ? '#34d399' : '#6ee7b7';
    }
  };

  const onEachFeature = (feature: any, layer: any) => {
  const wilayahName = feature.properties.NAME_2 || '';
  const wilayahData = mapData[wilayahName.toUpperCase()];
  const totalProduksi = wilayahData?.total || 0;
  const detail = wilayahData?.detail || {};

  const tooltipContent = `
    <div class="bg-white rounded-lg shadow-lg p-3 min-w-[220px] border-2 ${selectedJenis === 'tangkap' ? 'border-blue-500' : 'border-green-500'}">
      <table class="w-full text-sm">
        <tbody>
          <tr class="border-b border-gray-200">
            <td class="py-1.5 text-gray-600">Produksi Tahun</td>
            <td class="py-1.5 text-right font-medium">${selectedYear}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-1.5 text-gray-600">Provinsi</td>
            <td class="py-1.5 text-right font-medium">Jawa Timur</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-1.5 text-gray-600">Kabupaten/Kota</td>
            <td class="py-1.5 text-right font-bold">${wilayahName}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-1.5 text-gray-600">Total Produksi</td>
            <td class="py-1.5 text-right font-bold ${selectedJenis === 'tangkap' ? 'text-blue-600' : 'text-green-600'}">
              ${totalProduksi.toLocaleString('id-ID')} ton
            </td>
          </tr>
          ${selectedJenis === 'tangkap' ? `
            ${detail.laut !== undefined ? `
            <tr class="border-b border-gray-200">
              <td class="py-1 text-gray-600">Laut</td>
              <td class="py-1 text-right font-semibold">${(detail.laut || 0).toLocaleString('id-ID')} ton</td>
            </tr>
            ` : ''}
            ${detail.perairan !== undefined ? `
            <tr>
              <td class="py-1 text-gray-600">Perairan Umum Darat</td>
              <td class="py-1 text-right font-semibold">${(detail.perairan || 0).toLocaleString('id-ID')} ton</td>
            </tr>
            ` : ''}
          ` : `
            <tr class="border-b border-gray-200">
              <td class="py-1 text-gray-600">Laut</td>
              <td class="py-1 text-right font-semibold">${(detail.laut || 0).toLocaleString('id-ID')} ton</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-1 text-gray-600">Tambak</td>
              <td class="py-1 text-right font-semibold">${(detail.tambak || 0).toLocaleString('id-ID')} ton</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-1 text-gray-600">Kolam</td>
              <td class="py-1 text-right font-semibold">${(detail.kolam || 0).toLocaleString('id-ID')} ton</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-1 text-gray-600">Mina Padi</td>
              <td class="py-1 text-right font-semibold">${(detail.minapadi || 0).toLocaleString('id-ID')} ton</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-1 text-gray-600">Karamba</td>
              <td class="py-1 text-right font-semibold">${(detail.karamba || 0).toLocaleString('id-ID')} ton</td>
            </tr>
            <tr>
              <td class="py-1 text-gray-600">Jaring Apung</td>
              <td class="py-1 text-right font-semibold">${(detail.japung || 0).toLocaleString('id-ID')} ton</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  layer.bindTooltip(tooltipContent, {
    permanent: false,
    direction: 'top',
    offset: [0, -10],
    opacity: 1,
    className: 'custom-tooltip',
    sticky: true
  });

  layer.on({
    mouseover: (e: any) => {
      const layer = e.target;
      layer.setStyle({
        fillOpacity: 0.9,
        weight: 3,
        color: selectedJenis === 'tangkap' ? '#1e3a8a' : '#065f46',
      });
      layer.bringToFront();
    },
    mouseout: (e: any) => {
      const layer = e.target;
      layer.setStyle({
        fillOpacity: 0.7,
        weight: 1,
        color: '#333',
      });
    },
    click: (e: any) => {
      layer.openTooltip();
    }
  });

  layer.setStyle({
    fillColor: getColor(totalProduksi),
    weight: 1,
    opacity: 1,
    color: '#333',
    fillOpacity: 0.7
  });
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[2000]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium text-lg">Memuat data peta...</p>
            </div>
          </div>
        )}

        <MapContainer
          center={[-7.5, 112.5]}
          zoom={8}
          className="h-full w-full"
          maxBounds={[
            [-8.9, 111.0],
            [-6.5, 114.5],
          ]}
          maxBoundsViscosity={1.0}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
        >
          <MapPosition center={[-7.5, 112.5]} zoom={8} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geoJsonData && (
            <GeoJSON
              data={geoJsonData}
              onEachFeature={onEachFeature}
              key={selectedYear + selectedJenis + JSON.stringify(mapData)}
            />
          )}
        </MapContainer>

        <MapLegend jenis={selectedJenis} />
        <MapFilter 
          selectedYear={selectedYear} 
          setSelectedYear={setSelectedYear} 
          selectedJenis={selectedJenis} 
          setSelectedJenis={setSelectedJenis} 
        />

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-6 py-3 z-[1000]">
          <p className="text-sm text-gray-600">
            Data tahun {selectedYear} - {selectedJenis === 'tangkap' ? 'Perikanan Tangkap' : 'Perikanan Budidaya'} - 
            Sumber: Dinas Kelautan dan Perikanan Provinsi Jawa Timur
          </p>
        </div>
      </div>
    </div>
  );
}