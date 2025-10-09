import React, { useState, useMemo, useEffect } from 'react';
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
    Settings,
    Search,
    Plus,
    Edit
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, isSameMonth, isToday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatId } from '../utils/formatters';
import { searchMembers, getEventFoods } from '../lib/supabaseService';

const MemberApp = ({ currentMember, events = [], avisos = [], onAddMember, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    
    const menuItems = [
        { id: 'home', label: 'Dashboard', icon: BarChart3 },
        { id: 'perfil', label: 'Família', icon: Users },
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
    const [familyMemberSearch, setFamilyMemberSearch] = useState('');
    const [expandedFamilies, setExpandedFamilies] = useState({});
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [newFamilyData, setNewFamilyData] = useState({
        nome: '',
        descricao: ''
    });
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [myFamily, setMyFamily] = useState(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);
    const [editFamilyData, setEditFamilyData] = useState({
        nome: '',
        descricao: '',
        membrosIds: []
    });
    const [newMemberData, setNewMemberData] = useState({
        nome: '',
        telefone: '',
        dataNascimento: '',
        idade: '',
        genero: '',
        funcoes: []
    });
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true' || false;
    });
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const searchMembersFromDB = async () => {
            if (familyMemberSearch.trim().length >= 2) {
                try {
                    const results = await searchMembers(familyMemberSearch.trim());
                    setSearchResults(results);
                } catch (error) {
                    console.error('Erro ao buscar membros:', error);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        };

        const timeoutId = setTimeout(() => {
            searchMembersFromDB();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [familyMemberSearch]);

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

    // Função para selecionar evento e buscar comidas
    const handleSelectEvent = async (event) => {
        try {
            // Buscar comidas do evento se tiver alimentação
            if (event.alimentacao) {
                const comidas = await getEventFoods(event.id);
                setSelectedEvent({
                    ...event,
                    comidas: comidas || []
                });
            } else {
                setSelectedEvent(event);
            }
            setShowEventDetailsModal(true);
        } catch (error) {
            console.error('Erro ao buscar comidas do evento:', error);
            setSelectedEvent(event);
            setShowEventDetailsModal(true);
        }
    };

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
                                        onClick={() => handleSelectEvent(event)}
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
                                            const euEscolhi = comida.membro_id === currentMember?.id;
                                            
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
                                                onClick={() => handleSelectEvent(event)}
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

                    {/* Família */}
                    {activeTab === 'perfil' && (
                    <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Minha Família</h1>
                    <div className="flex gap-2">
                    <button
                        onClick={() => setShowFamilyModal(true)}
                            className="flex items-center justify-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                            <span className="text-sm md:text-base">Criar Família</span>
                            </button>
                                    <button
                                        onClick={() => setShowAddMemberModal(true)}
                                        className="flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        <span className="text-sm md:text-base">Adicionar Membro</span>
                                    </button>
                                </div>
                            </div>

                            {/* Lista de Famílias */}
                            {myFamily || currentMember?.familia ? (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div 
                                        className="flex items-center justify-between cursor-pointer p-4"
                                        onClick={() => {
                                            const familyId = myFamily?.nome || currentMember.familia;
                                            setExpandedFamilies(prev => ({
                                                ...prev,
                                                [familyId]: !prev[familyId]
                                            }));
                                        }}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 flex items-center justify-center">
                                                <Users className="w-6 h-6 text-white dark:text-gray-900" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">
                                                    {myFamily?.nome || currentMember.familia}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {myFamily ? `${myFamily.membros.length} ${myFamily.membros.length === 1 ? 'membro' : 'membros'}` : 'Minha família'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Abrir modal de edição
                                                    if (myFamily) {
                                                        setEditFamilyData({
                                                            id: myFamily.id,
                                                            nome: myFamily.nome,
                                                            descricao: myFamily.descricao || '',
                                                            membrosIds: myFamily.membros.map(m => m.id)
                                                        });
                                                        setShowEditFamilyModal(true);
                                                    }
                                                }}
                                                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                                                title="Editar Família"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            {expandedFamilies[myFamily?.nome || currentMember.familia] ? (
                                                <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400 transform rotate-90 transition-transform" />
                                            ) : (
                                                <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform" />
                                            )}
                                        </div>
                                    </div>

                                    {expandedFamilies[myFamily?.nome || currentMember.familia] && (
                                        <div className="space-y-3 p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                                            {myFamily ? (
                                                // Mostrar membros da família criada
                                                myFamily.membros.map((member, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm">
                                                                {member.nome.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                                    {member.nome} {member.isCurrentUser && '(Você)'}
                                                                </h4>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <span>{member.funcoes ? member.funcoes.join(', ') : member.funcao || 'Membro'}</span>
                                                                {member.idade && <span>• {member.idade} anos</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                // Mostrar membro único se tiver família no perfil
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm">
                                                            {currentMember?.nome?.charAt(0) || 'M'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {currentMember.nome} (Você)
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <span>{currentMember.funcao || 'Membro'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
                                    <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Você ainda não pertence a uma família.</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Clique em "Criar Família" para começar.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal de Adicionar Membro */}
                {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Membro</h3>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                
                                // Validação: pelo menos uma função deve ser selecionada
                                if (newMemberData.funcoes.length === 0) {
                                    alert('Selecione pelo menos uma função');
                                    return;
                                }

                                // Criar membro no Supabase
                                try {
                                    const memberToCreate = {
                                        nome: newMemberData.nome,
                                        telefone: newMemberData.telefone,
                                        nascimento: newMemberData.dataNascimento,
                                        idade: newMemberData.idade ? parseInt(newMemberData.idade) : null,
                                        genero: newMemberData.genero,
                                        funcoes: newMemberData.funcoes,
                                        status: 'ativo',
                                        familia: currentMember.familia || currentMember.nome,
                                        senha: 'senha123'
                                    };

                                    if (onAddMember) {
                                        await onAddMember(memberToCreate);
                                    }

                                    // Adicionar membro à família existente
                                    if (myFamily) {
                                        setMyFamily({
                                            ...myFamily,
                                            membros: [
                                                ...myFamily.membros,
                                                {
                                                    ...newMemberData,
                                                    isCurrentUser: false
                                                }
                                            ]
                                        });
                                    } else {
                                        // Criar família se não existir
                                        setMyFamily({
                                            nome: currentMember.familia || currentMember.nome,
                                            descricao: '',
                                            membros: [
                                                {
                                                    nome: currentMember.nome,
                                                    funcao: currentMember.funcao || 'Membro',
                                                    isCurrentUser: true
                                                },
                                                {
                                                    ...newMemberData,
                                                    isCurrentUser: false
                                                }
                                            ]
                                        });
                                    }
                                } catch (error) {
                                    console.error('Erro ao adicionar membro:', error);
                                    alert('Erro ao adicionar membro: ' + error.message);
                                    return;
                                }
                                
                                setNewMemberData({
                                    nome: '',
                                    telefone: '',
                                    dataNascimento: '',
                                    idade: '',
                                    genero: '',
                                    funcoes: []
                                });
                                setShowAddMemberModal(false);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newMemberData.nome}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="João Silva"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={newMemberData.telefone}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, telefone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="(11) 98765-4321"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="date"
                                        value={newMemberData.dataNascimento}
                                        onChange={(e) => {
                                            const newBirthDate = e.target.value;
                                            const calculatedAge = calculateAge(newBirthDate);
                                            setNewMemberData({ 
                                                ...newMemberData, 
                                                dataNascimento: newBirthDate,
                                                idade: calculatedAge !== null ? calculatedAge.toString() : ''
                                            });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Idade
                                    </label>
                                    <input
                                        type="number"
                                        value={newMemberData.idade}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, idade: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: 25"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Gênero *
                                    </label>
                                    <select
                                        required
                                        value={newMemberData.genero}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, genero: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Funções * (Selecione uma ou mais)
                                    </label>
                                    <div className="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                        {['Membro', 'Jovem', 'Diaconia', 'Louvor'].map((funcao) => {
                                            const isChecked = newMemberData.funcoes.includes(funcao);
                                            return (
                                                <label key={funcao} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewMemberData({
                                                                        ...newMemberData,
                                                                        funcoes: [...newMemberData.funcoes, funcao]
                                                                    });
                                                                } else {
                                                                    setNewMemberData({
                                                                        ...newMemberData,
                                                                        funcoes: newMemberData.funcoes.filter(f => f !== funcao)
                                                                    });
                                                                }
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
                                                            isChecked 
                                                                ? 'bg-blue-600 border-blue-600' 
                                                                : 'bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-500'
                                                        }`}>
                                                            {isChecked && (
                                                                <X className="w-4 h-4 text-white" strokeWidth={3} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">{funcao}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {newMemberData.funcoes.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">Selecione pelo menos uma função</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddMemberModal(false);
                                            setNewMemberData({
                                                nome: '',
                                                telefone: '',
                                                dataNascimento: '',
                                                idade: '',
                                                genero: '',
                                                funcoes: []
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Adicionar Membro
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Criar Família */}
                {showFamilyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Criar Nova Família</h3>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                
                                try {
                                    // Criar família com o membro atual e membros selecionados
                                    const familyMembers = [
                                        {
                                            id: currentMember.id,
                                            nome: currentMember.nome,
                                            funcao: currentMember.funcao || 'Membro',
                                            funcoes: currentMember.funcoes || [],
                                            idade: currentMember.idade,
                                            isCurrentUser: true
                                        },
                                        ...selectedMembers
                                    ];

                                    // Extrair IDs dos membros
                                    const membrosIds = familyMembers.map(m => m.id).filter(id => id);

                                    // Salvar família no Supabase
                                    const { createFamily } = await import('../lib/supabaseService');
                                    const newFamily = await createFamily({
                                        nome: newFamilyData.nome,
                                        descricao: newFamilyData.descricao || '',
                                        membros_ids: membrosIds
                                    });

                                    console.log('Família criada no Supabase:', newFamily);
                                    
                                    // Atualizar estado local
                                    setMyFamily({
                                        id: newFamily.id,
                                        nome: newFamily.nome,
                                        descricao: newFamily.descricao,
                                        membros: familyMembers
                                    });
                                    
                                    setNewFamilyData({ nome: '', descricao: '' });
                                    setSelectedMembers([]);
                                    setFamilyMemberSearch('');
                                    setShowFamilyModal(false);

                                    alert('Família criada com sucesso!');
                                } catch (error) {
                                    console.error('Erro ao criar família:', error);
                                    alert('Erro ao criar família. Tente novamente.');
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome da Família *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newFamilyData.nome}
                                        onChange={(e) => setNewFamilyData({ ...newFamilyData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: Família Silva"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={newFamilyData.descricao}
                                        onChange={(e) => setNewFamilyData({ ...newFamilyData, descricao: e.target.value })}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Informações adicionais sobre a família..."
                                    />
                                </div>

                                {/* Busca de membros */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                                        <Users className="w-4 h-4 mr-2" />
                                        Buscar Membro para Adicionar ({selectedMembers.length} selecionado{selectedMembers.length !== 1 ? 's' : ''})
                                    </h4>
                                    
                                    <div className="mb-3 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={familyMemberSearch}
                                            onChange={(e) => setFamilyMemberSearch(e.target.value)}
                                            placeholder="Digite o nome do membro..."
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:text-white text-sm"
                                        />
                                    </div>

                                    {/* Membros selecionados */}
                                    {selectedMembers.length > 0 && (
                                        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                                Membros selecionados:
                                            </p>
                                            <div className="space-y-2">
                                                {selectedMembers.map((member, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <span className="text-green-700 dark:text-green-400">{member.nome}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedMembers(prev => prev.filter((_, i) => i !== idx))}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                        {!familyMemberSearch.trim() || familyMemberSearch.trim().length < 2 ? (
                                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                                <p>Digite pelo menos 2 caracteres para buscar</p>
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                <p>Nenhum membro encontrado com "{familyMemberSearch}"</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {searchResults.map((member) => {
                                                    const isSelected = selectedMembers.some(m => m.id === member.id);
                                                    const initials = member.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                                    const idade = calculateAge(member.nascimento);
                                                    const funcao = member.funcoes?.[0] || 'membro';
                                                    
                                                    return (
                                                        <div 
                                                            key={member.id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
                                                                } else {
                                                                    setSelectedMembers(prev => [...prev, member]);
                                                                }
                                                            }}
                                                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 pointer-events-none"
                                                            />
                                                            <div className="ml-3 flex items-center flex-1">
                                                                <div className="h-10 w-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm mr-3">
                                                                    {initials}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {member.nome}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {idade ? `${idade} anos` : 'Idade não informada'} • {funcao}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowFamilyModal(false);
                                            setNewFamilyData({ nome: '', descricao: '' });
                                            setSelectedMembers([]);
                                            setFamilyMemberSearch('');
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                                    >
                                        Criar Família
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Editar Família */}
                {showEditFamilyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editar Família</h3>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                
                                try {
                                    // Atualizar família no Supabase
                                    const { updateFamily } = await import('../lib/supabaseService');
                                    await updateFamily(editFamilyData.id, {
                                        nome: editFamilyData.nome,
                                        descricao: editFamilyData.descricao,
                                        membros_ids: editFamilyData.membrosIds
                                    });

                                    // Atualizar local
                                    setMyFamily({
                                        id: editFamilyData.id,
                                        nome: editFamilyData.nome,
                                        descricao: editFamilyData.descricao,
                                        membros: myFamily.membros
                                    });

                                    setShowEditFamilyModal(false);
                                    alert('Família atualizada com sucesso!');
                                } catch (error) {
                                    console.error('Erro ao atualizar família:', error);
                                    alert('Erro ao atualizar família. Tente novamente.');
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome da Família *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editFamilyData.nome}
                                        onChange={(e) => setEditFamilyData({ ...editFamilyData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: Família Silva"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={editFamilyData.descricao}
                                        onChange={(e) => setEditFamilyData({ ...editFamilyData, descricao: e.target.value })}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Informações adicionais sobre a família..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditFamilyModal(false);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes do Evento */}
                {showEventDetailsModal && renderEventDetails()}
            </div>
        </div>
    );
};

export default MemberApp;
