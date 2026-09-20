import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';

export default function PatientStatusPage() {
  const { 
    activeTokenData, 
    setActiveTokenNumber, 
    patients, 
    language, 
    playAudioAnnouncement 
  } = useQueue();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Fallback patient if none is active
  const token = activeTokenData || (patients && patients[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().toUpperCase();
    const found = patients.find(p => 
      p.tokenNumber.toUpperCase() === clean || p.mobile.includes(searchQuery.trim())
    );
    if (found) {
      setActiveTokenNumber(found.tokenNumber);
    } else {
      alert(language === 'en' ? `No token found for "${searchQuery}"` : `"${searchQuery}" के लिए कोई टोकन नहीं मिला`);
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token.tokenNumber);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  const isCalledOrInRoom = token?.status === 'in-consultation';
  const isCompleted = token?.status === 'completed';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
      {/* 1. Header & Live Status Bar */}
      <div className="civic-card mb-6 border-[#d0e1ec]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-secondary-action animate-ping"></span>
                {language === 'en' ? 'Real-Time Sync Active' : 'लाइव कतार ट्रैकिंग सक्रिय'}
              </span>
              <span className="text-xs font-semibold text-on-surface-variant">
                {language === 'en' ? 'Civil Hospital OPD' : 'सिविल अस्पताल बाह्य रोगी विभाग'}
              </span>
            </div>
            <h1 className="font-headline-lg-mobile sm:font-headline-lg text-2xl sm:text-3xl text-primary font-extrabold tracking-tight">
              {language === 'en' ? 'My OPD Queue Status' : 'मेरी ओपीडी कतार स्थिति'}
            </h1>
          </div>

          {/* Quick Token Search / Switch */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search Token (e.g. GM-42)' : 'टोकन खोजें (उदा. GM-42)'}
              className="civic-input h-[46px] min-h-[46px] text-xs sm:text-sm py-1 max-w-[200px]"
            />
            <button
              type="submit"
              className="h-[46px] px-3.5 bg-primary-container hover:bg-[#042a4a] text-on-primary rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
          </form>
        </div>
      </div>

      {token ? (
        <div className="space-y-6">
          {/* 2. THE HERO: Queue Status Display Card (Live Token Card from Stitch MCP) */}
          <div className="civic-card-active relative overflow-hidden bg-gradient-to-b from-white to-surface-container-low/40">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary-action"></div>

            {/* Top Section: Room & Doctor Name with bilingual subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#d0e1ec] gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-secondary-action flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">medical_services</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary">
                      {token.room} • {token.doctor}
                    </h2>
                    {token.isPriority && (
                      <span className="chip-priority">
                        {language === 'en' ? 'Priority' : 'प्राथमिकता'}
                      </span>
                    )}
                  </div>
                  <p className="font-bilingual-sub text-xs sm:text-sm text-on-surface-variant font-medium">
                    {token.department} • {language === 'en' ? 'Consultation Zone B' : 'परामर्श कक्ष ज़ोन ब'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center">
                {isCompleted ? (
                  <span className="chip-completed">
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>{language === 'en' ? 'Consultation Completed' : 'परामर्श संपन्न'}</span>
                  </span>
                ) : isCalledOrInRoom ? (
                  <span className="chip-in-consultation animate-pulse">
                    <span className="material-symbols-outlined text-[16px]">campaign</span>
                    <span>{language === 'en' ? 'Now In Room / Called' : 'कमरे में उपस्थित हों'}</span>
                  </span>
                ) : (
                  <span className="chip-waiting">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                    <span>{language === 'en' ? 'Waiting in Queue' : 'कतार में प्रतीक्षारत'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Center Section: Large Token Number + Waiting Indicator */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-on-surface-variant uppercase">
                {language === 'en' ? 'Your Active Token' : 'आपका सक्रिय टोकन'}
              </span>

              {/* Display-Token Numeral */}
              <div className="flex items-baseline justify-center gap-2 my-1">
                <span className="font-display-token-mobile sm:font-display-token text-5xl sm:text-7xl font-black text-primary-container tabular-token tracking-tight">
                  {token.tokenNumber}
                </span>
                <button
                  onClick={handleCopyToken}
                  className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                  title="Copy Token Number"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {copiedNotification ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Dynamic Ahead Indicator */}
              <div className="mt-1">
                {isCompleted ? (
                  <p className="text-sm font-bold text-emerald-800 bg-emerald-100 px-4 py-1 rounded-full inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>{language === 'en' ? 'Consultation successfully recorded' : 'परामर्श सफलतापूर्वक दर्ज किया गया'}</span>
                  </p>
                ) : isCalledOrInRoom ? (
                  <p className="text-sm sm:text-base font-bold text-secondary bg-secondary-container/40 px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-secondary-action/30">
                    <span className="material-symbols-outlined text-[20px] text-secondary animate-bounce">arrow_forward</span>
                    <span>{language === 'en' ? `Please proceed directly into ${token.room}!` : `कृपया सीधे ${token.room} में प्रवेश करें!`}</span>
                  </p>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-primary-container bg-surface-container px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-[#d0e1ec]">
                    <span className="material-symbols-outlined text-[20px] text-secondary">group</span>
                    <span>
                      {token.aheadCount === 0 
                        ? (language === 'en' ? 'You are NEXT in line! Please wait near the door.' : 'आप अगले मरीज हैं! कृपया दरवाजे के पास रहें।')
                        : (language === 'en' ? `${token.aheadCount} patients ahead of you` : `आपसे आगे ${token.aheadCount} मरीज हैं`)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Footnote Section: Real-time estimated call time with distinct blinking teal dot */}
            <div className="pt-4 border-t border-[#d0e1ec] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/50 -mx-4 -mb-4 p-4 rounded-b-xl">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-action opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-action"></span>
                </span>
                <span className="font-label-lg text-sm sm:text-base font-bold text-primary">
                  {language === 'en' ? 'Estimated Call Time:' : 'अनुमानित परामर्श समय:'}
                </span>
                <span className="font-bold text-secondary text-sm sm:text-base">
                  {isCompleted ? 'Finished' : isCalledOrInRoom ? 'Now' : `~${token.estimatedMins} Mins`}
                </span>
              </div>

              {/* Audio Chime / Announce Action */}
              <button
                onClick={() => playAudioAnnouncement(token.tokenNumber, token.room)}
                className="h-10 px-3.5 bg-primary-container hover:bg-[#042a4a] text-on-primary rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-action">volume_up</span>
                <span>{language === 'en' ? 'Replay Voice Alert' : 'आवाज में घोषणा सुनें'}</span>
              </button>
            </div>
          </div>

          {/* 3. Live OPD Journey Stepper */}
          <div className="civic-card">
            <h3 className="font-headline-sm text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-action text-[22px]">linear_scale</span>
              <span>{language === 'en' ? 'Consultation Journey' : 'परामर्श यात्रा प्रगति'}</span>
            </h3>

            <div className="relative">
              {/* Stepper Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  {
                    step: 1,
                    titleEn: 'Registered',
                    titleHi: 'पंजीकृत',
                    descEn: `At ${token.registrationTime}`,
                    descHi: `समय ${token.registrationTime}`,
                    icon: 'app_registration',
                    done: true
                  },
                  {
                    step: 2,
                    titleEn: 'Waiting Lobby',
                    titleHi: 'प्रतीक्षा कक्ष',
                    descEn: 'Zone B Seating',
                    descHi: 'जोन ब बैठक',
                    icon: 'chair',
                    done: true
                  },
                  {
                    step: 3,
                    titleEn: 'Called to Room',
                    titleHi: 'कक्ष में बुलावा',
                    descEn: token.room,
                    descHi: token.room,
                    icon: 'meeting_room',
                    done: isCalledOrInRoom || isCompleted
                  },
                  {
                    step: 4,
                    titleEn: 'Consultation Done',
                    titleHi: 'परामर्श पूर्ण',
                    descEn: 'Prescription Ready',
                    descHi: 'दवा पर्ची तैयार',
                    icon: 'prescriptions',
                    done: isCompleted
                  }
                ].map((s) => (
                  <div key={s.step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base transition-all shrink-0 ${
                      s.done
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-surface-container text-outline border border-[#d0e1ec]'
                    }`}>
                      <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-bold ${s.done ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {language === 'en' ? s.titleEn : s.titleHi}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {language === 'en' ? s.descEn : s.descHi}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Digital QR & Hospital Slip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Info Card */}
            <div className="civic-card space-y-2.5">
              <div className="flex items-center gap-2 border-b border-[#d0e1ec] pb-2">
                <span className="material-symbols-outlined text-secondary-action text-[20px]">badge</span>
                <h4 className="text-sm font-bold text-primary">
                  {language === 'en' ? 'Patient Demographics' : 'मरीज का विवरण'}
                </h4>
              </div>
              <div className="text-xs space-y-1.5 text-on-surface">
                <div className="flex justify-between py-1 border-b border-surface-container">
                  <span className="text-on-surface-variant">{language === 'en' ? 'Patient Name:' : 'मरीज का नाम:'}</span>
                  <span className="font-bold text-primary">{token.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container">
                  <span className="text-on-surface-variant">{language === 'en' ? 'Age / Gender:' : 'उम्र / लिंग:'}</span>
                  <span className="font-bold capitalize">{token.age} Yrs • {token.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container">
                  <span className="text-on-surface-variant">{language === 'en' ? 'Shift Slot:' : 'पाली:'}</span>
                  <span className="font-bold capitalize">{token.shift} OPD</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">{language === 'en' ? 'Registered Phone:' : 'फोन नंबर:'}</span>
                  <span className="font-bold">+91 {token.mobile}</span>
                </div>
              </div>
            </div>

            {/* QR Code & Kiosk Scanning Card */}
            <div className="civic-card flex items-center gap-4">
              {/* Simulated QR Box */}
              <div className="w-24 h-24 bg-white border-2 border-primary-container p-1 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                <div className="grid grid-cols-5 gap-0.5 w-full h-full p-1 bg-[#063a63]/5 rounded">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 5 === 0 || i === 12 || i === 18) 
                          ? 'bg-primary-container' 
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">
                  {language === 'en' ? 'Fast Check-in QR' : 'त्वरित कियोस्क क्यूआर'}
                </span>
                <span className="text-sm font-bold text-primary leading-tight mt-0.5">
                  Scan at Clinic Door Kiosk
                </span>
                <p className="text-xs text-on-surface-variant mt-1">
                  {language === 'en'
                    ? 'Present this QR barcode to nursing desk when your token is announced.'
                    : 'टोकन पुकारने पर यह क्यूआर कोड डॉक्टर कक्ष के बाहर स्कैन कराएं।'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="civic-card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-container text-outline mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[32px]">confirmation_number</span>
          </div>
          <h3 className="font-headline-sm text-lg font-bold text-primary">
            {language === 'en' ? 'No Active Token Selected' : 'कोई सक्रिय टोकन नहीं मिला'}
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
            {language === 'en' 
              ? 'Please register a new patient or enter your token number in the search bar above.' 
              : 'कृपया नया टोकन पंजीकृत करें अथवा ऊपर सर्च बार में टोकन संख्या दर्ज करें।'}
          </p>
        </div>
      )}
    </div>
  );
}
