import React from 'react';
import { useQueue } from '../context/QueueContext';

export default function Header() {
  const { 
    currentTab, 
    setCurrentTab, 
    language, 
    toggleLanguage, 
    isAudioActive, 
    playAudioAnnouncement,
    activeTokenData
  } = useQueue();

  const handleAudioClick = () => {
    if (activeTokenData) {
      playAudioAnnouncement(activeTokenData.tokenNumber, activeTokenData.room);
    } else {
      playAudioAnnouncement('GM-42', 'Room 102 (General Medicine)');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-xl border-b border-[#d0e1ec] shadow-[0_1px_8px_rgba(6,58,99,0.05)] pt-safe transition-all">
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand & Hospital OPD Title */}
        <div 
          onClick={() => setCurrentTab('register')}
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
          title="SmartOPD Home"
        >
          <div className="w-11 h-11 rounded-lg bg-primary-container flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(6,58,99,0.2)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-secondary-action text-[26px]">local_hospital</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-primary font-extrabold tracking-tight truncate leading-tight">
                Smart<span className="text-secondary-action">OPD</span>
              </span>
              <span className="bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wider uppercase shrink-0 border border-secondary-action/20">
                Civic
              </span>
            </div>
            <span className="font-bilingual-sub text-bilingual-sub text-on-surface-variant text-[13px] truncate">
              {language === 'en' ? 'Civic General Hospital OPD Portal' : 'नागरिक सामान्य अस्पताल बाह्य रोगी विभाग'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on md and lg screens) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-surface-container/60 p-1.5 rounded-xl border border-[#d0e1ec]">
          <button
            onClick={() => setCurrentTab('register')}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
              currentTab === 'register'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold border border-[#d0e1ec]'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">app_registration</span>
            <span>{language === 'en' ? 'Registration' : 'पंजीकरण'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('status')}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
              currentTab === 'status'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold border border-[#d0e1ec]'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            <span>{language === 'en' ? 'Live Token Status' : 'टोकन स्थिति'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('staff')}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
              currentTab === 'staff'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold border border-[#d0e1ec]'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
            <span>{language === 'en' ? 'Staff Desk' : 'स्टाफ डेस्क'}</span>
          </button>
        </nav>

        {/* Action Controls: Voice Audio Announcement & Language Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio Assist Button */}
          <button
            onClick={handleAudioClick}
            aria-label="Emergency and Audio Announcement Assist"
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              isAudioActive
                ? 'bg-secondary-action text-primary-container ring-4 ring-secondary-action/30 animate-pulse'
                : 'bg-error-container/30 hover:bg-error-container/60 text-error'
            }`}
            title="Play OPD Voice & Sound Announcement"
          >
            <span className="material-symbols-outlined text-[24px]">volume_up</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            aria-label="Change Language between English and Hindi"
            className="h-11 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1.5 transition-colors shrink-0 border border-[#d0e1ec]"
            title="Toggle English / Hindi"
          >
            <span className="material-symbols-outlined text-[20px]">translate</span>
            <span className="font-label-md text-label-md font-extrabold">{language === 'en' ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Staff Quick Link Avatar */}
          <button 
            onClick={() => setCurrentTab('staff')}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
              currentTab === 'staff' 
                ? 'bg-secondary-action text-primary-container ring-2 ring-primary-container' 
                : 'bg-primary text-on-primary'
            }`}
            title="Switch to Staff Counter"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
}
