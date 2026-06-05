import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white relative">
      {/* Glowing background orbs for premium SaaS visual identity */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(168,85,247,0.08),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(6,182,212,0.08),transparent_35%)] pointer-events-none" />
      
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-transparent">
        <TopBar />
        <div className="flex-1 overflow-y-auto pattern-bg pb-24 md:pb-6">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
            <Outlet />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

