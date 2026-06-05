import { useState, useMemo } from 'react';
import { useAppState, useHelpers } from '../context/AppContext';
import EmptyState from '../components/ui/EmptyState';

export default function LaporanKeuangan() {
  const state = useAppState();
  const { getModel, getTaylor, formatRupiah, showToast } = useHelpers();

  const [filterTimeframe, setFilterTimeframe] = useState('Bulanan'); // Harian, Mingguan, Bulanan, Tahunan
  const [search, setSearch] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState('Semua'); // Semua, Pemasukan, Pengeluaran, Kasbon, Gaji
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const invoices = state.invoices || [];
  const costHarian = state.costHarian || [];
  const kelaran = state.kelaran || [];
  const kasbon = state.kasbon || [];
  const taylors = state.taylors || [];

  // 1. Calculations
  const metrics = useMemo(() => {
    // Pemasukan: Invoice Lunas + 50% Invoice DP
    const pemasukanLunas = invoices
      .filter(inv => inv.status === 'Lunas')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const pemasukanDP = invoices
      .filter(inv => inv.status === 'DP')
      .reduce((sum, inv) => sum + ((inv.total || 0) * 0.5), 0);

    const totalPemasukan = pemasukanLunas + pemasukanDP;

    // Piutang: Invoice Belum Bayar + 50% Invoice DP
    const piutangBelumBayar = invoices
      .filter(inv => inv.status === 'Belum Bayar')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const piutangDP = invoices
      .filter(inv => inv.status === 'DP')
      .reduce((sum, inv) => sum + ((inv.total || 0) * 0.5), 0);

    const totalPiutang = piutangBelumBayar + piutangDP;

    // Pengeluaran: Cost Harian + Gaji Taylor
    const totalCost = costHarian.reduce((sum, cost) => sum + cost.nominal, 0);
    
    const totalGajiTaylor = kelaran.reduce((sum, k) => {
      const m = getModel(k.modelId);
      return sum + (k.jumlah * (m?.hargaJahit || 0));
    }, 0);

    const totalPengeluaran = totalCost + totalGajiTaylor;
    const profitBersih = totalPemasukan - totalPengeluaran;

    // Hutang Penjahit: outstanding sisaBayar (kelaran - unpaid kasbon)
    let totalHutangPenjahit = 0;
    taylors.forEach(taylor => {
      const taylorKelaran = kelaran.filter(k => k.taylorId === taylor.id);
      const subtotalKelaran = taylorKelaran.reduce((sum, k) => {
        const m = getModel(k.modelId);
        return sum + (k.jumlah * (m?.hargaJahit || 0));
      }, 0);

      const unpaidKasbon = kasbon
        .filter(kb => kb.taylorId === taylor.id && !kb.lunas)
        .reduce((sum, kb) => sum + kb.nominal, 0);

      const sisaBayar = subtotalKelaran - unpaidKasbon;
      if (sisaBayar > 0) {
        totalHutangPenjahit += sisaBayar;
      }
    });

    return {
      totalPemasukan,
      totalPengeluaran,
      profitBersih,
      totalPiutang,
      totalHutangPenjahit,
      totalCost,
      totalGajiTaylor
    };
  }, [invoices, costHarian, kelaran, kasbon, taylors, getModel]);

  // 2. Ledger Items Merger
  const ledgerItems = useMemo(() => {
    const items = [];

    // Invoices as Pemasukan
    invoices.forEach(inv => {
      let nominal = inv.total;
      let desc = `Penjualan: ${inv.produk} (${inv.invoiceNumber})`;
      if (inv.status === 'DP') {
        nominal = inv.total * 0.5;
        desc = `Pemasukan DP 50%: ${inv.produk} (${inv.invoiceNumber})`;
      } else if (inv.status === 'Belum Bayar') {
        return; // No cash flow yet
      }
      items.push({
        id: inv.id,
        tipe: 'Pemasukan',
        kategori: 'Penjualan',
        deskripsi: desc,
        nominal,
        tanggal: inv.tanggal,
      });
    });

    // Cost Harian as Pengeluaran
    costHarian.forEach(cost => {
      items.push({
        id: cost.id,
        tipe: 'Pengeluaran',
        kategori: 'Operasional',
        deskripsi: cost.deskripsi,
        nominal: cost.nominal,
        tanggal: cost.tanggal,
      });
    });

    // Kasbon as Pengeluaran/Kasbon
    kasbon.forEach(kb => {
      const t = getTaylor(kb.taylorId);
      items.push({
        id: kb.id,
        tipe: 'Pengeluaran',
        kategori: 'Kasbon Taylor',
        deskripsi: `Kasbon Taylor: ${t?.nama || 'Penjahit'} (${kb.catatan || 'Tanpa catatan'})`,
        nominal: kb.nominal,
        tanggal: kb.tanggal,
      });
    });

    // Kelaran as Gaji Taylor (estimated pengeluaran)
    kelaran.forEach(k => {
      const t = getTaylor(k.taylorId);
      const m = getModel(k.modelId);
      const amount = k.jumlah * (m?.hargaJahit || 0);
      items.push({
        id: k.id,
        tipe: 'Pengeluaran',
        kategori: 'Gaji Penjahit',
        deskripsi: `Jasa Jahit: ${m?.nama} (${k.jumlah} pcs) oleh ${t?.nama || 'Penjahit'}`,
        nominal: amount,
        tanggal: k.tanggal,
      });
    });

    // Sort by date descending
    return items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }, [invoices, costHarian, kasbon, kelaran, getTaylor, getModel]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return ledgerItems.filter(item => {
      const matchesSearch = item.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
        item.kategori.toLowerCase().includes(search.toLowerCase());
      
      const matchesTipe = ledgerFilter === 'Semua' || 
        (ledgerFilter === 'Pemasukan' && item.tipe === 'Pemasukan') ||
        (ledgerFilter === 'Pengeluaran' && item.tipe === 'Pengeluaran' && item.kategori === 'Operasional') ||
        (ledgerFilter === 'Kasbon' && item.kategori === 'Kasbon Taylor') ||
        (ledgerFilter === 'Gaji' && item.kategori === 'Gaji Penjahit');

      const matchesStart = !startDate || new Date(item.tanggal) >= new Date(startDate);
      const matchesEnd = !endDate || new Date(item.tanggal) <= new Date(endDate);

      return matchesSearch && matchesTipe && matchesStart && matchesEnd;
    });
  }, [ledgerItems, search, ledgerFilter, startDate, endDate]);

  // Ledger Pagination
  const ledgerPerPage = 10;
  const totalLedgerPages = Math.ceil(filteredLedger.length / ledgerPerPage);
  const paginatedLedger = filteredLedger.slice((currentPage - 1) * ledgerPerPage, currentPage * ledgerPerPage);

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Tanggal,Tipe,Kategori,Deskripsi,Nominal\r\n';

    filteredLedger.forEach(item => {
      const row = `"${item.tanggal}","${item.tipe}","${item.kategori}","${item.deskripsi.replace(/"/g, '""')}",${item.nominal}`;
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_KonveksiOS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor CSV berhasil diunduh!', 'success');
  };

  // 3. SVG Chart Data Builder (Simulated 6 periods depending on Timeframe selection)
  const chartData = useMemo(() => {
    // Let's build a timeline of 6 intervals backwards
    const intervals = [];
    const now = new Date();
    
    if (filterTimeframe === 'Harian') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        intervals.push({
          label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          dateString: d.toISOString().split('T')[0],
          pemasukan: 0,
          pengeluaran: 0
        });
      }
    } else if (filterTimeframe === 'Mingguan') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i * 7);
        intervals.push({
          label: `W-${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' })}`,
          dateString: d.toISOString().split('T')[0],
          pemasukan: 0,
          pengeluaran: 0,
          isWeek: true,
          weekOffset: i
        });
      }
    } else if (filterTimeframe === 'Bulanan') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        intervals.push({
          label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          monthNum: d.getMonth(),
          yearNum: d.getFullYear(),
          pemasukan: 0,
          pengeluaran: 0
        });
      }
    } else { // Tahunan
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setFullYear(now.getFullYear() - i);
        intervals.push({
          label: d.getFullYear().toString(),
          yearNum: d.getFullYear(),
          pemasukan: 0,
          pengeluaran: 0
        });
      }
    }

    // Populate data
    ledgerItems.forEach(item => {
      const itemDate = new Date(item.tanggal);
      
      intervals.forEach(interval => {
        let match = false;
        
        if (filterTimeframe === 'Harian') {
          match = item.tanggal === interval.dateString;
        } else if (filterTimeframe === 'Mingguan') {
          const diffTime = Math.abs(new Date(interval.dateString) - itemDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          match = diffDays <= 7 && itemDate <= new Date(interval.dateString);
        } else if (filterTimeframe === 'Bulanan') {
          match = itemDate.getMonth() === interval.monthNum && itemDate.getFullYear() === interval.yearNum;
        } else {
          match = itemDate.getFullYear() === interval.yearNum;
        }

        if (match) {
          if (item.tipe === 'Pemasukan') {
            interval.pemasukan += item.nominal;
          } else {
            interval.pengeluaran += item.nominal;
          }
        }
      });
    });

    return intervals;
  }, [ledgerItems, filterTimeframe]);

  // AI Insights Generator (computed dynamically)
  const aiInsights = useMemo(() => {
    const insights = [];
    const { totalPemasukan, totalPengeluaran, profitBersih, totalCost, totalGajiTaylor } = metrics;

    if (totalPemasukan === 0 && totalPengeluaran === 0) {
      return ["Belum ada data keuangan untuk dianalisis."];
    }

    // Cash flow ratio
    if (totalPengeluaran > 0) {
      const ratio = totalPemasukan / totalPengeluaran;
      if (ratio > 1.5) {
        insights.push("Kondisi keuangan bisnis Anda *Sangat Sehat*. Rasio pemasukan melebihi pengeluaran secara signifikan.");
      } else if (ratio >= 1) {
        insights.push("Margin laba tipis. Lakukan penyesuaian ongkos produksi atau naikkan harga jual jika memungkinkan.");
      } else {
        insights.push("Pengeluaran melebihi pemasukan. Segera tinjau pengeluaran operasional Anda.");
      }
    }

    // Cost Breakdown
    if (totalPengeluaran > 0) {
      const pctGaji = Math.round((totalGajiTaylor / totalPengeluaran) * 100);
      const pctCost = Math.round((totalCost / totalPengeluaran) * 100);

      insights.push(`Biaya produksi (ongkos jahit taylor) menyumbang *${pctGaji}%* dari total pengeluaran.`);
      insights.push(`Biaya operasional & belanja harian menyumbang *${pctCost}%* dari total pengeluaran.`);
    }

    // Largest cost item
    if (costHarian.length > 0) {
      const sortedCost = [...costHarian].sort((a, b) => b.nominal - a.nominal);
      insights.push(`Pengeluaran operasional terbesar adalah *${sortedCost[0].deskripsi}* sebesar *${formatRupiah(sortedCost[0].nominal)}*.`);
    }

    // Invoices Status
    const unpaidInvsCount = invoices.filter(i => i.status !== 'Lunas').length;
    if (unpaidInvsCount > 0) {
      insights.push(`Terdapat *${unpaidInvsCount}* invoice klien yang belum lunas (status DP/Belum Bayar). Segera tindaklanjuti piutang Anda.`);
    }

    return insights;
  }, [metrics, costHarian, invoices, formatRupiah]);

  // Helper: parse insight markdown-like bold *text* into React elements
  const renderInsight = (text) => {
    const parts = text.split(/\*(.*?)\*/g);
    return parts.map((part, idx) => {
      // Odd indices are the bold parts (captured groups)
      if (idx % 2 === 1) {
        return <strong key={idx} className="text-cyan-400 font-bold">{part}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Laporan Keuangan</h1>
          <p className="text-xs text-slate-400 mt-1">Pantau laba bersih, piutang, hutang taylor, operasional, dan tren bisnis Anda.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Ekspor CSV
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Laba Bersih */}
        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/25 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl lg:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Laba Bersih</p>
          <p className={`text-xl font-black mt-2 ${metrics.profitBersih >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatRupiah(metrics.profitBersih)}
          </p>
          <div className="w-1.5 h-12 rounded bg-gradient-to-b from-purple-500 to-cyan-500 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Pemasukan */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Pemasukan Kas</p>
          <p className="text-xl font-black text-slate-100 mt-2">{formatRupiah(metrics.totalPemasukan)}</p>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Pengeluaran Kas</p>
          <p className="text-xl font-black text-slate-100 mt-2">{formatRupiah(metrics.totalPengeluaran)}</p>
        </div>

        {/* Piutang Pelanggan */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Piutang Pelanggan</p>
          <p className="text-xl font-black text-cyan-400 mt-2">{formatRupiah(metrics.totalPiutang)}</p>
        </div>

        {/* Hutang Penjahit */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Hutang Taylor</p>
          <p className="text-xl font-black text-red-400 mt-2">{formatRupiah(metrics.totalHutangPenjahit)}</p>
        </div>
      </div>

      {/* SVG Interactive Chart & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-lg">monitoring</span>
              Grafik Tren Finansial
            </h3>
            <div className="flex gap-1.5 bg-slate-950/40 border border-white/[0.06] rounded-xl p-1 scroll-x-auto">
              {['Harian', 'Mingguan', 'Bulanan', 'Tahunan'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setFilterTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                    filterTimeframe === tf
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Pure SVG Custom Chart */}
          <div className="relative w-full h-[250px] flex items-center justify-center">
            {chartData.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Data tidak cukup untuk merender grafik</p>
            ) : (
              (() => {
                // Determine max values to scale
                const maxVal = Math.max(
                  ...chartData.map(d => Math.max(d.pemasukan, d.pengeluaran)),
                  500000 // default minimum scale roof
                );
                
                // Helper to map values to coordinates
                const mapY = (val) => 210 - (val / maxVal) * 160;
                const mapX = (idx) => 60 + idx * 78;

                // Build path points
                const pemPoints = chartData.map((d, i) => `${mapX(i)},${mapY(d.pemasukan)}`).join(' ');
                const pengPoints = chartData.map((d, i) => `${mapX(i)},${mapY(d.pengeluaran)}`).join(' ');

                return (
                  <svg className="w-full h-full" viewBox="0 0 500 250" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="pemasukan-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="pengeluaran-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                      <line
                        key={idx}
                        x1="50"
                        y1={mapY(maxVal * p)}
                        x2="450"
                        y2={mapY(maxVal * p)}
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Left Y-axis labels */}
                    {[0, 0.5, 1].map((p, idx) => (
                      <text
                        key={idx}
                        x="15"
                        y={mapY(maxVal * p) + 4}
                        fill="rgba(255,255,255,0.3)"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="start"
                      >
                        {formatRupiah(maxVal * p).slice(3)}
                      </text>
                    ))}

                    {/* Pemasukan Fill Area */}
                    <path
                      d={`M 60,210 L ${pemPoints} L ${mapX(chartData.length - 1)},210 Z`}
                      fill="url(#pemasukan-grad)"
                    />

                    {/* Pengeluaran Fill Area */}
                    <path
                      d={`M 60,210 L ${pengPoints} L ${mapX(chartData.length - 1)},210 Z`}
                      fill="url(#pengeluaran-grad)"
                    />

                    {/* Pemasukan Line */}
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      points={pemPoints}
                    />

                    {/* Pengeluaran Line */}
                    <polyline
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      points={pengPoints}
                    />

                    {/* Dots & Interactivity */}
                    {chartData.map((d, i) => (
                      <g key={i} className="group cursor-pointer">
                        {/* Pemasukan dot */}
                        <circle
                          cx={mapX(i)}
                          cy={mapY(d.pemasukan)}
                          r="4"
                          fill="#06b6d4"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                        />
                        {/* Pengeluaran dot */}
                        <circle
                          cx={mapX(i)}
                          cy={mapY(d.pengeluaran)}
                          r="4"
                          fill="#a855f7"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                        />
                        {/* Interactive Tooltip values on dot hover */}
                        <title>
                          {d.label}
                          {"\n"}Pemasukan: {formatRupiah(d.pemasukan)}
                          {"\n"}Pengeluaran: {formatRupiah(d.pengeluaran)}
                        </title>
                      </g>
                    ))}

                    {/* Bottom X-axis labels */}
                    {chartData.map((d, i) => (
                      <text
                        key={i}
                        x={mapX(i)}
                        y="230"
                        fill="rgba(255,255,255,0.4)"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {d.label}
                      </text>
                    ))}
                  </svg>
                );
              })()
            )}
          </div>

          {/* Chart Legend */}
          <div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-wider border-t border-white/[0.04] pt-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="w-3 h-1.5 rounded bg-cyan-400 block" />
              Pemasukan Kas
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <span className="w-3 h-1.5 rounded bg-purple-400 block" />
              Pengeluaran
            </div>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-cyan-400 text-lg">insights</span>
              Rekomendasi & AI Insights
            </h3>
            <div className="space-y-4">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 text-xs leading-relaxed text-slate-300 p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl relative overflow-hidden"
                >
                  <span className="material-symbols-outlined text-purple-400 text-[18px] shrink-0 mt-0.5">wb_incandescent</span>
                  <span>{renderInsight(insight)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-bold text-center mt-4 border-t border-white/[0.04] pt-4">
            Analisis dihasilkan secara dinamis berdasarkan data aktual dalam sistem lokal Anda.
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400 text-lg">receipt_long</span>
          Buku Besar Transaksi (Ledger)
        </h3>

        {/* Ledger Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-500">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Cari deskripsi atau kategori..."
              className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
            />
          </div>

          {/* Type dropdown */}
          <select
            value={ledgerFilter}
            onChange={(e) => { setLedgerFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-300 rounded-xl px-3 py-2 text-xs focus:border-cyan-400 transition-all font-semibold appearance-none"
          >
            <option value="Semua">Semua Transaksi</option>
            <option value="Pemasukan">Pemasukan (Klien)</option>
            <option value="Pengeluaran">Belanja Harian (Operasional)</option>
            <option value="Kasbon">Kasbon Taylor</option>
            <option value="Gaji">Gaji Taylor (Kelaran)</option>
          </select>

          {/* Date Pickers */}
          <div className="md:col-span-2 flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950/40 border border-white/[0.06] text-slate-300 rounded-xl px-3 py-2 text-xs focus:border-cyan-400 w-full font-semibold"
            />
            <span className="text-xs text-slate-500">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950/40 border border-white/[0.06] text-slate-300 rounded-xl px-3 py-2 text-xs focus:border-cyan-400 w-full font-semibold"
            />
          </div>
        </div>

        {/* Ledger Table Rendering */}
        {paginatedLedger.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="Tidak Ada Transaksi"
            description="Tidak ada transaksi keuangan yang sesuai dengan filter pencarian Anda."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500 font-bold">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Deskripsi Transaksi</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLedger.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.04] text-slate-300 hover:bg-white/[0.01] transition-all font-semibold"
                  >
                    <td className="py-3 px-4 text-slate-500 font-bold">{item.tanggal}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        item.kategori === 'Penjualan' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.kategori === 'Kasbon Taylor' ? 'bg-red-500/10 text-red-400' :
                        item.kategori === 'Gaji Penjahit' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-cyan-500/10 text-cyan-400'
                      }`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{item.deskripsi}</td>
                    <td className={`py-3 px-4 text-right font-black ${
                      item.tipe === 'Pemasukan' ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {item.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(item.nominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ledger Pagination */}
        {totalLedgerPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 no-print">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-white/[0.06] bg-slate-900/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>
            
            {Array.from({ length: totalLedgerPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${
                  currentPage === idx + 1
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg'
                    : 'bg-slate-900/60 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalLedgerPages))}
              disabled={currentPage === totalLedgerPages}
              className="p-1.5 rounded-lg border border-white/[0.06] bg-slate-900/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
