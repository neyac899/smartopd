import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';

export default function StaffDashboard() {
  const { 
    patients, 
    departments, 
    callNext, 
    updateStatus, 
    language, 
    playAudioAnnouncement,
    registerPatient
  } = useQueue();

  const [selectedDeptCode, setSelectedDeptCode] = useState('GM');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'waiting' | 'in-consultation' | 'completed'
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInMobile, setWalkInMobile] = useState('');
  const [walkInAge, setWalkInAge] = useState('');
  const [walkInGender, setWalkInGender] = useState('male');
  const [walkInPriority, setWalkInPriority] = useState(false);

  const currentDept = departments.find(d => d.code === selectedDeptCode) || departments[0];

  // Patients for current department
  const deptPatients = patients.filter(p => p.deptCode === selectedDeptCode);
  const currentInRoom = deptPatients.find(p => p.status === 'in-consultation');
  const waitingPatients = deptPatients.filter(p => p.status === 'waiting');
  const completedPatients = deptPatients.filter(p => p.status === 'completed');

  // Filtered patients for queue list
  const filteredList = deptPatients.filter(p => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'priority') return p.isPriority;
    return p.status === filterStatus;
  });

  // Call Next handler
  const handleCallNext = async () => {
    if (!currentDept) return;
    const called = await callNext(currentDept.code, currentDept.rooms[0]);
    if (!called) {
      alert(language === 'en' ? 'No more patients waiting in this queue!' : 'इस कतार में कोई प्रतीक्षारत मरीज नहीं है!');
    }
  };

  // Quick Walk-In Submit
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInName || !walkInMobile) return;
    await registerPatient({
      fullName: walkInName,
      mobileNumber: walkInMobile,
      patientAge: walkInAge || '35',
      gender: walkInGender,
      department: currentDept.name,
      shiftSlot: 'morning',
      priorityAssistance: walkInPriority
    });
    setWalkInName('');
    setWalkInMobile('');
    setWalkInAge('');
    setWalkInPriority(false);
    setShowWalkInModal(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
      {/* 1. Header & Desk Control Bar */}
      <div className="civic-card mb-6 border-[#d0e1ec]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px] text-secondary-action">table_restaurant</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg-mobile sm:font-headline-lg text-2xl text-primary font-bold">
                  {language === 'en' ? 'OPD Staff & Doctor Console' : 'ओपीडी स्टाफ व चिकित्सक डैशबोर्ड'}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
                {currentDept?.name} • {currentDept?.rooms[0]} • {currentDept?.doctor}
              </p>
            </div>
          </div>

          {/* Department Quick Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-bold text-primary">Department:</label>
            <select
              value={selectedDeptCode}
              onChange={(e) => setSelectedDeptCode(e.target.value)}
              className="h-10 px-3 bg-surface-container-lowest border-2 border-[#d0e1ec] rounded-lg text-xs sm:text-sm font-bold text-primary focus:outline-none focus:border-primary-container"
            >
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowWalkInModal(true)}
              className="h-10 px-3.5 bg-primary-container hover:bg-[#042a4a] text-on-primary rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-action">person_add</span>
              <span>{language === 'en' ? 'Add Walk-in' : 'वॉक-इन मरीज'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real-time Department Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="civic-card flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary-container border border-blue-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Total Registered</span>
            <div className="text-xl sm:text-2xl font-black text-primary tabular-token">
              {deptPatients.length}
            </div>
          </div>
        </div>

        <div className="civic-card flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Waiting Outside</span>
            <div className="text-xl sm:text-2xl font-black text-amber-800 tabular-token">
              {waitingPatients.length}
            </div>
          </div>
        </div>

        <div className="civic-card flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Completed Consults</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-800 tabular-token">
              {completedPatients.length}
            </div>
          </div>
        </div>

        <div className="civic-card flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">avg_time</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Avg Consultation</span>
            <div className="text-xl sm:text-2xl font-black text-purple-900 tabular-token">
              8-10 Min
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hero Active Consultation Controller Card */}
      <div className="civic-card-active mb-6 bg-gradient-to-r from-surface-container-low to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Currently Being Served */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-secondary-action flex flex-col items-center justify-center shrink-0 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">ROOM</span>
              <span className="text-base font-extrabold text-white leading-none">102</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {language === 'en' ? 'Now In Consultation:' : 'वर्तमान में उपस्थित मरीज:'}
                </span>
                {currentInRoom?.isPriority && (
                  <span className="chip-priority">Priority 60+</span>
                )}
              </div>

              {currentInRoom ? (
                <div className="mt-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display-token-mobile text-3xl sm:text-4xl font-black text-primary tabular-token">
                      {currentInRoom.tokenNumber}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-primary truncate">
                      {currentInRoom.fullName} ({currentInRoom.age}y/{currentInRoom.gender})
                    </span>
                  </div>
                  <span className="text-xs text-secondary font-semibold">
                    Called at {currentInRoom.calledTime || currentInRoom.registrationTime} • Mobile: +91 {currentInRoom.mobile}
                  </span>
                </div>
              ) : (
                <div className="mt-1">
                  <span className="text-xl font-bold text-on-surface-variant">
                    {language === 'en' ? 'Counter is Idle — Ready for Next Patient' : 'कमरा रिक्त है — अगले मरीज को पुकारें'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Call Next Patient CTA */}
            <button
              onClick={handleCallNext}
              className="btn-secondary min-h-[50px] px-5 text-sm sm:text-base font-bold shadow-md hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[22px]">campaign</span>
              <span>{language === 'en' ? 'Call Next Patient' : 'अगले मरीज को बुलाएं'}</span>
            </button>

            {/* Repeat Call / Audio Chime */}
            {currentInRoom && (
              <button
                onClick={() => playAudioAnnouncement(currentInRoom.tokenNumber, currentDept.rooms[0])}
                className="btn-outline min-h-[50px] px-4 text-sm border border-[#d0e1ec]"
                title="Ring audio buzzer & announcement again"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">volume_up</span>
                <span>{language === 'en' ? 'Ring Again' : 'पुनः पुकारें'}</span>
              </button>
            )}

            {/* Complete Consultation */}
            {currentInRoom && (
              <button
                onClick={() => updateStatus(currentInRoom.tokenNumber, 'completed')}
                className="min-h-[50px] px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">done_all</span>
                <span>{language === 'en' ? 'Mark Done' : 'परामर्श पूर्ण'}</span>
              </button>
            )}

            {/* Skip / No-show */}
            {currentInRoom && (
              <button
                onClick={() => updateStatus(currentInRoom.tokenNumber, 'no-show')}
                className="min-h-[50px] px-3.5 bg-surface-container-lowest border-2 border-error text-error rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-error/5 transition-colors"
                title="Patient did not arrive"
              >
                <span className="material-symbols-outlined text-[18px]">person_off</span>
                <span>{language === 'en' ? 'No-Show' : 'अनुपस्थित'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Live OPD Queue Table */}
      <div className="civic-card">
        {/* Filter Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#d0e1ec] gap-3">
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-primary">
              {language === 'en' ? `${currentDept?.name} Patient Roster` : `${currentDept?.name} मरीज सूची`}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {waitingPatients.length} patients currently waiting in lobby
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-[#d0e1ec] overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'waiting', label: `Waiting (${waitingPatients.length})` },
              { id: 'in-consultation', label: 'In Room' },
              { id: 'completed', label: 'Done' },
              { id: 'priority', label: 'Priority' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === f.id
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d0e1ec] text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-3">Token</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Demographics</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Reg. Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0e1ec] text-sm">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-on-surface-variant text-xs font-medium">
                    No patients matching this filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((pt) => {
                  const isInRoom = pt.status === 'in-consultation';
                  const isDone = pt.status === 'completed';
                  const isNoShow = pt.status === 'no-show';

                  return (
                    <tr 
                      key={pt.tokenNumber} 
                      className={`hover:bg-surface-container-low/60 transition-colors ${
                        isInRoom ? 'bg-secondary-container/20 font-semibold' : ''
                      }`}
                    >
                      {/* Token # */}
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-primary tabular-token text-base">
                          {pt.tokenNumber}
                        </span>
                      </td>

                      {/* Patient Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-primary leading-tight">{pt.fullName}</div>
                        <div className="text-xs text-on-surface-variant">+91 {pt.mobile}</div>
                      </td>

                      {/* Demographics */}
                      <td className="py-3 px-3 text-xs text-on-surface-variant capitalize">
                        {pt.age}y • {pt.gender}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        {pt.isPriority ? (
                          <span className="chip-priority">Senior / Fast-Track</span>
                        ) : (
                          <span className="text-xs text-on-surface-variant font-medium">General</span>
                        )}
                      </td>

                      {/* Reg Time */}
                      <td className="py-3 px-3 text-xs text-on-surface-variant tabular-token">
                        {pt.registrationTime}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {isInRoom && (
                          <span className="chip-in-consultation">
                            <span className="w-2 h-2 rounded-full bg-secondary-action animate-ping"></span>
                            In Room
                          </span>
                        )}
                        {isDone && (
                          <span className="chip-completed">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            Done
                          </span>
                        )}
                        {isNoShow && (
                          <span className="chip-action-required">No-Show</span>
                        )}
                        {pt.status === 'waiting' && (
                          <span className="chip-waiting">
                            Waiting (~{pt.estimatedMins}m)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pt.status === 'waiting' && (
                            <button
                              onClick={() => {
                                updateStatus(pt.tokenNumber, 'in-consultation');
                                playAudioAnnouncement(pt.tokenNumber, currentDept.rooms[0]);
                              }}
                              className="px-2.5 py-1 rounded bg-primary-container hover:bg-[#042a4a] text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                              title="Directly call this patient into room"
                            >
                              <span className="material-symbols-outlined text-[14px]">call</span>
                              <span>Call</span>
                            </button>
                          )}
                          {isInRoom && (
                            <button
                              onClick={() => updateStatus(pt.tokenNumber, 'completed')}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              <span>Done</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk-in Registration Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border-2 border-primary-container animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#d0e1ec]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-action text-[24px]">person_add</span>
                <h3 className="text-lg font-bold text-primary">Quick Walk-in Registration</h3>
              </div>
              <button 
                onClick={() => setShowWalkInModal(false)}
                className="text-on-surface-variant hover:text-primary p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-primary">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Meera Devi"
                  className="civic-input text-sm h-[48px] min-h-[48px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={walkInMobile}
                  onChange={(e) => setWalkInMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  className="civic-input text-sm h-[48px] min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-primary">Age (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    required
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(e.target.value)}
                    placeholder="e.g. 52"
                    className="civic-input text-sm h-[48px] min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-primary">Gender</label>
                  <select
                    value={walkInGender}
                    onChange={(e) => setWalkInGender(e.target.value)}
                    className="civic-input text-sm h-[48px] min-h-[48px]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={walkInPriority}
                  onChange={(e) => setWalkInPriority(e.target.checked)}
                  className="w-5 h-5 rounded text-primary-container"
                />
                <span className="text-xs font-bold text-primary">
                  Senior Citizen (60+) / Fast-Track Express
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 h-11 rounded-lg bg-surface-container text-on-surface-variant font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-lg bg-secondary text-on-secondary font-bold text-sm shadow-sm"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
