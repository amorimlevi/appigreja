import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CustomCalendar({ value, onChange, label, disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState('month'); // 'day', 'month', 'year'
    const [currentDate, setCurrentDate] = useState(value ? parseISO(value) : new Date());
    const [inputValue, setInputValue] = useState(() => {
        if (!value) return '';
        try {
            return format(parseISO(value), 'dd/MM/yyyy');
        } catch {
            return '';
        }
    });

    // Formatar data enquanto digita
    const formatDateInput = (input) => {
        const numbers = input.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    };

    // Converter DD/MM/YYYY para YYYY-MM-DD
    const convertToISODate = (dateStr) => {
        const numbers = dateStr.replace(/\D/g, '');
        if (numbers.length !== 8) return null;

        const day = numbers.slice(0, 2);
        const month = numbers.slice(2, 4);
        const year = numbers.slice(4, 8);

        const date = new Date(year, month - 1, day);
        if (date.getDate() !== parseInt(day) || date.getMonth() !== parseInt(month) - 1) {
            return null; // Data inválida
        }

        return `${year}-${month}-${day}`;
    };

    const handleInputChange = (e) => {
        const formatted = formatDateInput(e.target.value);
        setInputValue(formatted);

        if (formatted.length === 10) {
            const isoDate = convertToISODate(formatted);
            if (isoDate) {
                onChange(isoDate);
                setCurrentDate(parseISO(isoDate));
            }
        }
    };

    const handleDateSelect = (date) => {
        onChange(date);
        setInputValue(format(parseISO(date), 'dd/MM/yyyy'));
        setIsOpen(false);
    };

    const renderDayView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);
                const isSelected = value && format(parseISO(value), 'yyyy-MM-dd') === format(cloneDay, 'yyyy-MM-dd');

                days.push(
                    <div
                        key={day}
                        onClick={() => {
                            if (!disabled) {
                                handleDateSelect(format(cloneDay, 'yyyy-MM-dd'));
                            }
                        }}
                        className={`
                            aspect-square flex items-center justify-center p-2 cursor-pointer text-base
                            ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                            ${isTodayDate && !isSelected ? 'bg-gray-200 dark:bg-gray-700 rounded-full font-bold' : ''}
                            ${isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold' : ''}
                            ${!isTodayDate && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full' : ''}
                        `}
                    >
                        {format(day, dateFormat)}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }

        return <div>{rows}</div>;
    };

    const renderMonthView = () => {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const currentMonth = currentDate.getMonth();

        return (
            <div className="grid grid-cols-3 gap-3">
                {months.map((month, index) => (
                    <button
                        key={month}
                        type="button"
                        onClick={() => {
                            setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
                            setViewMode('day');
                        }}
                        className={`
                            p-3 rounded-lg text-center cursor-pointer transition-colors
                            ${currentMonth === index ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}
                        `}
                    >
                        {month}
                    </button>
                ))}
            </div>
        );
    };

    const renderYearView = () => {
        const currentYear = currentDate.getFullYear();
        const startYear = currentYear - 50;
        const years = Array.from({ length: 101 }, (_, i) => startYear + i);

        return (
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {years.map(year => (
                    <button
                        key={year}
                        type="button"
                        onClick={() => {
                            setCurrentDate(new Date(year, currentDate.getMonth(), 1));
                            setViewMode('month');
                        }}
                        className={`
                            p-3 rounded-lg text-center cursor-pointer transition-colors
                            ${currentYear === year ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}
                        `}
                    >
                        {year}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => !disabled && setIsOpen(true)}
                    disabled={disabled}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-200 dark:border-gray-700 w-full min-w-[320px]">
                        {/* Tabs Day/Month/Year */}
                        <div className="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setViewMode('day')}
                                className={`px-6 py-2 text-sm font-medium transition-colors ${viewMode === 'day'
                                        ? 'border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Dia
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('month')}
                                className={`px-6 py-2 text-sm font-medium transition-colors ${viewMode === 'month'
                                        ? 'border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Mês
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('year')}
                                className={`px-6 py-2 text-sm font-medium transition-colors ${viewMode === 'year'
                                        ? 'border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Ano
                            </button>
                        </div>

                        {viewMode === 'day' && (
                            <>
                                {/* Cabeçalho do Mês */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                                        {format(currentDate, 'MMMM', { locale: ptBR })}
                                    </h2>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Dias da Semana */}
                                <div className="grid grid-cols-7 mb-4">
                                    {['Mn', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendário */}
                                {renderDayView()}
                            </>
                        )}

                        {viewMode === 'month' && renderMonthView()}
                        {viewMode === 'year' && renderYearView()}
                    </div>
                </>
            )}
        </div>
    );
}
