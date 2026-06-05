import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';
import Modal from '../ui/Modal';

const formatCurrency = (val) => val ? parseInt(String(val).replace(/\./g, '').replace(/[^\d]/g, ''), 10).toLocaleString('id-ID') : '';
const parseCurrency = (str) => parseInt(String(str).replace(/\./g, '').replace(/[^\d]/g, ''), 10) || 0;

export default function InvoicePelangganForm({ isOpen, onClose, invoiceToEdit = null }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useHelpers();

  const customers = state.customers || [];

  const [customerId, setCustomerId] = useState('');
  const [produk, setProduk] = useState('');
  const [qty, setQty] = useState('');
  const [harga, setHarga] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState(''); // in percentage, e.g. 11 for 11%
  const [shipping, setShipping] = useState('');
  const [status, setStatus] = useState('Belum Bayar');
  const [tanggal, setTanggal] = useState('');

  useEffect(() => {
    if (invoiceToEdit) {
      setCustomerId(invoiceToEdit.customerId);
      setProduk(invoiceToEdit.produk);
      setQty(invoiceToEdit.qty);
      setHarga(formatCurrency(invoiceToEdit.harga));
      setDiscount(invoiceToEdit.discount ? formatCurrency(invoiceToEdit.discount) : '');
      setTax(invoiceToEdit.tax || '');
      setShipping(invoiceToEdit.shipping ? formatCurrency(invoiceToEdit.shipping) : '');
      setStatus(invoiceToEdit.status || 'Belum Bayar');
      setTanggal(invoiceToEdit.tanggal || '');
    } else {
      setCustomerId(customers[0]?.id || '');
      setProduk('');
      setQty('');
      setHarga('');
      setDiscount('');
      setTax('');
      setShipping('');
      setStatus('Belum Bayar');
      setTanggal(new Date().toISOString().split('T')[0]);
    }
  }, [invoiceToEdit, isOpen, customers]);

  // Calculate live total
  const qtyNum = parseInt(qty) || 0;
  const hargaNum = parseCurrency(harga);
  const discountNum = parseCurrency(discount);
  const taxPercent = parseFloat(tax) || 0;
  const shippingNum = parseCurrency(shipping);

  const subtotal = qtyNum * hargaNum;
  const taxAmount = Math.round((subtotal - discountNum) * (taxPercent / 100));
  const totalCalculated = subtotal - discountNum + taxAmount + shippingNum;

  const handleTaxChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setTax('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setTax(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      showToast('Pilih pelanggan terlebih dahulu!', 'error');
      return;
    }
    if (!produk || !qty || !harga) {
      showToast('Lengkapi produk, jumlah, dan harga!', 'error');
      return;
    }

    const payload = {
      customerId,
      produk,
      qty: qtyNum,
      harga: hargaNum,
      discount: discountNum,
      tax: taxPercent,
      shipping: shippingNum,
      total: totalCalculated,
      status,
      tanggal
    };

    if (invoiceToEdit) {
      dispatch({
        type: 'EDIT_INVOICE',
        payload: {
          id: invoiceToEdit.id,
          ...payload
        }
      });
      showToast('Invoice berhasil diperbarui!', 'success');
    } else {
      dispatch({
        type: 'ADD_INVOICE',
        payload
      });
      showToast('Invoice baru berhasil dibuat!', 'success');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoiceToEdit ? 'Ubah Invoice Pelanggan' : 'Buat Invoice Baru'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Customer selection */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Pilih Pelanggan</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="input-base appearance-none"
              required
            >
              <option value="" disabled className="bg-slate-950 text-slate-400">Pilih klien...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                  {c.nama} ({c.phone || 'Tanpa kontak'})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Invoice</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="input-base"
              required
            />
          </div>

          {/* Produk */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Produk / Jasa Pembuatan</label>
            <input
              type="text"
              value={produk}
              onChange={(e) => setProduk(e.target.value)}
              placeholder="Contoh: Kaos Polo Bordir Seragam Angkatan"
              className="input-base"
              required
            />
          </div>

          {/* Qty */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Jumlah (Pcs/Lusin)</label>
            <input
              type="number"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="100"
              min="1"
              className="input-base font-semibold"
              required
            />
          </div>

          {/* Harga Satuan */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Harga Satuan (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={harga}
              onChange={(e) => setHarga(formatCurrency(e.target.value))}
              placeholder="45.000"
              className="input-base font-semibold"
              required
            />
          </div>

          {/* Diskon */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Potongan Diskon (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={discount}
              onChange={(e) => setDiscount(formatCurrency(e.target.value))}
              placeholder="0"
              className="input-base"
            />
          </div>

          {/* Pajak (%) */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Pajak (%)</label>
            <input
              type="number"
              inputMode="numeric"
              value={tax}
              onChange={handleTaxChange}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
              className="input-base"
            />
          </div>

          {/* Ongkos Kirim */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Ongkos Kirim (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={shipping}
              onChange={(e) => setShipping(formatCurrency(e.target.value))}
              placeholder="0"
              className="input-base"
            />
          </div>

          {/* Status Bayar */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Status Pembayaran</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-base appearance-none"
            >
              <option value="Belum Bayar" className="bg-slate-950 text-red-400">Belum Bayar</option>
              <option value="DP" className="bg-slate-950 text-cyan-400">DP (Down Payment)</option>
              <option value="Lunas" className="bg-slate-950 text-emerald-400">Lunas</option>
            </select>
          </div>
        </div>

        {/* Live Calculation display */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-2 text-xs font-semibold">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal ({qtyNum} x Rp {hargaNum.toLocaleString('id-ID')})</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discountNum > 0 && (
            <div className="flex justify-between text-red-400">
              <span>Diskon</span>
              <span>- Rp {discountNum.toLocaleString('id-ID')}</span>
            </div>
          )}
          {taxPercent > 0 && (
            <div className="flex justify-between text-purple-400">
              <span>Pajak ({taxPercent}%)</span>
              <span>+ Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
          {shippingNum > 0 && (
            <div className="flex justify-between text-cyan-400">
              <span>Ongkos Kirim</span>
              <span>+ Rp {shippingNum.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-100 border-t border-white/[0.06] pt-2 mt-2">
            <span>Total Tagihan</span>
            <span className="text-cyan-400">Rp {totalCalculated.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
        >
          {invoiceToEdit ? 'Simpan Perubahan' : 'Buat Invoice & Simpan'}
        </button>
      </form>
    </Modal>
  );
}
