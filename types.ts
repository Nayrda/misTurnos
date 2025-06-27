
export interface Shift {
  date: string; // YYYY-MM-DD
  typeId: string; // e.g., 'mañana', 'tarde', 'noche'
  notes: string;
}

export interface ShiftType {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string; // Tailwind bg color class
  textColor: string; // Tailwind text color class
}

export type ViewMode = 'month' | 'week';
