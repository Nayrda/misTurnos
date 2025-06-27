import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Shift, ShiftType, ViewMode } from './types';
import { toISODateString, getMonthName, WEEK_DAYS, SHORT_WEEK_DAYS, getMonthDays, getWeekDays } from './utils/dateHelpers';
import { ShiftModal } from './components/ShiftModal';
import { SettingsModal } from './components/SettingsModal';
import { useAuth } from './hooks/useAuth';
import { Auth } from './components/Auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);
const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const DEFAULT_SHIFT_TYPES: Record<string, ShiftType> = {
  manyana: { id: 'manyana', name: 'Mañana', startTime: '06:00', endTime: '14:00', color: 'bg-cyan-200', textColor: 'text-cyan-800' },
  tarde: { id: 'tarde', name: 'Tarde', startTime: '14:00', endTime: '22:00', color: 'bg-amber-200', textColor: 'text-amber-800' },
  noche: { id: 'noche', name: 'Noche', startTime: '22:00', endTime: '06:00', color: 'bg-indigo-300', textColor: 'text-indigo-900' },
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  const [shiftTypes, setShiftTypes] = useState<Record<string, ShiftType>>({});
  const [shifts, setShifts] = useState<Record<string, Shift>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [isShiftModalOpen, setShiftModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [isMonthSelectorOpen, setMonthSelectorOpen] = useState(false);
  const [isYearSelectorOpen, setYearSelectorOpen] = useState(false);

  const monthSelectorRef = useRef<HTMLDivElement>(null);
  const yearSelectorRef = useRef<HTMLDivElement>(null);
  const monthButtonRef = useRef<HTMLButtonElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);
  const selectedYearRef = useRef<HTMLButtonElement>(null);

   useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setShiftTypes(data.shiftTypes || DEFAULT_SHIFT_TYPES);
        setShifts(data.shifts || {});
      } else {
        // New user, create default data
        const defaultData = {
            shiftTypes: DEFAULT_SHIFT_TYPES,
            shifts: {}
        };
        await setDoc(userDocRef, defaultData);
        setShiftTypes(defaultData.shiftTypes);
        setShifts(defaultData.shifts);
      }
      setIsLoadingData(false);
    };

    fetchData();
  }, [user, authLoading]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMonthSelectorOpen && monthSelectorRef.current && !monthSelectorRef.current.contains(event.target as Node) && monthButtonRef.current && !monthButtonRef.current.contains(event.target as Node)) setMonthSelectorOpen(false);
      if (isYearSelectorOpen && yearSelectorRef.current && !yearSelectorRef.current.contains(event.target as Node) && yearButtonRef.current && !yearButtonRef.current.contains(event.target as Node)) setYearSelectorOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMonthSelectorOpen, isYearSelectorOpen]);

  useEffect(() => {
    if (isYearSelectorOpen && selectedYearRef.current) {
      selectedYearRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isYearSelectorOpen]);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setShiftModalOpen(true);
  }, []);
  
  const handleMonthSelect = useCallback((monthIndex: number) => {
    setCurrentDate(prev => { const newDate = new Date(prev); newDate.setDate(1); newDate.setMonth(monthIndex); return newDate; });
    setMonthSelectorOpen(false);
  }, []);

  const handleYearSelect = useCallback((year: number) => {
    setCurrentDate(prev => { const newDate = new Date(prev); newDate.setFullYear(year); return newDate; });
    setYearSelectorOpen(false);
  }, []);

  const saveData = async (dataToSave: { shifts?: Record<string, Shift>; shiftTypes?: Record<string, ShiftType> }) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, dataToSave, { merge: true });
  };

  const handleSaveShift = useCallback(async (startDate: Date, endDate: Date | null, typeId: string, notes: string) => {
    const newShifts = { ...shifts };
    const loopStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const loopEndDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : loopStartDate;
    
    let currentDate = new Date(loopStartDate);
    while (currentDate <= loopEndDate) {
        const dateKey = toISODateString(currentDate);
        if (typeId) {
            newShifts[dateKey] = { date: dateKey, typeId, notes };
        } else {
            delete newShifts[dateKey];
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    setShifts(newShifts);
    await saveData({ shifts: newShifts });
    setShiftModalOpen(false);
  }, [shifts, user]);


  const handleDeleteShift = useCallback(async (date: Date) => {
    const dateKey = toISODateString(date);
    const newShifts = { ...shifts };
    delete newShifts[dateKey];
    setShifts(newShifts);
    await saveData({ shifts: newShifts });
    setShiftModalOpen(false);
  }, [shifts, user]);

  const handleSaveSettings = useCallback(async (updatedShiftTypes: Record<string, ShiftType>) => {
    setShiftTypes(updatedShiftTypes);
    await saveData({ shiftTypes: updatedShiftTypes });
  }, [user]);

  const handleSignOut = async () => {
    await auth.signOut();
    setShifts({});
    setShiftTypes({});
  };

  const changeDate = (amount: number, unit: 'month' | 'week') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (unit === 'month') newDate.setMonth(newDate.getMonth() + amount);
      else newDate.setDate(newDate.getDate() + (amount * 7));
      return newDate;
    });
  };

  if (authLoading || isLoadingData) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
        </div>
    );
  }

  if (!user) {
      return <Auth />;
  }

  const calendarDays = viewMode === 'month' ? getMonthDays(currentDate) : getWeekDays(currentDate);
  const today = new Date();

  return (
    <div className="min-h-screen text-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-0">
             <div className="flex items-baseline space-x-1">
                <div className="relative">
                    <button ref={monthButtonRef} onClick={() => { setMonthSelectorOpen(o => !o); setYearSelectorOpen(false); }} className="text-xl sm:text-2xl font-bold text-slate-900 rounded-md px-2 py-1 hover:bg-slate-200 transition-colors">
                        {getMonthName(currentDate.getMonth())}
                    </button>
                    {isMonthSelectorOpen && (<div ref={monthSelectorRef} className="absolute left-0 top-full mt-2 z-20 w-64 bg-white rounded-lg shadow-xl border border-slate-200"><div className="grid grid-cols-3 gap-1 p-2">{Array.from({ length: 12 }).map((_, i) => (<button key={i} onClick={() => handleMonthSelect(i)} className={`p-2 rounded-md text-sm font-medium text-center ${currentDate.getMonth() === i ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>{getMonthName(i, 'es-ES')}</button>))}</div></div>)}
                </div>
                 <div className="relative">
                    <button ref={yearButtonRef} onClick={() => { setYearSelectorOpen(o => !o); setMonthSelectorOpen(false); }} className="text-xl sm:text-2xl font-light text-slate-400 rounded-md px-2 py-1 hover:bg-slate-200 transition-colors">
                        {currentDate.getFullYear()}
                    </button>
                    {isYearSelectorOpen && (<div ref={yearSelectorRef} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-40 bg-white rounded-lg shadow-xl border border-slate-200"><div className="max-h-72 overflow-y-auto">{Array.from({ length: 101 }).map((_, i) => { const year = currentDate.getFullYear() - 50 + i; const isSelected = currentDate.getFullYear() === year; return (<button ref={isSelected ? selectedYearRef : null} key={year} onClick={() => handleYearSelect(year)} className={`w-full text-center px-4 py-2 text-sm ${isSelected ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>{year}</button>);})}</div></div>)}
                </div>
            </div>
            <button onClick={() => changeDate(-1, viewMode)} className="p-2 rounded-full hover:bg-slate-200"><ChevronLeftIcon /></button>
            <button onClick={() => changeDate(1, viewMode)} className="p-2 rounded-full hover:bg-slate-200"><ChevronRightIcon /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-100">Hoy</button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex rounded-md shadow-sm bg-slate-200 p-1">
              <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'month' ? 'bg-white text-indigo-600' : 'text-slate-600'}`}>Mes</button>
              <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'week' ? 'bg-white text-indigo-600' : 'text-slate-600'}`}>Semana</button>
            </div>
            <button onClick={() => setSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-slate-200" aria-label="Configuración">
              <CogIcon/>
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-slate-200" aria-label="Cerrar sesión">
                <LogoutIcon />
            </button>
          </div>
        </header>

        <main className="bg-white shadow-lg rounded-lg">
          <div className="grid grid-cols-7 text-center font-semibold text-sm text-slate-600 border-b border-slate-200">
            {WEEK_DAYS.map((day, i) => <div key={day} className="py-3 px-1"><span className="hidden sm:inline">{day}</span><span className="sm:hidden">{SHORT_WEEK_DAYS[i]}</span></div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateKey = toISODateString(day);
              const shift = shifts[dateKey];
              const shiftType = shift ? shiftTypes[shift.typeId] : null;
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = toISODateString(day) === toISODateString(today);
              const dayClasses = `relative h-28 sm:h-32 lg:h-36 p-2 border-r border-b border-slate-100 transition-colors duration-200 ease-in-out cursor-pointer hover:bg-slate-100 ${!isCurrentMonth ? 'text-slate-400' : ''} ${shiftType ? `${shiftType.color} ${shiftType.textColor}` : 'bg-white'}`;
              const dateNumberClasses = `absolute top-2 left-2 flex items-center justify-center h-7 w-7 rounded-full text-sm ${isToday ? 'bg-indigo-600 text-white font-bold' : ''}`;

              return (
                <div key={index} className={dayClasses} onClick={() => handleDayClick(day)}>
                  <span className={dateNumberClasses}>{day.getDate()}</span>
                  {shiftType && (
                    <div className="pt-8 text-left space-y-1 overflow-hidden h-full">
                      <p className="font-bold text-sm break-words">{shiftType.name}</p>
                      {shift.notes && <p className="text-xs opacity-70 break-words whitespace-pre-wrap">{shift.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
      <ShiftModal isOpen={isShiftModalOpen} onClose={() => setShiftModalOpen(false)} onSave={handleSaveShift} onDelete={handleDeleteShift} date={selectedDate} existingShift={selectedDate ? shifts[toISODateString(selectedDate)] : undefined} shiftTypes={shiftTypes} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSave={handleSaveSettings} initialShiftTypes={shiftTypes} />
    </div>
  );
}

export default App;