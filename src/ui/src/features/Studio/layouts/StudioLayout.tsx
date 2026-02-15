import { Outlet } from 'react-router-dom';
import { StudioSidebar } from '../components/StudioSidebar';
import { ActivityTimerProvider } from '../context/ActivityTimerContext';

export function StudioLayout() {
  return (
    <ActivityTimerProvider>
        <div className="flex h-screen bg-zinc-950 text-white relative">
        <StudioSidebar />
        <main className="flex-1 overflow-auto p-6">
            <Outlet />
        </main>
        </div>
    </ActivityTimerProvider>
  );
}
