import { useState, useEffect } from 'react';
import { useHelpers } from '../../context/AppContext';

// Standard Indonesian cities with coordinates
const CITIES = [
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
  { name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
  { name: 'Medan', lat: 3.5952, lon: 98.6722 },
  { name: 'Makassar', lat: -5.1477, lon: 119.4327 },
  { name: 'Yogyakarta', lat: -7.7956, lon: 110.3695 }
];

const PRAYER_NAMES = {
  Fajr: 'Shubuh',
  Dhuhr: 'Dzuhur',
  Asr: 'Ashar',
  Maghrib: 'Maghrib',
  Isha: 'Isya'
};

const PRAYER_ICONS = {
  Fajr: 'wb_twilight',
  Dhuhr: 'wb_sunny',
  Asr: 'filter_drama',
  Maghrib: 'nights_stay',
  Isha: 'bedtime'
};

export default function PrayerCalendarWidget() {
  const { showToast } = useHelpers();
  
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [coords, setCoords] = useState({ lat: CITIES[0].lat, lon: CITIES[0].lon, label: CITIES[0].name });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock runner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Compute next prayer timing highlight on the fly during render
  const getNextPrayer = () => {
    if (!data?.timings) return 'Fajr';
    
    const nowHour = currentTime.getHours();
    const nowMin = currentTime.getMinutes();
    const nowTotalMin = nowHour * 60 + nowMin;

    let foundNext = 'Fajr';
    const timings = data.timings;
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (const key of prayers) {
      if (timings[key]) {
        const [h, m] = timings[key].split(':').map(Number);
        const prayerTotalMin = h * 60 + m;
        if (nowTotalMin < prayerTotalMin) {
          foundNext = key;
          break;
        }
      }
    }
    return foundNext;
  };

  const nextPrayer = getNextPrayer();

  // Fetch timings
  useEffect(() => {
    const fetchTimings = async () => {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const cacheKey = `prayer-cache-${coords.lat.toFixed(4)}-${coords.lon.toFixed(4)}-${todayStr}`;
      
      // Try local cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setLoading(false);
          return;
        } catch {
          // ignore cache error and fetch
        }
      }

      try {
        // Method 15 is Ministry of Religious Affairs (Kemenag) RI
        const url = `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${coords.lat}&longitude=${coords.lon}&method=15`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch from Aladhan API');
        const json = await res.json();
        
        if (json.code === 200 && json.data) {
          const prayerData = {
            timings: {
              Fajr: json.data.timings.Fajr,
              Dhuhr: json.data.timings.Dhuhr,
              Asr: json.data.timings.Asr,
              Maghrib: json.data.timings.Maghrib,
              Isha: json.data.timings.Isha
            },
            hijri: json.data.date.hijri,
            gregorian: json.data.date.gregorian
          };
          
          setData(prayerData);
          localStorage.setItem(cacheKey, JSON.stringify(prayerData));
        }
      } catch (err) {
        console.error(err);
        showToast('Gagal memuat jadwal shalat. Menggunakan data default.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  // Handle geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      showToast('Browser Anda tidak mendukung deteksi lokasi.', 'error');
      return;
    }
    
    showToast('Mendeteksi lokasi Anda...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: 'Lokasi Anda'
        });
        showToast('Lokasi berhasil disesuaikan!', 'success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        showToast('Gagal mendeteksi lokasi. Pilih kota secara manual.', 'error');
      }
    );
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city);
      setCoords({ lat: city.lat, lon: city.lon, label: city.name });
    }
  };

  const getDayNameIndonesian = (dayNameEn) => {
    const dayMap = {
      Sunday: 'Minggu',
      Monday: 'Senin',
      Tuesday: 'Selasa',
      Wednesday: 'Rabu',
      Thursday: 'Kamis',
      Friday: 'Jumat',
      Saturday: 'Sabtu'
    };
    return dayMap[dayNameEn] || dayNameEn;
  };

  const getMonthNameIndonesian = (monthNameEn) => {
    const monthMap = {
      January: 'Januari',
      February: 'Februari',
      March: 'Maret',
      April: 'April',
      May: 'Mei',
      June: 'Juni',
      July: 'Juli',
      August: 'Agustus',
      September: 'September',
      October: 'Oktober',
      November: 'November',
      December: 'Desember'
    };
    return monthMap[monthNameEn] || monthNameEn;
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-6">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-48 h-48 bg-purple-500/[0.03] rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-48 h-48 bg-cyan-500/[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* 1. Left Section: Hijri & Gregorian Calendar */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase">Kalender & Waktu Shalat</span>
            
            {/* Location Selector */}
            <div className="flex items-center gap-1.5 no-print">
              <button
                onClick={handleGeolocation}
                className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                title="Deteksi lokasi otomatis"
              >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
              </button>
              
              <select
                value={coords.label === 'Lokasi Anda' ? '' : selectedCity.name}
                onChange={handleCityChange}
                className="bg-slate-900 border border-white/[0.08] rounded-lg text-[10px] px-2 py-1 text-slate-300 font-bold focus:outline-none focus:border-cyan-400"
              >
                {coords.label === 'Lokasi Anda' && (
                  <option value="" className="bg-slate-950 text-slate-400">📍 Lokasi Anda</option>
                )}
                {CITIES.map(c => (
                  <option key={c.name} value={c.name} className="bg-slate-950 text-slate-200">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2">
              <span className="material-symbols-outlined text-[24px] text-cyan-400 animate-spin">sync</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Memuat Kalender...</p>
            </div>
          ) : data ? (
            <div className="space-y-2.5">
              {/* Dates side-by-side inside card */}
              <div className="flex items-center gap-4 bg-slate-950/40 border border-white/[0.04] p-3 rounded-2xl">
                {/* Gregorian Date Block */}
                <div className="flex-1 space-y-0.5">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Masehi</span>
                  <span className="block text-sm font-black text-slate-200">
                    {getDayNameIndonesian(data.gregorian.weekday.en)}, {data.gregorian.day} {getMonthNameIndonesian(data.gregorian.month.en)} {data.gregorian.year}
                  </span>
                </div>

                <div className="w-px h-8 bg-white/[0.08]" />

                {/* Hijriah Date Block */}
                <div className="flex-1 space-y-0.5">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Hijriah</span>
                  <span className="block text-sm font-black text-purple-300">
                    {data.hijri.day} {data.hijri.month.en} {data.hijri.year} H
                  </span>
                </div>
              </div>

              {/* Islamic/National Holidays or Events */}
              {data.hijri.holidays && data.hijri.holidays.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-300 p-2.5 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">event_note</span>
                  <span>Hari Besar Islam: {data.hijri.holidays.join(', ')}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Gagal memuat detail kalender.</p>
          )}
        </div>

        {/* Location Label Info */}
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] text-cyan-400">location_on</span>
          Jadwal Shalat wilayah: <span className="text-slate-300">{coords.label}</span>
        </p>
      </div>

      {/* 2. Right Section: Prayer Times Grid */}
      <div className="w-full md:w-[320px] border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 py-4">
            <span className="material-symbols-outlined text-[24px] text-purple-400 animate-spin">sync</span>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Memuat Waktu Shalat...</p>
          </div>
        ) : data?.timings ? (
          <div className="grid grid-cols-5 md:grid-cols-1 gap-2">
            {Object.keys(PRAYER_NAMES).map((key) => {
              const isNext = nextPrayer === key;
              return (
                <div
                  key={key}
                  className={`flex flex-col md:flex-row justify-between items-center p-2 rounded-xl transition-all duration-300 ${
                    isNext
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.1)] scale-102 font-bold'
                      : 'bg-white/[0.02] border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                    <span className={`material-symbols-outlined text-[16px] ${isNext ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
                      {PRAYER_ICONS[key]}
                    </span>
                    <span className="text-[10px] md:text-xs tracking-tight">{PRAYER_NAMES[key]}</span>
                  </div>
                  <span className={`text-[11px] md:text-xs font-black mt-1 md:mt-0 ${isNext ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {data.timings[key]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic text-center py-4">Waktu shalat tidak tersedia.</p>
        )}
      </div>
    </div>
  );
}
