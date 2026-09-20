import React from 'react';
import { useQueue } from '../context/QueueContext';

export default function BottomNav() {
  const { currentTab, setCurrentTab, language } = useQueue();

  const navItems = [
    {
      id: 'status',
      icon: 'confirmation_number',
      labelEn: 'My Token',
      labelHi: 'मेरा टोकन'
    },
    {
      id: 'register',
      icon: 'app_registration',
      labelEn: 'Register',
      labelHi: 'पंजीकरण'
    },
    {
      id: 'staff',
      icon: 'table_restaurant',
      labelEn: 'Desk Status',
      labelHi: 'डेस्क स्थिति'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-[#d0e1ec] shadow-[0_-4px_16px_rgba(6,58,99,0.08)]">
      <div className="flex items-center justify-around h-20 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-14 rounded-xl transition-all duration-150 touch-manipulation mx-1 ${
                isActive
                  ? 'text-primary bg-surface-container-high font-bold shadow-[0_2px_6px_rgba(6,58,99,0.1)] border border-[#d0e1ec]'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/50'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill text-primary-container' : ''}`}>
                {item.icon}
              </span>
              <span className="font-label-md text-[13px] tracking-tight leading-none">
                {language === 'en' ? item.labelEn : item.labelHi}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
