import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function NilaiBulanan({ tahun }: { tahun: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost/samudata/api/tangkap_fetch.php?tahun=${tahun}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(json => {
        console.log("DATA API:", json);
        
        // Transform nilai_bulanan ke format chart
        if (json.nilai_bulanan && Array.isArray(json.nilai_bulanan)) {
          const transformedData = transformDataForChart(json.nilai_bulanan);
          setData(transformedData);
        } else {
          setData([]);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [tahun]);

  // Transform data dari format database ke format chart
  const transformDataForChart = (nilaiBulanan: any[]) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Buat array untuk setiap bulan
    const chartData = months.map((month, index) => {
      const monthKey = month;
      return {
        bulan: month.substring(0, 3), // Ambil 3 huruf pertama
        Laut: nilaiBulanan.find(item => item.Uraian === "Laut")?.[monthKey] || 0,
        "Perairan Umum Darat": nilaiBulanan.find(item => item.Uraian === "Perairan Umum Darat")?.[monthKey] || 0,
      };
    });

    return chartData;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="text-red-500 text-center">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">
        Perikanan Tangkap Bulanan {tahun}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bulan" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString('id-ID'), 'Nilai']}
            labelFormatter={(label) => `Bulan: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Laut"
            stroke="#2563eb"
            strokeWidth={2}
            name="Laut"
            dot={{ fill: '#2563eb' }}
          />
          <Line
            type="monotone"
            dataKey="Perairan Umum Darat"
            stroke="#10b981"
            strokeWidth={2}
            name="Perairan Umum Darat"
            dot={{ fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}