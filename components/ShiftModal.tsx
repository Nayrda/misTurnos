import React, { useState, useEffect, useRef } from 'react';
import type { Shift, ShiftType } from '../types';
import { toISODateString } from '../utils/dateHelpers';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startDate: Date, endDate: Date | null, shiftTypeId: string, notes: string) => void;
  onDelete: (date: Date) => void;
  date: Date | null;
  existingShift: Shift | undefined;
  shiftTypes: Record<string, ShiftType>;
}

const ChevronUpDownIcon = () => (
    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.78 9.53a.75.75 0 011.06 0L10 15.19l2.97-2.97a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, onDelete, date, existingShift, shiftTypes }) => {
  const [shiftTypeId, setShiftTypeId] = useState('');
  const [notes, setNotes] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDate, setEndDate] = useState(date ? toISODateString(date) : '');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existingShift) {
      setShiftTypeId(existingShift.typeId);
      setNotes(existingShift.notes);
      setIsMultiDay(false);
    } else {
      setShiftTypeId('');
      setNotes('');
      setIsMultiDay(false);
    }
    if (date) {
        setEndDate(toISODateString(date));
    }
  }, [existingShift, date]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  if (!isOpen || !date) return null;

  const handleSave = () => {
    // Correct for timezone issues where new Date('YYYY-MM-DD') can be off by one day
    const finalEndDate = isMultiDay && endDate && !existingShift ? new Date(endDate + 'T12:00:00') : null;
    onSave(date, finalEndDate, shiftTypeId, notes);
    onClose();
  };
  
  const handleDelete = () => {
    onDelete(date);
    onClose();
  };

  const handleSelectShiftType = (id: string) => {
    setShiftTypeId(id);
    setDropdownOpen(false);
  }

  const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const selectedShiftType = shiftTypes[shiftTypeId];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {existingShift ? 'Editar Turno' : 'Añadir Turno'}
          </h3>
          <p className="text-sm text-slate-500">{formattedDate}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipo de Turno</label>
            <div className="relative mt-1" ref={dropdownRef}>
                <button
                type="button"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="relative w-full cursor-default rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                {selectedShiftType ? (
                    <span className="flex items-center">
                        <span className={`inline-block h-3 w-3 rounded-full mr-3 ${selectedShiftType.color}`}></span>
                        <span className="block truncate font-medium text-slate-800">{selectedShiftType.name}</span>
                    </span>
                ) : (
                    <span className="block truncate text-slate-500">-- Sin Turno --</span>
                )}
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <ChevronUpDownIcon />
                </span>
                </button>
                {isDropdownOpen && (
                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-fade-in">
                    <li
                        onClick={() => handleSelectShiftType('')}
                        className="text-slate-500 relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-slate-100"
                    >
                        -- Sin Turno --
                    </li>
                    {Object.values(shiftTypes).map(type => (
                    <li
                        key={type.id}
                        onClick={() => handleSelectShiftType(type.id)}
                        className="text-slate-900 relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-slate-100"
                    >
                        <div className="flex items-center">
                            <span className={`inline-block h-3 w-3 rounded-full mr-3 ${type.color}`}></span>
                            <span className="font-normal block truncate">{type.name} <span className="text-slate-500 text-xs">({type.startTime} - {type.endTime})</span></span>
                        </div>
                    </li>
                    ))}
                </ul>
                )}
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Anotaciones</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800"
              placeholder="Añade notas o comentarios..."
            />
          </div>
          {!existingShift && (
            <div className="space-y-3 pt-2">
                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                        id="multiDay"
                        aria-describedby="multiDay-description"
                        name="multiDay"
                        type="checkbox"
                        checked={isMultiDay}
                        onChange={(e) => setIsMultiDay(e.target.checked)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="multiDay" className="font-medium text-slate-700">
                        Aplicar a varios días
                        </label>
                    </div>
                </div>
                 {isMultiDay && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-slate-500">Fecha de Inicio</label>
                            <input
                                type="date"
                                disabled
                                value={toISODateString(date)}
                                className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Fecha de Fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={toISODateString(date)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800"
                            />
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex justify-between items-center">
          {existingShift ? (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar Turno
              </button>
          ) : <div></div>}
          <div className="flex space-x-3">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Cancelar
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};