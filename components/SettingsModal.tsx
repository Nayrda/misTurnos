import React, { useState, useEffect } from 'react';
import type { ShiftType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShiftTypes: Record<string, ShiftType>) => void;
  initialShiftTypes: Record<string, ShiftType>;
}

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);


const COLOR_PALETTE: { color: string, textColor: string }[] = [
    { color: 'bg-cyan-200', textColor: 'text-cyan-800' },
    { color: 'bg-amber-200', textColor: 'text-amber-800' },
    { color: 'bg-indigo-300', textColor: 'text-indigo-900' },
    { color: 'bg-emerald-200', textColor: 'text-emerald-800' },
    { color: 'bg-rose-200', textColor: 'text-rose-800' },
    { color: 'bg-sky-200', textColor: 'text-sky-800' },
    { color: 'bg-fuchsia-300', textColor: 'text-fuchsia-900' },
    { color: 'bg-slate-300', textColor: 'text-slate-800' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialShiftTypes }) => {
  const [localShiftTypes, setLocalShiftTypes] = useState(initialShiftTypes);

  useEffect(() => {
    setLocalShiftTypes(initialShiftTypes);
  }, [initialShiftTypes]);

  if (!isOpen) return null;

  const handleInputChange = <K extends keyof ShiftType>(id: string, field: K, value: ShiftType[K]) => {
    setLocalShiftTypes(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleAddShiftType = () => {
    const newId = `turno_${Date.now()}`;
    const usedColors = Object.values(localShiftTypes).map(t => t.color);
    const availableColor = COLOR_PALETTE.find(p => !usedColors.includes(p.color)) || COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    setLocalShiftTypes(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        name: 'Nuevo Turno',
        startTime: '08:00',
        endTime: '16:00',
        color: availableColor.color,
        textColor: availableColor.textColor
      }
    }));
  };

  const handleDeleteShiftType = (idToDelete: string) => {
    setLocalShiftTypes(prev => {
      const newState = { ...prev };
      delete newState[idToDelete];
      return newState;
    });
  };

  const handleSave = () => {
    const validShiftTypes = Object.fromEntries(
        Object.entries(localShiftTypes).filter(([, type]) => type.name.trim() !== '')
    );
    onSave(validShiftTypes);
    onClose();
  };
  
  const handleColorChange = (typeId: string, palette: { color: string; textColor: string }) => {
    setLocalShiftTypes(prev => ({
      ...prev,
      [typeId]: { ...prev[typeId], color: palette.color, textColor: palette.textColor }
    }));
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center"><CogIcon/> Configuración de Turnos</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {Object.values(localShiftTypes).map((type) => (
            <div key={type.id} className="p-4 border rounded-lg border-slate-200 bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-slate-700">Nombre del Turno</label>
                        <input
                        type="text"
                        value={type.name}
                        onChange={(e) => handleInputChange(type.id, 'name', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800"
                        />
                    </div>
                    <button onClick={() => handleDeleteShiftType(type.id)} className="ml-4 mt-6 text-slate-400 hover:text-red-500 transition-colors" aria-label="Eliminar turno">
                        <TrashIcon />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Hora de Inicio</label>
                        <input
                            type="time"
                            value={type.startTime}
                            onChange={(e) => handleInputChange(type.id, 'startTime', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Hora de Fin</label>
                        <input
                            type="time"
                            value={type.endTime}
                            onChange={(e) => handleInputChange(type.id, 'endTime', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800"
                        />
                    </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700">Color</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                    {COLOR_PALETTE.map(palette => (
                        <button
                        key={palette.color}
                        onClick={() => handleColorChange(type.id, palette)}
                        className={`h-7 w-7 rounded-full ${palette.color} border-2 transition-transform transform hover:scale-110 ${type.color === palette.color ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-slate-300'}`}
                        aria-label={`Color ${palette.color}`}
                        />
                    ))}
                    </div>
                </div>
            </div>
          ))}
           <button 
                onClick={handleAddShiftType} 
                className="w-full flex items-center justify-center px-4 py-2 bg-slate-100 border-2 border-dashed border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
             <PlusIcon /> Añadir Nuevo Turno
          </button>
        </div>
        <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex justify-end space-x-3 mt-auto">
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
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};