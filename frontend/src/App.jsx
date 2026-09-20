import React from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TokenModal from './components/TokenModal';
import RegisterPage from './pages/RegisterPage';
import PatientStatusPage from './pages/PatientStatusPage';
import StaffDashboard from './pages/StaffDashboard';

function MainApp() {
  const { currentTab, isAudioActive, announcementText } = useQueue();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Header */}
      <Header />

      {/* Floating Audio Announcement Notification Banner */}
      {isAudioActive && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-secondary-action text-primary-container font-extrabold px-4 py-2.5 shadow-lg flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-[24px] animate-bounce">campaign</span>
          <span className="text-sm sm:text-base tracking-wide">{announcementText}</span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-20 md:pb-8">
        {currentTab === 'register' && <RegisterPage />}
        {currentTab === 'status' && <PatientStatusPage />}
        {currentTab === 'staff' && <StaffDashboard />}
      </main>

      {/* Persistent Bottom Navigation for Mobile & Tablets */}
      <BottomNav />

      {/* Token Generation Success Modal */}
      <TokenModal />

      {/* Civic Health System Footer */}
      <footer className="hidden md:block py-6 border-t border-[#d0e1ec] bg-surface-container-low/40 text-center text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Civic Health Queue System • National Outpatient Framework</span>
          </div>
          <div>
            Connected to API endpoint: <code className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-mono text-primary font-bold">{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</code>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueueProvider>
      <MainApp />
    </QueueProvider>
  );
}
