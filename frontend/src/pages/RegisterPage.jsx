import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';

export default function RegisterPage() {
  const { registerPatient, language, departments } = useQueue();

  const [mobileNumber, setMobileNumber] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [abhaNumber, setAbhaNumber] = useState('');
  const [selectedDept, setSelectedDept] = useState('General Medicine');
  const [shiftSlot, setShiftSlot] = useState('morning');
  const [priorityAssistance, setPriorityAssistance] = useState(false);
  const [isSenior, setIsSenior] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Age input handler - automatically flags senior fast track
  const handleAgeChange = (val) => {
    setAge(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 60) {
      setIsSenior(true);
      setPriorityAssistance(true);
    } else {
      setIsSenior(false);
    }
  };

  // OTP Demo Verification
  const handleOtpVerify = () => {
    if (mobileNumber.length !== 10) {
      alert(language === 'en' ? 'Please enter a valid 10-digit mobile number' : 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setIsOtpVerified(true);
    }, 700);
  };

  // ABHA QR Scanner Demo
  const handleScanAbha = () => {
    setAbhaNumber('91-4402-8819-2041');
    if (!fullName) setFullName('Ramesh Chandra Sharma');
    if (!age) {
      setAge('64');
      setIsSenior(true);
      setPriorityAssistance(true);
    }
    alert(language === 'en' ? 'ABHA QR verified: Citizen records linked!' : 'आयुष्मान भारत स्वास्थ्य खाता (ABHA) सफलतापूर्वक सत्यापित हुआ!');
  };

  // Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      alert(language === 'en' ? 'Please provide a valid 10-digit mobile number' : 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!fullName.trim()) {
      alert(language === 'en' ? 'Please enter patient full name' : 'कृपया मरीज का पूरा नाम दर्ज करें');
      return;
    }

    setFormSubmitting(true);
    try {
      await registerPatient({
        mobileNumber,
        fullName,
        patientAge: age,
        gender,
        abhaNumber,
        department: selectedDept,
        shiftSlot,
        priorityAssistance: priorityAssistance || isSenior
      });
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReset = () => {
    setMobileNumber('');
    setIsOtpVerified(false);
    setFullName('');
    setAge('');
    setGender('male');
    setAbhaNumber('');
    setSelectedDept('General Medicine');
    setShiftSlot('morning');
    setPriorityAssistance(false);
    setIsSenior(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
      {/* 1. Header Banner & Greeting */}
      <div className="civic-card mb-6 border-[#d0e1ec]">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-action animate-pulse"></span>
            {language === 'en' ? 'Civic Portal Active' : 'नागरिक सेवा सक्रिय'}
          </span>
          <span className="text-xs font-semibold text-on-surface-variant">
            {language === 'en' ? 'Free Government Hospital Facility' : 'नागरिक स्वास्थ्य सेवा • 100% निःशुल्क'}
          </span>
        </div>

        <h1 className="font-headline-lg-mobile sm:font-headline-lg text-2xl sm:text-3xl text-primary font-extrabold tracking-tight">
          {language === 'en' ? 'New OPD Token Registration' : 'नया ओपीडी टोकन पंजीकरण'}
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant mt-1">
          {language === 'en' 
            ? 'Quick & paperless queue registration for outpatient consultations at Civic General Hospital.'
            : 'नागरिक जनरल अस्पताल में बाह्य रोगी परामर्श हेतु त्वरित एवं पेपरलेस कतार पंजीकरण।'}
        </p>

        {/* Live Notice Bar */}
        <div className="mt-4 bg-surface-container-low p-3.5 rounded-xl flex items-center gap-3 border border-[#d0e1ec]">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px] text-secondary-action">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-primary leading-snug">
              {language === 'en' ? '100% Free Public Health Facility' : '100% निःशुल्क सरकारी स्वास्थ्य सुविधा'}
            </span>
            <span className="text-xs text-on-surface-variant truncate">
              {language === 'en' ? 'No counter queue fees required • Instant SMS & Live updates' : 'कोई पंजीकरण शुल्क नहीं • तुरंत एसएमएस और लाइव कतार सूचना'}
            </span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Mobile Phone Input */}
        <div className="civic-card">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="mobileInput" className="font-label-lg text-primary flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-secondary-action text-[22px]">smartphone</span>
              <span>{language === 'en' ? 'Mobile Phone Number' : 'मोबाइल फोन नंबर'}</span>
            </label>
            <span className="text-xs font-bold text-error bg-error-container/30 px-2 py-0.5 rounded">
              {language === 'en' ? 'Required *' : 'अनिवार्य *'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-3">
            {language === 'en' 
              ? 'Token status, real-time queue SMS, and audio alerts will be sent here.'
              : 'टोकन संख्या और रीयल-टाइम कतार एसएमएस इस नंबर पर भेजे जाएंगे।'}
          </p>

          <div className="flex items-center gap-2">
            <div className="h-[52px] px-3.5 bg-surface-container border-2 border-[#d0e1ec] rounded-lg flex items-center justify-center gap-1.5 shrink-0 text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-[18px] text-secondary">flag</span>
              <span>+91</span>
            </div>
            <input
              id="mobileInput"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              placeholder={language === 'en' ? 'Enter 10-digit mobile' : '10 अंकों का मोबाइल नंबर दर्ज करें'}
              className="civic-input text-base sm:text-lg font-bold tracking-wide"
            />
            <button
              type="button"
              onClick={handleOtpVerify}
              disabled={isOtpVerified || isVerifyingOtp}
              className={`h-[52px] px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm shrink-0 ${
                isOtpVerified
                  ? 'bg-emerald-600 text-white'
                  : 'bg-secondary hover:brightness-110 text-on-secondary active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isOtpVerified ? 'verified' : isVerifyingOtp ? 'sync' : 'mark_email_read'}
              </span>
              <span>
                {isOtpVerified 
                  ? (language === 'en' ? 'Verified' : 'सत्यापित')
                  : isVerifyingOtp 
                    ? (language === 'en' ? 'Checking...' : 'जाँच...') 
                    : (language === 'en' ? 'Verify' : 'सत्यापित करें')}
              </span>
            </button>
          </div>

          {isOtpVerified && (
            <div className="mt-3 bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>{language === 'en' ? 'Mobile auto-verified with Civic Health Network!' : 'मोबाइल नंबर नागरिक स्वास्थ्य नेटवर्क से सत्यापित हो गया है!'}</span>
            </div>
          )}
        </div>

        {/* Section 2: Patient Demographics */}
        <div className="civic-card space-y-4">
          <div className="flex items-center gap-2 border-b border-[#d0e1ec] pb-3">
            <span className="material-symbols-outlined text-secondary-action text-[22px]">badge</span>
            <h2 className="font-headline-sm text-primary font-bold">
              {language === 'en' ? 'Patient Personal Details' : 'मरीज का व्यक्तिगत विवरण'}
            </h2>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullNameInput" className="text-sm font-bold text-primary">
              {language === 'en' ? 'Patient Full Name' : 'मरीज का पूरा नाम'} <span className="text-error">*</span>
            </label>
            <input
              id="fullNameInput"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={language === 'en' ? 'e.g. Ramesh Chandra Sharma' : 'उदा. रमेश चंद्र शर्मा'}
              className="civic-input"
            />
          </div>

          {/* Age & Senior Priority Detection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ageInput" className="text-sm font-bold text-primary">
                {language === 'en' ? 'Age (Years)' : 'उम्र (वर्ष)'} <span className="text-error">*</span>
              </label>
              <input
                id="ageInput"
                type="number"
                min="0"
                max="120"
                required
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
                placeholder="e.g. 64"
                className="civic-input font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-primary">
                {language === 'en' ? 'Queue Category' : 'कतार श्रेणी'}
              </span>
              <div 
                className={`min-h-[52px] w-full px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all border ${
                  isSenior
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-surface-container text-on-surface-variant border-[#d0e1ec]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isSenior ? 'elderly' : 'person'}
                </span>
                <span>
                  {isSenior 
                    ? (language === 'en' ? 'Senior 60+ Fast-Track' : 'वरिष्ठ नागरिक प्राथमिकता (60+)')
                    : (language === 'en' ? 'Regular Queue' : 'सामान्य कतार')}
                </span>
              </div>
            </div>
          </div>

          {/* Gender Pill Selectors */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-primary">
              {language === 'en' ? 'Gender' : 'लिंग'} <span className="text-error">*</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'male', labelEn: 'Male', labelHi: 'पुरुष', icon: 'male' },
                { id: 'female', labelEn: 'Female', labelHi: 'महिला', icon: 'female' },
                { id: 'other', labelEn: 'Other', labelHi: 'अन्य', icon: 'transgender' }
              ].map((g) => (
                <label key={g.id} className="cursor-pointer select-none">
                  <input
                    type="radio"
                    name="gender"
                    value={g.id}
                    checked={gender === g.id}
                    onChange={() => setGender(g.id)}
                    className="sr-only"
                  />
                  <div
                    className={`min-h-[50px] rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold transition-all border ${
                      gender === g.id
                        ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border-[#d0e1ec]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{g.icon}</span>
                    <span>{language === 'en' ? g.labelEn : g.labelHi}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ABHA / Ayushman Bharat ID Scanner */}
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2.5 border border-[#d0e1ec]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-action text-[22px]">health_metrics</span>
                <span className="text-sm font-bold text-primary">
                  {language === 'en' ? 'ABHA / Ayushman Health ID' : 'आभा / आयुष्मान भारत स्वास्थ्य खाता'}
                </span>
              </div>
              <span className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded text-xs font-semibold">
                {language === 'en' ? 'Optional' : 'वैकल्पिक'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {language === 'en' 
                ? 'Link your 14-digit National Health ID to fetch digital case histories automatically.'
                : 'डिजिटल केस हिस्ट्री स्वतः प्राप्त करने के लिए अपना 14 अंकों का राष्ट्रीय स्वास्थ्य पहचान पत्र जोड़ें।'}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={abhaNumber}
                onChange={(e) => setAbhaNumber(e.target.value)}
                placeholder="e.g. 14-8921-4450-9912"
                className="civic-input text-sm"
              />
              <button
                type="button"
                onClick={handleScanAbha}
                className="h-[52px] px-4 bg-primary-container text-on-primary rounded-lg font-bold text-sm flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                <span>{language === 'en' ? 'Scan QR' : 'स्कैन'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Clinic / Department Selection */}
        <div className="civic-card">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-action text-[22px]">domain</span>
              <h2 className="font-headline-sm text-primary font-bold">
                {language === 'en' ? 'Choose Clinic / Department' : 'क्लिनिक / विभाग का चयन करें'}
              </h2>
            </div>
            <span className="text-xs font-bold text-error bg-error-container/30 px-2 py-0.5 rounded">*</span>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            {language === 'en' 
              ? 'Select clinical specialty. Live queue counts reflect real-time patient load.'
              : 'चिकित्सा विशेषता चुनें। वर्तमान प्रतीक्षा समय वास्तविक लोड पर आधारित है।'}
          </p>

          {/* Department List Radio Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {departments.map((dept) => {
              const isSelected = selectedDept === dept.name;
              return (
                <label key={dept.id} className="cursor-pointer select-none">
                  <input
                    type="radio"
                    name="department"
                    value={dept.name}
                    checked={isSelected}
                    onChange={() => setSelectedDept(dept.name)}
                    className="sr-only"
                  />
                  <div
                    className={`p-3.5 rounded-xl flex items-center justify-between transition-all border-2 ${
                      isSelected
                        ? 'bg-primary-container text-on-primary border-primary-container shadow-md'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-[#d0e1ec]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                        isSelected 
                          ? 'bg-surface-container-lowest text-primary-container' 
                          : 'bg-surface-container-lowest text-primary border border-[#d0e1ec]'
                      }`}>
                        <span className="material-symbols-outlined text-[26px]">{dept.icon}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm sm:text-base leading-snug truncate">
                          {dept.name}
                        </span>
                        <span className={`text-xs truncate ${isSelected ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                          {dept.hindiName} • {dept.rooms.join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-xs ${
                        isSelected 
                          ? 'bg-surface-container-lowest text-primary' 
                          : 'bg-surface-container text-primary-container border border-[#d0e1ec]'
                      }`}>
                        {dept.waitingCount} {language === 'en' ? 'Waiting' : 'कतार'}
                      </span>
                      <span className={`text-[11px] mt-1 font-semibold ${isSelected ? 'text-white/90' : 'text-on-surface-variant'}`}>
                        ~{dept.avgWaitMins} min
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 4: Consultation Shift */}
        <div className="civic-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary-action text-[22px]">schedule</span>
            <h2 className="font-headline-sm text-primary font-bold">
              {language === 'en' ? 'Consultation Shift' : 'परामर्श पाली (Shift)'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="cursor-pointer select-none">
              <input
                type="radio"
                name="shiftSlot"
                value="morning"
                checked={shiftSlot === 'morning'}
                onChange={() => setShiftSlot('morning')}
                className="sr-only"
              />
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all border-2 ${
                shiftSlot === 'morning'
                  ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                  : 'bg-surface-container-low text-on-surface border-[#d0e1ec]'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  shiftSlot === 'morning' ? 'bg-surface-container-lowest text-primary' : 'bg-surface-container-lowest text-primary border border-[#d0e1ec]'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">wb_sunny</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm sm:text-base">
                    {language === 'en' ? 'Morning OPD' : 'सुबह की ओपीडी'}
                  </span>
                  <span className={`text-xs ${shiftSlot === 'morning' ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                    09:00 AM - 01:00 PM
                  </span>
                </div>
              </div>
            </label>

            <label className="cursor-pointer select-none">
              <input
                type="radio"
                name="shiftSlot"
                value="evening"
                checked={shiftSlot === 'evening'}
                onChange={() => setShiftSlot('evening')}
                className="sr-only"
              />
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all border-2 ${
                shiftSlot === 'evening'
                  ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                  : 'bg-surface-container-low text-on-surface border-[#d0e1ec]'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  shiftSlot === 'evening' ? 'bg-surface-container-lowest text-primary' : 'bg-surface-container-lowest text-primary border border-[#d0e1ec]'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">wb_twilight</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm sm:text-base">
                    {language === 'en' ? 'Evening OPD' : 'शाम की ओपीडी'}
                  </span>
                  <span className={`text-xs ${shiftSlot === 'evening' ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                    04:00 PM - 07:00 PM
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 5: Priority Express Checkbox */}
        <div className="civic-card">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="priorityAssistance"
              checked={priorityAssistance}
              onChange={(e) => setPriorityAssistance(e.target.checked)}
              className="w-6 h-6 mt-0.5 rounded text-primary-container border-2 border-[#d0e1ec] focus:ring-secondary-action cursor-pointer shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary-action text-[20px]">accessible</span>
                <span>{language === 'en' ? 'Senior Citizen / Express Assistance Token' : 'वरिष्ठ नागरिक / दिव्यांग प्राथमिकता सहायता'}</span>
              </span>
              <span className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                {language === 'en'
                  ? 'Check if patient is an elderly citizen (60+), specially-abled, or pregnant. Grants immediate express queue routing.'
                  : 'वरिष्ठ नागरिक (60+), गर्भवती महिला अथवा दिव्यांगजनों हेतु शीघ्र कतार सुविधा।'}
              </span>
            </div>
          </label>
        </div>

        {/* Section 6: Hospital Guarantee Doctor Profile Card */}
        <div className="civic-card bg-surface-container-high/60 flex items-center gap-4 border-[#d0e1ec]">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-[#d0e1ec] bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-white">stethoscope</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-bold text-primary leading-tight">
              Dr. Sunita Mehta, MD
            </span>
            <span className="text-xs text-on-surface-variant">
              {language === 'en' ? 'Chief OPD Medical Officer • Civil Hospital' : 'मुख्य ओपीडी चिकित्सा अधिकारी • नागरिक अस्पताल'}
            </span>
            <span className="text-xs font-bold text-secondary mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">pace</span>
              <span>{language === 'en' ? 'Average consultation time: 8-10 mins' : 'औसत परामर्श समय: 8-10 मिनट'}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="submit"
            id="submitTokenBtn"
            disabled={formSubmitting}
            className="w-full min-h-[60px] py-2.5 px-4 bg-secondary hover:brightness-110 text-on-secondary rounded-xl font-bold text-[17px] shadow-md active:scale-[0.98] transition-transform flex flex-col items-center justify-center gap-0.5"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
              <span className="tracking-wide">
                {formSubmitting 
                  ? (language === 'en' ? 'Generating Token...' : 'टोकन तैयार हो रहा है...') 
                  : (language === 'en' ? 'Generate Digital OPD Token' : 'डिजिटल ओपीडी टोकन प्राप्त करें')}
              </span>
            </div>
            <span className="text-xs text-on-secondary/85 font-normal">
              {language === 'en' 
                ? 'Free Civic Service • SMS Token & Live Link Delivered Instantly' 
                : 'निःशुल्क नागरिक सेवा • एसएमएस टोकन एवं लाइव लिंक तुरंत प्राप्त होगा'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold text-sm transition-colors flex items-center justify-center gap-1.5 border border-[#d0e1ec]"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>{language === 'en' ? 'Clear Registration Form' : 'फ़ॉर्म साफ़ करें'}</span>
          </button>
        </div>
      </form>

      {/* Assisted Physical Desk Support Banner */}
      <div className="civic-card mt-8">
        <div className="flex items-center gap-2 text-primary mb-1">
          <span className="material-symbols-outlined text-secondary-action text-[22px]">contact_support</span>
          <h3 className="font-headline-sm text-base sm:text-lg font-bold">
            {language === 'en' ? 'Need Help Registering?' : 'पंजीकरण में सहायता चाहिए?'}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant mb-3">
          {language === 'en'
            ? 'Civic volunteers and nursing attendants are stationed on-site to assist elderly and illiterate patients.'
            : 'वरिष्ठ एवं निरक्षर नागरिकों की सहायता हेतु ऑन-साइट स्वयंसेवक व सहायक उपलब्ध हैं।'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 bg-surface-container rounded-lg flex items-center gap-3 border border-[#d0e1ec]">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">desk</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold text-primary">
                {language === 'en' ? 'Kiosk Desk 01' : 'कियोस्क काउंटर 01'}
              </span>
              <span className="text-xs text-on-surface-variant truncate">
                {language === 'en' ? 'Near Main Gate Entrance' : 'मुख्य द्वार के समीप'}
              </span>
            </div>
          </div>

          <a
            href="tel:1800112233"
            className="p-3 bg-surface-container rounded-lg flex items-center gap-3 active:scale-95 transition-transform border border-[#d0e1ec] hover:bg-surface-container-high"
          >
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">call</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold text-primary">
                {language === 'en' ? 'Toll-Free Civic Helpline' : 'टोल-फ्री नागरिक हेल्पलाइन'}
              </span>
              <span className="text-xs text-secondary font-bold">
                1800-11-2233 (24x7)
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
