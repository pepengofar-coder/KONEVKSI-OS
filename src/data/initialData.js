export const initialTaylors = [
  { id: 't1', nama: 'Taylor A (Pak Udin)' },
  { id: 't2', nama: 'Taylor B (Bu Siti)' },
  { id: 't3', nama: 'Taylor C (Pak Rahmat)' },
];

export const initialModels = [
  { id: 'm1', nama: 'Gamis A', hargaJahit: 15000 },
  { id: 'm2', nama: 'Kemeja Polos', hargaJahit: 12000 },
  { id: 'm3', nama: 'Kaos Oblong', hargaJahit: 8000 },
  { id: 'm4', nama: 'Celana Panjang', hargaJahit: 10000 },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

export const initialBarangMasuk = [
  { id: 'bm1', modelId: 'm1', jumlah: 100, sisaBelumDistribusi: 20, tanggal: twoDaysAgo, catatan: 'Kain dari Pak Hasan' },
  { id: 'bm2', modelId: 'm2', jumlah: 80, sisaBelumDistribusi: 30, tanggal: yesterday, catatan: 'Cutting batch 2' },
  { id: 'bm3', modelId: 'm3', jumlah: 150, sisaBelumDistribusi: 150, tanggal: today, catatan: '' },
];

export const initialDistribusi = [
  { id: 'd1', barangMasukId: 'bm1', taylorId: 't1', modelId: 'm1', jumlah: 50, tanggal: twoDaysAgo },
  { id: 'd2', barangMasukId: 'bm1', taylorId: 't2', modelId: 'm1', jumlah: 30, tanggal: yesterday },
  { id: 'd3', barangMasukId: 'bm2', taylorId: 't1', modelId: 'm2', jumlah: 25, tanggal: yesterday },
  { id: 'd4', barangMasukId: 'bm2', taylorId: 't3', modelId: 'm2', jumlah: 25, tanggal: today },
];

export const initialKelaran = [
  { id: 'k1', distribusiId: 'd1', taylorId: 't1', modelId: 'm1', jumlah: 30, tanggal: yesterday },
  { id: 'k2', distribusiId: 'd2', taylorId: 't2', modelId: 'm1', jumlah: 15, tanggal: today },
  { id: 'k3', distribusiId: 'd3', taylorId: 't1', modelId: 'm2', jumlah: 10, tanggal: today },
];

export const initialKasbon = [
  { id: 'kb1', taylorId: 't1', nominal: 100000, lunas: false, tanggal: yesterday, catatan: 'Keperluan pribadi' },
  { id: 'kb2', taylorId: 't2', nominal: 50000, lunas: false, tanggal: today, catatan: 'Pinjaman makan' },
];

export const initialCostHarian = [
  { id: 'ch1', deskripsi: 'Beli benang', nominal: 25000, tanggal: yesterday },
  { id: 'ch2', deskripsi: 'Beli jarum', nominal: 15000, tanggal: yesterday },
  { id: 'ch3', deskripsi: 'Makan siang', nominal: 50000, tanggal: today },
  { id: 'ch4', deskripsi: 'Bensin motor', nominal: 20000, tanggal: today },
];

export function getInitialState() {
  return {
    taylors: initialTaylors,
    models: initialModels,
    barangMasuk: initialBarangMasuk,
    distribusi: initialDistribusi,
    kelaran: initialKelaran,
    kasbon: initialKasbon,
    costHarian: initialCostHarian,
  };
}
