// SmartOPD API Client & Local Fallback Store
// Reads VITE_API_URL or defaults to http://localhost:5000/api

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial mock data mirroring the Stitch OPD project
const INITIAL_DEPARTMENTS = [
  {
    id: 'gen-med',
    code: 'GM',
    name: 'General Medicine',
    hindiName: 'सामान्य चिकित्सा',
    rooms: ['Room 102', 'Room 104'],
    doctor: 'Dr. Sunita Mehta, MD',
    waitingCount: 18,
    avgWaitMins: 40,
    icon: 'stethoscope',
    activeToken: 'GM-38'
  },
  {
    id: 'ortho',
    code: 'OR',
    name: 'Orthopaedics & Bone',
    hindiName: 'हड्डी रोग विभाग',
    rooms: ['Room 208'],
    doctor: 'Dr. Rajesh Verma, MS',
    waitingCount: 12,
    avgWaitMins: 25,
    icon: 'personal_injury',
    activeToken: 'OR-19'
  },
  {
    id: 'pedia',
    code: 'PD',
    name: 'Pediatrics / Child Care',
    hindiName: 'बाल चिकित्सा',
    rooms: ['Room 114'],
    doctor: 'Dr. Ananya Rao, MD (Ped)',
    waitingCount: 7,
    avgWaitMins: 15,
    icon: 'child_care',
    activeToken: 'PD-09'
  },
  {
    id: 'opht',
    code: 'OP',
    name: 'Eye / Ophthalmology',
    hindiName: 'नेत्र रोग',
    rooms: ['Room 301'],
    doctor: 'Dr. K. S. Murthy, MS',
    waitingCount: 9,
    avgWaitMins: 20,
    icon: 'visibility',
    activeToken: 'OP-14'
  },
  {
    id: 'ent',
    code: 'ET',
    name: 'ENT & Dental Care',
    hindiName: 'कान, नाक एवं गला',
    rooms: ['Room 305'],
    doctor: 'Dr. Farhan Ali, MDS',
    waitingCount: 14,
    avgWaitMins: 30,
    icon: 'hearing',
    activeToken: 'ET-22'
  },
  {
    id: 'gyn',
    code: 'GY',
    name: 'Gynaecology & Maternal',
    hindiName: 'महिला एवं प्रसूति',
    rooms: ['Room 110'],
    doctor: 'Dr. Pratibha Joshi, DGO',
    waitingCount: 11,
    avgWaitMins: 25,
    icon: 'pregnant_woman',
    activeToken: 'GY-16'
  }
];

const INITIAL_PATIENTS = [
  {
    id: 'token-gm-38',
    tokenNumber: 'GM-38',
    fullName: 'Harish Chandra Gupta',
    mobile: '9876543210',
    age: 58,
    gender: 'male',
    department: 'General Medicine',
    deptCode: 'GM',
    room: 'Room 102',
    doctor: 'Dr. Sunita Mehta, MD',
    shift: 'morning',
    isPriority: false,
    status: 'in-consultation', // 'waiting' | 'in-consultation' | 'completed' | 'no-show'
    registrationTime: new Date(Date.now() - 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedMins: 0,
    aheadCount: 0
  },
  {
    id: 'token-gm-39',
    tokenNumber: 'GM-39',
    fullName: 'Saraswati Devi',
    mobile: '9811223344',
    age: 68,
    gender: 'female',
    department: 'General Medicine',
    deptCode: 'GM',
    room: 'Room 102',
    doctor: 'Dr. Sunita Mehta, MD',
    shift: 'morning',
    isPriority: true,
    status: 'waiting',
    registrationTime: new Date(Date.now() - 35 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedMins: 5,
    aheadCount: 0
  },
  {
    id: 'token-gm-40',
    tokenNumber: 'GM-40',
    fullName: 'Mohd. Imran Khan',
    mobile: '9712345678',
    age: 42,
    gender: 'male',
    department: 'General Medicine',
    deptCode: 'GM',
    room: 'Room 102',
    doctor: 'Dr. Sunita Mehta, MD',
    shift: 'morning',
    isPriority: false,
    status: 'waiting',
    registrationTime: new Date(Date.now() - 25 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedMins: 15,
    aheadCount: 1
  },
  {
    id: 'token-gm-41',
    tokenNumber: 'GM-41',
    fullName: 'Pooja Bhatt',
    mobile: '9654321987',
    age: 29,
    gender: 'female',
    department: 'General Medicine',
    deptCode: 'GM',
    room: 'Room 102',
    doctor: 'Dr. Sunita Mehta, MD',
    shift: 'morning',
    isPriority: false,
    status: 'waiting',
    registrationTime: new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedMins: 25,
    aheadCount: 2
  },
  {
    id: 'token-gm-42',
    tokenNumber: 'GM-42',
    fullName: 'Ramesh Chandra Sharma',
    mobile: '9899001122',
    age: 64,
    gender: 'male',
    department: 'General Medicine',
    deptCode: 'GM',
    room: 'Room 102',
    doctor: 'Dr. Sunita Mehta, MD',
    shift: 'morning',
    isPriority: true,
    status: 'waiting',
    registrationTime: new Date(Date.now() - 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedMins: 35,
    aheadCount: 3
  }
];

// Helper to access persistent local storage
function getStorage(key, fallback) {
  try {
    const data = localStorage.getItem(`smartopd_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(`smartopd_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// Initial state sync
if (!localStorage.getItem('smartopd_departments')) {
  setStorage('departments', INITIAL_DEPARTMENTS);
}
if (!localStorage.getItem('smartopd_patients')) {
  setStorage('patients', INITIAL_PATIENTS);
}

// Service API
export const api = {
  getBaseUrl() {
    return API_BASE;
  },

  // 1. Register Patient & Generate Token
  async registerPatient(data) {
    // Try live backend first if available
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Graceful fallback to local simulated store
      // console.log('Using simulated queue store');
    }

    const depts = getStorage('departments', INITIAL_DEPARTMENTS);
    const patients = getStorage('patients', INITIAL_PATIENTS);

    const dept = depts.find(d => d.name.toLowerCase().includes(data.department.toLowerCase())) || depts[0];
    const deptPatients = patients.filter(p => p.deptCode === dept.code);
    const tokenSeq = deptPatients.length + 39;
    const tokenNumber = `${dept.code}-${tokenSeq}`;
    
    // Calculate waiting count and time
    const waitingPatients = deptPatients.filter(p => p.status === 'waiting');
    const aheadCount = waitingPatients.length;
    const estimatedMins = Math.max(5, (aheadCount + 1) * 8);

    const newPatient = {
      id: `token-${tokenNumber.toLowerCase()}`,
      tokenNumber,
      fullName: data.fullName,
      mobile: data.mobileNumber || data.mobile,
      age: parseInt(data.patientAge || data.age, 10),
      gender: data.gender || 'other',
      department: dept.name,
      deptCode: dept.code,
      room: dept.rooms[0],
      doctor: dept.doctor,
      shift: data.shiftSlot || 'morning',
      isPriority: !!data.priorityAssistance || (parseInt(data.patientAge, 10) >= 60),
      abhaNumber: data.abhaNumber || '',
      status: 'waiting',
      registrationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedMins,
      aheadCount
    };

    const updatedPatients = [newPatient, ...patients];
    setStorage('patients', updatedPatients);
    setStorage('latestToken', tokenNumber);

    return {
      success: true,
      token: newPatient
    };
  },

  // 2. Get Token by Number or ID
  async getToken(tokenNumber) {
    try {
      const res = await fetch(`${API_BASE}/tokens/${tokenNumber}`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // local fallback
    }

    const patients = getStorage('patients', INITIAL_PATIENTS);
    const patient = patients.find(p => p.tokenNumber.toUpperCase() === tokenNumber.toUpperCase());
    
    if (patient) {
      // Recalculate ahead count dynamically based on current waiting
      const deptWaiting = patients.filter(p => p.deptCode === patient.deptCode && p.status === 'waiting');
      const idx = deptWaiting.findIndex(p => p.tokenNumber === patient.tokenNumber);
      patient.aheadCount = idx >= 0 ? idx : 0;
      patient.estimatedMins = Math.max(5, (patient.aheadCount + 1) * 8);
      return { success: true, token: patient };
    }

    return { success: false, message: 'Token not found' };
  },

  // 3. Get All Queue Patients
  async getAllPatients() {
    try {
      const res = await fetch(`${API_BASE}/queue`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const patients = getStorage('patients', INITIAL_PATIENTS);
    return { success: true, patients };
  },

  // 4. Get Departments
  async getDepartments() {
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const depts = getStorage('departments', INITIAL_DEPARTMENTS);
    const patients = getStorage('patients', INITIAL_PATIENTS);

    // dynamically update wait counts
    const updated = depts.map(d => {
      const waitCount = patients.filter(p => p.deptCode === d.code && p.status === 'waiting').length;
      return {
        ...d,
        waitingCount: waitCount,
        avgWaitMins: Math.max(10, waitCount * 8)
      };
    });

    return { success: true, departments: updated };
  },

  // 5. Staff: Call Next Patient for Department
  async callNextPatient(deptCode, roomNumber) {
    try {
      const res = await fetch(`${API_BASE}/staff/call-next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deptCode, roomNumber }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const patients = getStorage('patients', INITIAL_PATIENTS);
    
    // Check if there is currently an in-consultation patient, mark completed
    const activeIdx = patients.findIndex(p => p.deptCode === deptCode && p.status === 'in-consultation');
    if (activeIdx !== -1) {
      patients[activeIdx].status = 'completed';
      patients[activeIdx].completedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Find next waiting patient (priority patients first!)
    const waitingPatients = patients.filter(p => p.deptCode === deptCode && p.status === 'waiting');
    if (waitingPatients.length === 0) {
      setStorage('patients', patients);
      return { success: false, message: 'No waiting patients in queue' };
    }

    // Sort: priority first, then insertion
    const nextPatient = waitingPatients.find(p => p.isPriority) || waitingPatients[0];
    const nextIdx = patients.findIndex(p => p.tokenNumber === nextPatient.tokenNumber);
    if (nextIdx !== -1) {
      patients[nextIdx].status = 'in-consultation';
      patients[nextIdx].calledTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Update department active token
    const depts = getStorage('departments', INITIAL_DEPARTMENTS);
    const deptIdx = depts.findIndex(d => d.code === deptCode);
    if (deptIdx !== -1) {
      depts[deptIdx].activeToken = nextPatient.tokenNumber;
      setStorage('departments', depts);
    }

    setStorage('patients', patients);
    return { success: true, calledPatient: patients[nextIdx] };
  },

  // 6. Staff: Update Patient Status
  async updateStatus(tokenNumber, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/staff/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenNumber, status: newStatus }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const patients = getStorage('patients', INITIAL_PATIENTS);
    const idx = patients.findIndex(p => p.tokenNumber === tokenNumber);
    if (idx !== -1) {
      patients[idx].status = newStatus;
      if (newStatus === 'completed') {
        patients[idx].completedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      setStorage('patients', patients);
      return { success: true, patient: patients[idx] };
    }

    return { success: false, message: 'Patient not found' };
  }
};
