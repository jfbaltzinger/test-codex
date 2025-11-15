import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
