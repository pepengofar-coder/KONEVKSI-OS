import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
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
