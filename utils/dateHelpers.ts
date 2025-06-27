
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getMonthName = (monthIndex: number, locale: string = 'es-ES'): string => {
    const date = new Date();
    date.setMonth(monthIndex);
    let monthName = date.toLocaleString(locale, { month: 'long' });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
};

export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const SHORT_WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];


// Generates calendar days for the month view
export const getMonthDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday. We want Monday to be 0.
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 
    
    const days: Date[] = [];
    
    // Days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
        const day = new Date(firstDayOfMonth);
        day.setDate(day.getDate() - (startDayOfWeek - i));
        days.push(day);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    // Days from next month to fill the grid
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
        for (let i = 1; i <= remainingCells; i++) {
            const day = new Date(lastDayOfMonth);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
    }

    return days;
};

// Generates calendar days for the week view
export const getWeekDays = (date: Date): Date[] => {
    const dayOfWeek = (date.getDay() + 6) % 7; // Monday is 0
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        week.push(day);
    }
    return week;
};