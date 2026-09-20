import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTokenNumber, setActiveTokenNumber] = useState('GM-42');
  const [activeTokenData, setActiveTokenData] = useState(null);
  const [currentTab, setCurrentTab] = useState('register'); // 'register' | 'status' | 'staff'
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [latestCreatedToken, setLatestCreatedToken] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refresh all queue and department data
  const refreshData = useCallback(async () => {
    try {
      const [ptsRes, deptsRes] = await Promise.all([
        api.getAllPatients(),
        api.getDepartments()
      ]);
      if (ptsRes.success) setPatients(ptsRes.patients);
      if (deptsRes.success) setDepartments(deptsRes.departments);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  }, []);

  // Fetch active token data whenever activeTokenNumber changes
  const fetchActiveToken = useCallback(async (tokenNum) => {
    if (!tokenNum) return;
    const res = await api.getToken(tokenNum);
    if (res.success) {
      setActiveTokenData(res.token);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (activeTokenNumber) {
      fetchActiveToken(activeTokenNumber);
    }
  }, [activeTokenNumber, fetchActiveToken, patients]);

  // Web Speech & Chime announcement
  const playAudioAnnouncement = useCallback((tokenNum, roomName) => {
    const text = `Attention please. Token ${tokenNum}, please proceed to ${roomName}. ध्यान दें, टोकन ${tokenNum}, कृपया ${roomName} में पधारें।`;
    setAnnouncementText(`Calling Token ${tokenNum} → ${roomName}`);
    setIsAudioActive(true);

    try {
      // Audio Chime using Web Audio API
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start(ctx.currentTime + 0.15);
        osc1.stop(ctx.currentTime + 0.6);
        osc2.stop(ctx.currentTime + 0.6);
      }

      // Voice synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.onend = () => {
          setTimeout(() => setIsAudioActive(false), 2000);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsAudioActive(false), 4000);
      }
    } catch (e) {
      console.warn('Audio announcement error:', e);
      setTimeout(() => setIsAudioActive(false), 3000);
    }
  }, []);

  // Register Patient Action
  const registerPatient = async (formData) => {
    const res = await api.registerPatient(formData);
    if (res.success && res.token) {
      await refreshData();
      setLatestCreatedToken(res.token);
      setActiveTokenNumber(res.token.tokenNumber);
      setIsModalOpen(true);
      return res.token;
    }
    return null;
  };

  // Staff Call Next Patient
  const callNext = async (deptCode, roomNumber) => {
    const res = await api.callNextPatient(deptCode, roomNumber);
    if (res.success && res.calledPatient) {
      await refreshData();
      playAudioAnnouncement(res.calledPatient.tokenNumber, roomNumber);
      return res.calledPatient;
    }
    return null;
  };

  // Update Status Action
  const updateStatus = async (tokenNumber, status) => {
    const res = await api.updateStatus(tokenNumber, status);
    if (res.success) {
      await refreshData();
      return true;
    }
    return false;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <QueueContext.Provider
      value={{
        patients,
        departments,
        activeTokenNumber,
        setActiveTokenNumber,
        activeTokenData,
        currentTab,
        setCurrentTab,
        language,
        toggleLanguage,
        isAudioActive,
        announcementText,
        latestCreatedToken,
        isModalOpen,
        setIsModalOpen,
        registerPatient,
        callNext,
        updateStatus,
        playAudioAnnouncement,
        refreshData
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
