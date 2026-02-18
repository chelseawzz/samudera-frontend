

// src/utils/formatters.ts

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

// ✅ PERBAIKAN: Tampilkan ton utuh dengan 3 desimal (1 kg = 0.001 ton)
export const formatTon = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value) + ' ton';
};

export const formatHa = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} rb Ha`;
  }
  return `${value.toFixed(2)} Ha`;
};