export const initialTaylors = [
  { id: 't1', nama: 'Taylor A (Pak Udin)', userId: 'u1' },
  { id: 't2', nama: 'Taylor B (Bu Siti)', userId: 'u1' },
  { id: 't3', nama: 'Taylor C (Pak Rahmat)', userId: 'u1' },
];

export const initialModels = [
  { id: 'm1', nama: 'Gamis A', hargaJahit: 15000, userId: 'u1' },
  { id: 'm2', nama: 'Kemeja Polos', hargaJahit: 12000, userId: 'u1' },
  { id: 'm3', nama: 'Kaos Oblong', hargaJahit: 8000, userId: 'u1' },
  { id: 'm4', nama: 'Celana Panjang', hargaJahit: 10000, userId: 'u1' },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

export const initialBarangMasuk = [
  { id: 'bm1', modelId: 'm1', jumlah: 100, sisaBelumDistribusi: 20, tanggal: twoDaysAgo, catatan: 'Kain dari Pak Hasan', userId: 'u1' },
  { id: 'bm2', modelId: 'm2', jumlah: 80, sisaBelumDistribusi: 30, tanggal: yesterday, catatan: 'Cutting batch 2', userId: 'u1' },
  { id: 'bm3', modelId: 'm3', jumlah: 150, sisaBelumDistribusi: 150, tanggal: today, catatan: '', userId: 'u1' },
];

export const initialDistribusi = [
  { id: 'd1', barangMasukId: 'bm1', taylorId: 't1', modelId: 'm1', jumlah: 50, tanggal: twoDaysAgo, userId: 'u1' },
  { id: 'd2', barangMasukId: 'bm1', taylorId: 't2', modelId: 'm1', jumlah: 30, tanggal: yesterday, userId: 'u1' },
  { id: 'd3', barangMasukId: 'bm2', taylorId: 't1', modelId: 'm2', jumlah: 25, tanggal: yesterday, userId: 'u1' },
  { id: 'd4', barangMasukId: 'bm2', taylorId: 't3', modelId: 'm2', jumlah: 25, tanggal: today, userId: 'u1' },
];

export const initialKelaran = [
  { id: 'k1', distribusiId: 'd1', taylorId: 't1', modelId: 'm1', jumlah: 30, tanggal: yesterday, userId: 'u1' },
  { id: 'k2', distribusiId: 'd2', taylorId: 't2', modelId: 'm1', jumlah: 15, tanggal: today, userId: 'u1' },
  { id: 'k3', distribusiId: 'd3', taylorId: 't1', modelId: 'm2', jumlah: 10, tanggal: today, userId: 'u1' },
];

export const initialKasbon = [
  { id: 'kb1', taylorId: 't1', nominal: 100000, lunas: false, tanggal: yesterday, catatan: 'Keperluan pribadi', userId: 'u1' },
  { id: 'kb2', taylorId: 't2', nominal: 50000, lunas: false, tanggal: today, catatan: 'Pinjaman makan', userId: 'u1' },
];

export const initialCostHarian = [
  { id: 'ch1', deskripsi: 'Beli benang', nominal: 25000, tanggal: yesterday, userId: 'u1' },
  { id: 'ch2', deskripsi: 'Beli jarum', nominal: 15000, tanggal: yesterday, userId: 'u1' },
  { id: 'ch3', deskripsi: 'Makan siang', nominal: 50000, tanggal: today, userId: 'u1' },
  { id: 'ch4', deskripsi: 'Bensin motor', nominal: 20000, tanggal: today, userId: 'u1' },
];

export const initialCustomers = [
  { id: 'c1', nama: 'CV Jaya Abadi', phone: '081234567890', alamat: 'Jalan Raya Industri No. 12, Bandung', userId: 'u1' },
  { id: 'c2', nama: 'Butik Cantik Ibu Linda', phone: '087712345678', alamat: 'Kopo Permai Block C-4, Bandung', userId: 'u1' },
];

export const initialInvoices = [
  { id: 'inv1', invoiceNumber: 'INV-2026-001', customerId: 'c1', produk: 'Kaos Polo Seragam', qty: 100, harga: 45000, discount: 150000, tax: 0, shipping: 50000, total: 4400000, status: 'Lunas', tanggal: yesterday, userId: 'u1' },
  { id: 'inv2', invoiceNumber: 'INV-2026-002', customerId: 'c2', produk: 'Gamis Satin Premium', qty: 30, harga: 125000, discount: 0, tax: 375000, shipping: 35000, total: 4160000, status: 'DP', tanggal: today, userId: 'u1' },
];

export const defaultUser = {
  id: 'u1',
  nama: 'Admin Konveksi',
  username: 'admin',
  email: 'admin@konveksios.com',
  password: 'admin', // simple default password
  role: 'Owner',
  categories: ['Kaos', 'Kemeja', 'Jaket'],
  businessProfile: {
    namaUsaha: 'Stitch & Sew',
    telepon: '08123456789',
    email: 'info@stitchsew.com',
    alamat: 'Jl. Produksi No. 45'
  }
};

export function getInitialState() {
  return {
    users: [defaultUser],
    currentUser: null, // start logged out by default or checked by app layout
    taylors: initialTaylors,
    models: initialModels,
    barangMasuk: initialBarangMasuk,
    distribusi: initialDistribusi,
    kelaran: initialKelaran,
    kasbon: initialKasbon,
    costHarian: initialCostHarian,
    customers: initialCustomers,
    invoices: initialInvoices,
    trackingJobs: [],
    toasts: [],
  };
}
