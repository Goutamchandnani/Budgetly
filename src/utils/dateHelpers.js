import { format, parseISO, startOfMonth, subMonths } from 'date-fns';

export function formatDate(dateString) {
    return format(parseISO(dateString), 'MMM d, yyyy');
}

export function formatMonthYear(dateString) {
    // Expects YYYY-MM
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy');
}

export function getCurrentMonthISO() {
    return format(new Date(), 'yyyy-MM');
}

export function getLast12Months() {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
        const date = subMonths(today, i);
        months.push({
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy')
        });
    }

    return months;
}
