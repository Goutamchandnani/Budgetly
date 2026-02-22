import { getLast12Months } from '../utils/dateHelpers';

export default function MonthSelector({ selectedMonth, onChange }) {
    const months = getLast12Months();

    return (
        <div className="relative">
            <select
                value={selectedMonth}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-budgetly-mid/50 border border-white/10 rounded-xl text-budgetly-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-budgetly-accent focus:border-transparent cursor-pointer hover:bg-budgetly-mid/70 transition-colors shadow-sm"
            >
                {months.map((month) => (
                    <option key={month.value} value={month.value} className="bg-budgetly-base text-budgetly-white">
                        {month.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-budgetly-sage" />
                </svg>
            </div>
        </div>
    );
}
