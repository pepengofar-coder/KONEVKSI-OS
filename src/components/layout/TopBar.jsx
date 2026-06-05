import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-surface/70 backdrop-blur-xl sticky top-0 z-40 flex justify-between items-center w-full px-4 md:px-6 h-14 md:h-16">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="material-symbols-outlined text-primary text-[22px]">menu</span>
        </button>
        <span className="text-lg md:text-xl font-bold text-primary tracking-tighter">
          {title || 'Konveksi OS'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
          onClick={() => navigate('/dashboard')}
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
          A
        </div>
      </div>
    </header>
  );
}
