import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useQueue } from '../context/QueueContext';

export default function TokenModal() {
  const { isModalOpen, setIsModalOpen, latestCreatedToken, setCurrentTab, language } = useQueue();

  useEffect(() => {
    if (isModalOpen) {
      // Fire festive civic confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#063a63', '#12b8c6', '#69effe', '#ffffff']
        });
      } catch (e) {
        // ignore if canvas-confetti issue
      }
    }
  }, [isModalOpen]);

  if (!isModalOpen || !latestCreatedToken) return null;

  const handleTrackLive = () => {
    setIsModalOpen(false);
    setCurrentTab('status');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-primary/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setIsModalOpen(false)}
    >
      <div 
        className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl text-center border-2 border-primary-container relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-secondary-container/50 text-secondary flex items-center justify-center shadow-inner border border-secondary-action/30">
          <span className="material-symbols-outlined text-[38px] text-secondary fill">check_circle</span>
        </div>

        {/* Header Titles */}
        <div className="flex flex-col gap-1">
          <span className="bg-surface-container px-3 py-1 rounded-full font-label-md text-xs text-primary font-extrabold self-center border border-[#d0e1ec]">
            {language === 'en' ? 'Registration Confirmed' : 'पंजीकरण सफल'}
          </span>
          <h3 className="font-headline-lg-mobile text-2xl text-primary font-bold mt-1 tracking-tight">
            {language === 'en' ? 'OPD Token Generated!' : 'ओपीडी टोकन तैयार है!'}
          </h3>
          <p className="text-sm text-on-surface-variant font-medium">
            {language === 'en' ? 'Your paperless civic OPD token is now live.' : 'आपका डिजिटल टोकन सफलतापूर्वक जारी कर दिया गया है।'}
          </p>
        </div>

        {/* Token Ticket Card */}
        <div className="w-full bg-surface-container-low/70 border-2 border-dashed border-[#a6c8e2] p-5 rounded-xl flex flex-col items-center gap-1 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            {language === 'en' ? 'Your Token Number' : 'आपका टोकन नंबर'}
          </span>
          <span className="font-display-token-mobile text-4xl text-primary font-black tracking-tight tabular-token my-1">
            {latestCreatedToken.tokenNumber}
          </span>
          <div className="text-xs font-bold text-primary-container bg-surface-container-highest/60 px-3 py-0.5 rounded-md mb-2">
            {latestCreatedToken.department} • {latestCreatedToken.room}
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-action opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-action"></span>
            </span>
            <span className="text-sm font-bold text-secondary">
              {language === 'en' 
                ? `Est. Wait: ~${latestCreatedToken.estimatedMins} Mins (${latestCreatedToken.aheadCount} ahead)`
                : `अनुमानित समय: ~${latestCreatedToken.estimatedMins} मिनट`}
            </span>
          </div>
        </div>

        {/* Patient Detail Summary */}
        <div className="w-full bg-surface-container-lowest border border-[#d0e1ec] rounded-lg p-3 text-left text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-medium">Patient:</span>
            <span className="font-bold text-primary">{latestCreatedToken.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-medium">Doctor:</span>
            <span className="font-bold text-primary">{latestCreatedToken.doctor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-medium">Mobile:</span>
            <span className="font-bold text-primary">+91 {latestCreatedToken.mobile}</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleTrackLive}
          className="w-full min-h-[52px] bg-primary-container hover:bg-[#042a4a] text-on-primary rounded-xl font-bold text-[16px] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[22px]">radar</span>
          <span>{language === 'en' ? 'View Live Queue Tracker' : 'लाइव कतार ट्रैकर देखें'}</span>
        </button>
      </div>
    </div>
  );
}
