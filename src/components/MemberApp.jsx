import React, { useState, useMemo } from 'react';
import {
    Menu,
    X,
    Calendar,
    Bell,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    CheckCircle,
    Circle,
    Moon,
    Sun,
    Home,
    BarChart3,
    Users,
    Gift,
    Heart,
    Music,
    Baby,
    Sparkles,
    Settings
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, isSameMonth, isToday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MemberApp = ({ currentMember, events = [], avisos = [], onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const menuItems = [
        { id: 'home', label: 'Dashboard', icon: BarChart3 },
        { id: 'perfil', label: 'Membros', icon: Users },
        { id: 'eventos', label: 'Eventos', icon: Calendar },
        { id: 'aniversarios', label: 'Aniversários', icon: Gift },
        { id: 'avisos', label: 'Avisos', icon: Bell },
        { id: 'diaconia', label: 'Diaconia', icon: Heart },
        { id: 'louvor', label: 'Louvor', icon: Music },
        { id: 'playlistzoe', label: 'Playlist Zoe', icon: null },
        { id: 'kids', label: 'Kids', icon: Baby },
        { id: 'jovens', label: 'Jovens', icon: Sparkles },
        { id: 'configuracoes', label: 'Configurações', icon: Settings }
    ];
    const [activeTab, setActiveTab] = useState('home');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
    const [selectedFoods, setSelectedFoods] = useState({});
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true' || false;
    });

    // Eventos futuros ordenados por data
    const futureEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter(event => {
                try {
                    const eventDate = parseISO(event.data);
                    return isAfter(eventDate, now);
                } catch {
                    return false;
                }
            })
            .sort((a, b) => {
                try {
                    return parseISO(a.data) - parseISO(b.data);
                } catch {
                    return 0;
                }
            });
    }, [events]);

    // Próximo evento
    const nextEvent = futureEvents[0];

    // Avisos recentes (últimos 5)
    const recentAvisos = useMemo(() => {
        return avisos.slice(0, 5);
    }, [avisos]);

    // Função para confirmar seleção de comidas
    const handleConfirmFoodSelection = () => {
        if (!selectedEvent || !currentMember) return;

        const updatedEvent = {
            ...selectedEvent,
            comidas: selectedEvent.comidas?.map(comida => {
                if (selectedFoods[comida.nome]) {
                    return {
                        ...comida,
                        responsavel: currentMember.nome,
                        membroId: currentMember.id
                    };
                }
                return comida;
            })
        };

        // Aqui você pode adicionar a lógica para salvar no backend
        // Por enquanto, apenas atualizamos localmente
        setSelectedEvent(updatedEvent);
        setSelectedFoods({});
        alert(`Seleção confirmada! Você se comprometeu a trazer: ${Object.keys(selectedFoods).join(', ')}`);
    };

    // Renderizar calendário
    const renderCalendar = () => {
        const monthStart = startOfMonth(calendarDate);
        const monthEnd = endOfMonth(calendarDate);
        const startDate = startOfWeek(monthStart, { locale: ptBR });
        const endDate = endOfWeek(monthEnd, { locale: ptBR });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter(event => {
                    try {
                        const eventDate = parseISO(event.data);
                        return format(eventDate, 'yyyy-MM-dd') === format(cloneDay, 'yyyy-MM-dd');
                    } catch {
                        return false;
                    }
                });

                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                days.push(
                    <div
                        key={day}
                        className={`
                            min-h-[80px] p-2 border border-gray-200 dark:border-gray-700
                            ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400' : 'bg-white dark:bg-gray-800'}
                            ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                        `}
                    >
                        <div className={`text-sm font-medium ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {format(day, dateFormat)}
                        </div>
                        <div className="mt-1 space-y-1">
                            {dayEvents.map(event => {
                                const isOficina = event.tipo === 'oficina';
                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => {
                                            setSelectedEvent(event);
                                            setShowEventDetailsModal(true);
                                        }}
                                        className={`
                                            text-xs p-1 rounded cursor-pointer truncate
                                            ${isOficina 
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50' 
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'}
                                        `}
                                        title={event.nome}
                                    >
                                        {isOficina && '🎓 '}{event.nome}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day} className="grid grid-cols-7 gap-0">
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="space-y-0">{rows}</div>;
    };

    // Renderizar detalhes do evento
    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        const eventDate = parseISO(selectedEvent.data);
        const hasFood = selectedEvent.alimentacao && selectedEvent.comidas?.length > 0;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedEvent.tipo === 'oficina' && '🎓 '}
                                    {selectedEvent.nome}
                                </h2>
                                {selectedEvent.tipo === 'oficina' && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                        Oficina
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setShowEventDetailsModal(false);
                                    setSelectedEvent(null);
                                    setSelectedFoods({});
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Clock className="h-5 w-5 mr-2" />
                                <span>{format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>

                            {selectedEvent.local && (
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    <span>{selectedEvent.local}</span>
                                </div>
                            )}

                            {selectedEvent.descricao && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Descrição</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{selectedEvent.descricao}</p>
                                </div>
                            )}

                            {hasFood && (
                                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                        🍽️ Alimentação - Escolha o que você pode trazer
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedEvent.comidas.map((comida, index) => {
                                            const jaEscolhido = comida.responsavel && comida.responsavel !== '';
                                            const euEscolhi = comida.membroId === currentMember?.id;
                                            
                                            return (
                                                <label
                                                    key={index}
                                                    className={`
                                                        flex items-center p-3 rounded border cursor-pointer transition-all
                                                        ${jaEscolhido && !euEscolhi
                                                            ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                                                            : euEscolhi
                                                            ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600'
                                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-400'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFoods[comida.nome] || euEscolhi}
                                                        onChange={(e) => {
                                                            if (!jaEscolhido || euEscolhi) {
                                                                setSelectedFoods({
                                                                    ...selectedFoods,
                                                                    [comida.nome]: e.target.checked
                                                                });
                                                            }
                                                        }}
                                                        disabled={jaEscolhido && !euEscolhi}
                                                        className="h-5 w-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                                                    />
                                                    <span className="ml-3 flex-1">
                                                        <span className="text-gray-900 dark:text-white font-medium">{comida.nome}</span>
                                                        {jaEscolhido && (
                                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                                ({euEscolhi ? 'Você escolheu' : `Escolhido por ${comida.responsavel}`})
                                                            </span>
                                                        )}
                                                    </span>
                                                    {jaEscolhido ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {Object.keys(selectedFoods).filter(k => selectedFoods[k]).length > 0 && (
                                        <button
                                            onClick={handleConfirmFoodSelection}
                                            className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Confirmar Seleção
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40"
                     style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                    <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Olá, {currentMember?.nome?.split(' ')[0] || 'Membro'}!
                                </h1>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        setDarkMode(!darkMode);
                                        localStorage.setItem('darkMode', !darkMode);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Modal em Grade */}
                {sidebarOpen && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
                        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden"
                             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                            <div className="p-6">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                </div>

                                <div className="flex items-center space-x-3 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {currentMember?.nome?.charAt(0) || 'M'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{currentMember?.nome}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{currentMember?.funcao || 'Membro'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {menuItems.map(item => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setActiveTab(item.id);
                                                    setSidebarOpen(false);
                                                }}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                                                    isActive
                                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105'
                                                }`}
                                            >
                                                {item.id === 'playlistzoe' ? (
                                                    <span className="w-7 h-7 mb-2 flex items-center justify-center font-bold text-2xl">Z</span>
                                                ) : (
                                                    <Icon className="w-7 h-7 mb-2" />
                                                )}
                                                <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sair</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="p-4 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
                    {/* Início */}
                    {activeTab === 'home' && (
                        <div className="space-y-6">
                            {/* Próximo Evento */}
                            {nextEvent && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Próximo Evento</h2>
                                    <div
                                        onClick={() => {
                                            setSelectedEvent(nextEvent);
                                            setShowEventDetailsModal(true);
                                        }}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-4 rounded-lg transition-colors"
                                    >
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {nextEvent.tipo === 'oficina' && '🎓 '}
                                            {nextEvent.nome}
                                        </h3>
                                        <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {format(parseISO(nextEvent.data), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                        </div>
                                        {nextEvent.local && (
                                            <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {nextEvent.local}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Avisos Recentes */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Avisos Recentes</h2>
                                    <button
                                        onClick={() => setActiveTab('avisos')}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Ver todos
                                    </button>
                                </div>
                                {recentAvisos.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentAvisos.map(aviso => (
                                            <div key={aviso.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="font-medium text-gray-900 dark:text-white">{aviso.titulo}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{aviso.mensagem}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum aviso recente</p>
                                )}
                            </div>

                            {/* Próximos Eventos */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Próximos Eventos</h2>
                                    <button
                                        onClick={() => setActiveTab('eventos')}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Ver calendário
                                    </button>
                                </div>
                                {futureEvents.slice(0, 3).length > 0 ? (
                                    <div className="space-y-2">
                                        {futureEvents.slice(0, 3).map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => {
                                                    setSelectedEvent(event);
                                                    setShowEventDetailsModal(true);
                                                }}
                                                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors"
                                            >
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {event.tipo === 'oficina' && '🎓 '}
                                                    {event.nome}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {format(parseISO(event.data), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum evento agendado</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Eventos */}
                    {activeTab === 'eventos' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {format(calendarDate, 'MMMM yyyy', { locale: ptBR })}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setCalendarDate(new Date())}
                                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                        >
                                            Hoje
                                        </button>
                                        <button
                                            onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Dias da Semana */}
                                <div className="grid grid-cols-7 gap-0 mb-2">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                        <div key={day} className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendário */}
                                {renderCalendar()}
                            </div>
                        </div>
                    )}

                    {/* Avisos */}
                    {activeTab === 'avisos' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Avisos</h2>
                                {avisos.length > 0 ? (
                                    <div className="space-y-3">
                                        {avisos.map(aviso => (
                                            <div key={aviso.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{aviso.titulo}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 mt-2">{aviso.mensagem}</p>
                                                {aviso.destinatarios && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                                        Para: {aviso.destinatarios.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum aviso disponível</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Aniversários */}
                    {activeTab === 'aniversarios' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aniversários</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Diaconia */}
                    {activeTab === 'diaconia' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Diaconia</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Louvor */}
                    {activeTab === 'louvor' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Louvor</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Playlist Zoe */}
                    {activeTab === 'playlistzoe' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Playlist Zoe</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Kids */}
                    {activeTab === 'kids' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Kids</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Jovens */}
                    {activeTab === 'jovens' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Jovens</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Configurações */}
                    {activeTab === 'configuracoes' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Configurações</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Perfil/Membros */}
                    {activeTab === 'perfil' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Meu Perfil</h2>
                                
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {currentMember?.nome?.charAt(0) || 'M'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{currentMember?.nome}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{currentMember?.funcao || 'Membro'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <p className="text-gray-900 dark:text-white">{currentMember?.email || 'Não informado'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                                        <p className="text-gray-900 dark:text-white">{currentMember?.telefone || 'Não informado'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {currentMember?.nascimento 
                                                ? format(parseISO(currentMember.nascimento), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                                                : 'Não informado'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Família</label>
                                        <p className="text-gray-900 dark:text-white">{currentMember?.familia || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal de Detalhes do Evento */}
                {showEventDetailsModal && renderEventDetails()}
            </div>
        </div>
    );
};

export default MemberApp;
