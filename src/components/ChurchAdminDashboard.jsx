import React, { useState, useMemo } from 'react';
import {
    Menu,
    X,
    Users,
    Calendar,
    Settings,
    BarChart3,
    Filter,
    Search,
    UserPlus,
    CalendarPlus,
    Gift,
    TrendingUp,
    Clock,
    MapPin,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight,
    Grid,
    List,
    Heart,
    Plus,
    Moon,
    Sun,
    Edit,
    Trash2,
    Music,
    Baby,
    Sparkles,
    LogOut
} from 'lucide-react';
import { format, isAfter, isBefore, startOfWeek, endOfWeek, addDays, subDays, differenceInYears, startOfMonth, endOfMonth, isSameMonth, isToday, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChurchAdminDashboard = ({ members = [], events = [], prayerRequests = [], onAddEvent, onAddMember, onEditMember, onDeleteMember, onAddFamily, onEditFamily, onLogout }) => {
    console.log('ChurchAdminDashboard renderizando - members:', members.length, 'events:', events.length)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [genderFilter, setGenderFilter] = useState('all');
    const [ageFilter, setAgeFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [semesterFilter, setSemesterFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [eventView, setEventView] = useState('list'); // 'list' ou 'calendar'
    const [memberView, setMemberView] = useState('individual'); // 'individual' ou 'familias'
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true' || false;
    });
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showPrayerModal, setShowPrayerModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEditMemberModal, setShowEditMemberModal] = useState(false);
    const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [familyMemberSearch, setFamilyMemberSearch] = useState('');
    const [newFamilyData, setNewFamilyData] = useState({
        nome: '',
        descricao: '',
        membrosIds: []
    });
    const [editFamilyData, setEditFamilyData] = useState({
        nome: '',
        descricao: '',
        membrosIds: []
    });
    const [editMemberData, setEditMemberData] = useState({
        nome: '',
        telefone: '',
        nascimento: '',
        idade: '',
        genero: 'masculino',
        funcao: 'membro',
        status: 'ativo',
        familia: ''
    });
    const [newMemberData, setNewMemberData] = useState({
        nome: '',
        telefone: '',
        nascimento: '',
        idade: '',
        genero: 'masculino',
        funcao: 'membro',
        status: 'ativo',
        familia: ''
    });
    const [newEventData, setNewEventData] = useState({
        nome: '',
        data: '',
        local: '',
        descricao: ''
    });
    const [showMusicModal, setShowMusicModal] = useState(false);
    const [newMusicData, setNewMusicData] = useState({
        nome: '',
        artista: '',
        link: ''
    });
    const [playlistMusicas, setPlaylistMusicas] = useState(() => {
        const saved = localStorage.getItem('playlistZoe');
        return saved ? JSON.parse(saved) : [
            { id: 1, nome: 'Bondade de Deus', artista: 'Isaías Saad', link: 'https://www.youtube.com/watch?v=xg7pRPTDkd4' },
            { id: 2, nome: 'Que Se Abram os Céus', artista: 'Gabriela Rocha', link: 'https://www.youtube.com/watch?v=wLU9bPrGdL8' },
            { id: 3, nome: 'Reckless Love', artista: 'Thalles Roberto', link: 'https://www.youtube.com/watch?v=Sc6SSHuZvQE' },
            { id: 4, nome: 'Há Poder', artista: 'Gabriela Rocha', link: 'https://www.youtube.com/watch?v=x57zvpAy4B4' },
            { id: 5, nome: 'O Céu Vai Reagir', artista: 'Sarah Farias', link: 'https://www.youtube.com/watch?v=bSZxeLnyiaU' }
        ];
    });
    const [showEscalaModal, setShowEscalaModal] = useState(false);
    const [newEscalaData, setNewEscalaData] = useState({
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '19:00',
        diaconosSelecionados: []
    });
    const [escalas, setEscalas] = useState(() => {
        const saved = localStorage.getItem('escalaDiaconia');
        return saved ? JSON.parse(saved) : [];
    });
    const [showMusicosModal, setShowMusicosModal] = useState(false);
    const [showEscalaLouvorModal, setShowEscalaLouvorModal] = useState(false);
    const [newEscalaLouvorData, setNewEscalaLouvorData] = useState({
        tipo: 'culto',
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '19:00',
        instrumentos: {}
    });
    const [escalasLouvor, setEscalasLouvor] = useState(() => {
        const saved = localStorage.getItem('escalaLouvor');
        return saved ? JSON.parse(saved) : [];
    });
    const [showMusicasCadastradasModal, setShowMusicasCadastradasModal] = useState(false);

    // Aplicar tema escuro ao DOM
    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Handlers para modais
    const handleAddMember = () => {
        setNewMemberData({
            nome: '',
            telefone: '',
            nascimento: '',
            idade: '',
            genero: 'masculino',
            funcao: 'membro',
            status: 'ativo',
            familia: ''
        });
        setShowMemberModal(true);
    };

    const handleAddEvent = (date = null) => {
        console.log('handleAddEvent chamado');
        setSelectedDate(date);
        const formattedDate = date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';
        setNewEventData({
            nome: '',
            data: formattedDate,
            local: '',
            descricao: ''
        });
        setShowEventModal(true);
    };

    const handleAddPrayer = () => {
        setShowPrayerModal(true);
    };

    const handleAddFamily = () => {
        setNewFamilyData({
            nome: '',
            descricao: '',
            membrosIds: []
        });
        setFamilyMemberSearch('');
        setShowFamilyModal(true);
    };

    const toggleMemberInFamily = (memberId) => {
        setNewFamilyData(prev => {
            const isSelected = prev.membrosIds.includes(memberId);
            return {
                ...prev,
                membrosIds: isSelected 
                    ? prev.membrosIds.filter(id => id !== memberId)
                    : [...prev.membrosIds, memberId]
            };
        });
    };

    const toggleMemberInEditFamily = (memberId) => {
        setEditFamilyData(prev => {
            const isSelected = prev.membrosIds.includes(memberId);
            return {
                ...prev,
                membrosIds: isSelected 
                    ? prev.membrosIds.filter(id => id !== memberId)
                    : [...prev.membrosIds, memberId]
            };
        });
    };

    const handleEditFamily = (family) => {
        setSelectedFamily(family);
        const memberIds = family.membros.map(m => m.id);
        setEditFamilyData({
            nome: family.nome || '',
            descricao: family.descricao || '',
            membrosIds: memberIds
        });
        setFamilyMemberSearch('');
        setShowEditFamilyModal(true);
    };

    const handleCalendarDayClick = (date) => {
        handleAddEvent(date);
    };

    const handleEditMember = (member) => {
        setSelectedMember(member);
        setEditMemberData({
            nome: member.nome || '',
            telefone: member.telefone || '',
            nascimento: member.nascimento || '',
            idade: member.idade || '',
            genero: member.genero || 'masculino',
            funcao: member.funcao || 'membro',
            status: member.status || 'ativo',
            familia: member.familia || ''
        });
        setShowEditMemberModal(true);
    };

    const handleDeleteMember = (member) => {
        setSelectedMember(member);
        setShowDeleteMemberModal(true);
    };

    const confirmEditMember = () => {
        if (onEditMember && selectedMember) {
            onEditMember(selectedMember, editMemberData);
        }
        setShowEditMemberModal(false);
        setSelectedMember(null);
    };

    const confirmDeleteMember = () => {
        if (onDeleteMember && selectedMember) {
            onDeleteMember(selectedMember);
        }
        setShowDeleteMemberModal(false);
        setSelectedMember(null);
    };

    // Funções/cargos disponíveis
    const availableRoles = [
        'membro',
        'pastor',
        'lider da diaconia',
        'líder de louvor',
        'lider kids',
        'lider jovens',
        'louvor',
        'diaconia',
        'professor kids',
        
    ];

    // Função para parsear datas de eventos
    const parseEventDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) {
            return isValid(value) ? value : null;
        }
        let d = new Date(value);
        if (isValid(d)) return d;
        d = parseISO(String(value));
        if (isValid(d)) return d;
        return null;
    };

    // Função para calcular idade
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        try {
            const birth = parseISO(birthDate);
            return differenceInYears(new Date(), birth);
        } catch {
            return null;
        }
    };

    // Função para obter iniciais
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Função para gerar ID do membro
    const generateMemberId = (member, index) => {
        if (member.id) return member.id;
        return `MBR${String(index + 1).padStart(4, '0')}`;
    };

    // Filtros de membros
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const age = calculateAge(member.nascimento);

            // Filtro de busca
            if (searchTerm && !member.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Filtro de gênero
            if (genderFilter !== 'all' && member.genero !== genderFilter) {
                return false;
            }

            // Filtro de função
            if (roleFilter !== 'all' && (member.funcao || 'membro') !== roleFilter) {
                return false;
            }

            // Filtro de idade
            if (ageFilter !== 'all' && age !== null) {
                if (ageFilter === '0-12' && (age < 0 || age > 12)) return false;
                if (ageFilter === '13-18' && (age < 13 || age > 18)) return false;
                if (ageFilter === '19-30' && (age < 19 || age > 30)) return false;
                if (ageFilter === '31-50' && (age < 31 || age > 50)) return false;
                if (ageFilter === '51+' && age < 51) return false;
            }

            return true;
        });
    }, [members, genderFilter, ageFilter, roleFilter, searchTerm]);

    // Estatísticas dos membros
    const memberStats = useMemo(() => {
        const total = filteredMembers.length;
        const byGender = {
            masculino: filteredMembers.filter(m => m.genero === 'masculino').length,
            feminino: filteredMembers.filter(m => m.genero === 'feminino').length,
            outro: filteredMembers.filter(m => m.genero === 'outro').length
        };

        // Dados para o gráfico de barras agrupadas
        const chartData = [
            {
                faixaEtaria: '0-12',
                feminino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age <= 12 && m.genero === 'feminino';
                }).length,
                masculino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age <= 12 && m.genero === 'masculino';
                }).length
            },
            {
                faixaEtaria: '13-18',
                feminino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 13 && age <= 18 && m.genero === 'feminino';
                }).length,
                masculino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 13 && age <= 18 && m.genero === 'masculino';
                }).length
            },
            {
                faixaEtaria: '19-30',
                feminino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 19 && age <= 30 && m.genero === 'feminino';
                }).length,
                masculino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 19 && age <= 30 && m.genero === 'masculino';
                }).length
            },
            {
                faixaEtaria: '31-50',
                feminino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 31 && age <= 50 && m.genero === 'feminino';
                }).length,
                masculino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 31 && age <= 50 && m.genero === 'masculino';
                }).length
            },
            {
                faixaEtaria: '51+',
                feminino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 51 && m.genero === 'feminino';
                }).length,
                masculino: filteredMembers.filter(m => {
                    const age = calculateAge(m.nascimento);
                    return age !== null && age >= 51 && m.genero === 'masculino';
                }).length
            }
        ];

        return { total, byGender, chartData };
    }, [filteredMembers]);

    // Agrupar membros por família
    const familyGroups = useMemo(() => {
        const groups = {};
        
        console.log('Calculando familyGroups com members:', members);
        
        // Usar members ao invés de filteredMembers para garantir que todos os membros com família sejam considerados
        members.forEach(member => {
            console.log('Membro:', member.nome, 'Familia:', member.familia);
            if (!member.familia || member.familia.trim() === '') return;
            const familyName = member.familia.trim();
            if (!groups[familyName]) {
                groups[familyName] = [];
            }
            groups[familyName].push(member);
        });

        const result = Object.entries(groups).map(([familyName, members]) => ({
            nome: familyName,
            membros: members,
            totalMembros: members.length
        })).sort((a, b) => b.totalMembros - a.totalMembros);
        
        console.log('familyGroups resultado:', result);
        
        return result;
    }, [members]);

    // Filtros de eventos
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const eventDate = new Date(event.data);
            const eventYear = eventDate.getFullYear();

            if (yearFilter && eventYear !== parseInt(yearFilter)) {
                return false;
            }

            if (semesterFilter !== 'all') {
                const month = eventDate.getMonth() + 1;
                if (semesterFilter === '1' && (month < 1 || month > 6)) {
                    return false;
                }
                if (semesterFilter === '2' && (month < 7 || month > 12)) {
                    return false;
                }
            }

            return true;
        });
    }, [events, yearFilter, semesterFilter]);

    // Eventos futuros e passados
    const { futureEvents, pastEvents } = useMemo(() => {
        const now = new Date();
        const future = filteredEvents
            .filter(event => isAfter(new Date(event.data), now))
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 5);
        const past = filteredEvents
            .filter(event => isBefore(new Date(event.data), now))
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        return { futureEvents: future, pastEvents: past };
    }, [filteredEvents]);

    // Pedidos de oração
    const prayerStats = useMemo(() => {
        const now = new Date();
        const active = prayerRequests.filter(prayer => prayer.status === 'ativo').length;
        const answered = prayerRequests.filter(prayer => prayer.status === 'atendido').length;
        const thisMonth = prayerRequests.filter(prayer => {
            const requestDate = new Date(prayer.dataRequest);
            return requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear();
        }).length;

        return { total: prayerRequests.length, active, answered, thisMonth };
    }, [prayerRequests]);

    // Aniversariantes
    const birthdays = useMemo(() => {
        const today = new Date();
        const weekAgo = subDays(today, 7);
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);

        const thisMonth = [];
        const recentPast = [];

        members.forEach(member => {
            if (!member.nascimento) return;

            try {
                const birthDate = parseISO(member.nascimento);
                const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

                if (thisYearBirthday >= monthStart && thisYearBirthday <= monthEnd) {
                    thisMonth.push({ ...member, birthdayThisYear: thisYearBirthday });
                }

                if (thisYearBirthday >= weekAgo && thisYearBirthday < today) {
                    recentPast.push({ ...member, birthdayThisYear: thisYearBirthday });
                }
            } catch (error) {
                console.warn('Data de nascimento inválida:', member.nascimento);
            }
        });

        return {
            thisMonth: thisMonth.sort((a, b) => a.birthdayThisYear - b.birthdayThisYear),
            recentPast: recentPast.sort((a, b) => b.birthdayThisYear - a.birthdayThisYear)
        };
    }, [members]);

    // Calendar helpers
    const getCalendarDays = () => {
        const currentDate = isValid(calendarDate) ? calendarDate : new Date();
        const startDate = startOfWeek(startOfMonth(currentDate));
        const endDate = endOfWeek(endOfMonth(currentDate));
        const days = [];
        let current = startDate;

        while (current <= endDate) {
            days.push(new Date(current));
            current = addDays(current, 1);
        }

        return days;
    };

    const getEventsForDate = (date) => {
        return filteredEvents
            .map(event => {
                const d = parseEventDate(event.data);
                return d ? { event, d } : null;
            })
            .filter(x => x && format(x.d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
            .map(x => x.event);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'members', label: 'Membros', icon: Users },
        { id: 'events', label: 'Eventos', icon: Calendar },
        { id: 'prayers', label: 'Pedidos de Oração', icon: Heart },
        { id: 'birthdays', label: 'Aniversários', icon: Gift },
        { id: 'diaconia', label: 'Diaconia', icon: Heart },
        { id: 'louvor', label: 'Louvor', icon: Music },
        { id: 'playlistzoe', label: 'Playlist Zoe', icon: Music },
        { id: 'kids', label: 'Kids', icon: Baby },
        { id: 'jovens', label: 'Jovens', icon: Sparkles },
        { id: 'settings', label: 'Configurações', icon: Settings }
    ];

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <img src="https://res.cloudinary.com/dxchbdcai/image/upload/v1759588261/Captura_de_Tela_2025-10-04_%C3%A0s_11.30.40_ydns5v.png" alt="Logo da Igreja" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Igreja Zoe</h1>
            </div>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button
                        onClick={handleAddMember}
                        className="flex items-center justify-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span className="text-sm md:text-base">Novo Membro</span>
                    </button>
                    <button
                        onClick={() => handleAddEvent()}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        <span className="text-sm md:text-base">Novo Evento</span>
                    </button>
                </div>
            </div>

            {/* Estatísticas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    onClick={() => setActiveTab('members')}
                    className="stats-card cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 dark:text-gray-600">Total de Membros</p>
                            <p className="text-3xl font-bold">{memberStats.total}</p>
                        </div>
                        <Users className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('events')}
                    className="stats-card cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 dark:text-gray-600">Eventos Futuros</p>
                            <p className="text-3xl font-bold">{futureEvents.length}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('prayers')}
                    className="stats-card cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 dark:text-gray-600">Pedidos Ativos</p>
                            <p className="text-3xl font-bold">{prayerStats.active}</p>
                        </div>
                        <Heart className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('birthdays')}
                    className="stats-card cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 dark:text-gray-600">Aniversários do Mês</p>
                            <p className="text-3xl font-bold">{birthdays.thisMonth.length}</p>
                        </div>
                        <Gift className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filtros de Estatísticas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Gênero</label>
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todos</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Faixa Etária</label>
                        <select
                            value={ageFilter}
                            onChange={(e) => setAgeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todas</option>
                            <option value="0-12">0-12 anos</option>
                            <option value="13-18">13-18 anos</option>
                            <option value="19-30">19-30 anos</option>
                            <option value="31-50">31-50 anos</option>
                            <option value="51+">51+ anos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Função</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todas</option>
                            {availableRoles.map(role => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Buscar Membro</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nome do membro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de barras agrupadas */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribuição por Faixa Etária e Gênero</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={memberStats.chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="faixaEtaria"
                                tick={{ fontSize: 12 }}
                                tickLine={{ stroke: '#6B7280' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={{ stroke: '#6B7280' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="feminino"
                                fill="#EC4899"
                                name="Feminino"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar
                                dataKey="masculino"
                                fill="#3B82F6"
                                name="Masculino"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderMembers = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Membros</h1>
                <div className="flex gap-2">
                    {memberView === 'familias' && (
                        <button
                            onClick={handleAddFamily}
                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="text-sm md:text-base">Criar Família</span>
                        </button>
                    )}
                    <button
                        onClick={handleAddMember}
                        className="flex items-center justify-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span className="text-sm md:text-base">Adicionar Membro</span>
                    </button>
                </div>
            </div>

            {/* Tabs para alternar entre membros e famílias */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setMemberView('individual')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        memberView === 'individual'
                            ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <Users className="w-4 h-4 inline mr-2" />
                    Individual
                </button>
                <button
                    onClick={() => setMemberView('familias')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        memberView === 'familias'
                            ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <Users className="w-4 h-4 inline mr-2" />
                    Famílias
                </button>
            </div>

            {(() => {
                console.log('memberView:', memberView);
                console.log('familyGroups:', familyGroups);
                return null;
            })()}
            
            {memberView === 'individual' ? (
                filteredMembers.length === 0 ? (
                    <div className="card text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhum membro encontrado com os filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMembers.map((member, index) => {
                        const age = calculateAge(member.nascimento);
                        const initials = getInitials(member.nome);
                        const memberId = generateMemberId(member, index);

                        return (
                            <div key={memberId} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-14 w-14 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-xl">
                                            {initials}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-base md:text-lg">{member.nome}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{memberId}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${member.status === 'ativo'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                                        }`}>
                                        {member.status || 'ativo'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Função:</span>
                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                            age !== null && age <= 12 ? 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200' :
                                            (member.funcao || 'membro') === 'pastor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' :
                                                (member.funcao || 'membro') === 'diácono' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                                                    (member.funcao || 'membro') === 'líder de louvor' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                                        (member.funcao || 'membro') === 'músico' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                            {age !== null && age <= 12 ? 'Criança' : (member.funcao || 'membro').charAt(0).toUpperCase() + (member.funcao || 'membro').slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Gênero:</span>
                                        <span className="text-gray-900 dark:text-white capitalize text-sm font-medium">{member.genero || 'N/A'}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Idade:</span>
                                        <span className="text-gray-900 dark:text-white text-sm font-medium">{age ? `${age} anos` : 'N/A'}</span>
                                    </div>

                                    {member.telefone && (
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Telefone:</span>
                                            </div>
                                            <span className="text-gray-900 dark:text-white text-sm font-medium">{member.telefone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => handleEditMember(member)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span className="text-sm">Editar</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMember(member)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-sm">Deletar</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )
            ) : (
                // Visualização de Famílias
                familyGroups.length === 0 ? (
                    <div className="card text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma família encontrada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {familyGroups.map((family, index) => (
                            <div key={index} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white dark:text-gray-900" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">
                                                {family.nome}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {family.totalMembros} {family.totalMembros === 1 ? 'membro' : 'membros'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEditFamily(family)}
                                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        title="Editar Família"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {family.membros.map((member, memberIndex) => {
                                        const age = calculateAge(member.nascimento);
                                        const initials = getInitials(member.nome);
                                        
                                        return (
                                            <div key={memberIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {member.nome}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <span className="capitalize">{member.genero}</span>
                                                            {age && <span>• {age} anos</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        age !== null && age <= 12 ? 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200' :
                                                        (member.funcao || 'membro') === 'pastor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' :
                                                            (member.funcao || 'membro') === 'diácono' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                                                                (member.funcao || 'membro') === 'líder de louvor' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                                                    (member.funcao || 'membro') === 'músico' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}>
                                                        {age !== null && age <= 12 ? 'Criança' : (member.funcao || 'membro').charAt(0).toUpperCase() + (member.funcao || 'membro').slice(1)}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditMember(member)}
                                                            className="p-1.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center justify-center"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMember(member)}
                                                            className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center"
                                                            title="Deletar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );

    const renderCalendar = () => {
        try {
            const currentDate = isValid(calendarDate) ? calendarDate : new Date();
            const calendarDays = getCalendarDays();
            const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

            return (
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    const newDate = addDays(currentDate, -30);
                                    setCalendarDate(newDate);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    const newDate = addDays(currentDate, 30);
                                    setCalendarDate(newDate);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="calendar-grid">
                        {daysOfWeek.map(day => (
                            <div key={day} className="bg-gray-100 dark:bg-gray-700 p-2 text-center font-semibold text-sm text-gray-900 dark:text-white">
                                {day}
                            </div>
                        ))}

                        {calendarDays.map((day, index) => {
                            const dayEvents = getEventsForDate(day);
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={`${day.toISOString()}-${index}`}
                                    onClick={() => handleCalendarDayClick(day)}
                                    className={`calendar-day cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
                                >
                                    <div className="font-medium mb-1">
                                        {format(day, 'd')}
                                    </div>
                                    {dayEvents.map((event, idx) => (
                                        <div key={`${event.id}-${idx}`} className="calendar-event text-xs" title={event.nome}>
                                            {event.nome}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        } catch (error) {
            console.error('Erro ao renderizar calendário:', error);
            return (
                <div className="card">
                    <p className="text-red-600 dark:text-red-400">Erro ao carregar calendário: {error.message}</p>
                </div>
            );
        }
    };

    const renderEvents = () => (
        <div className="space-y-6">
            <div className="flex flex-col gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Eventos</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => handleAddEvent()}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        <span className="text-sm">Novo Evento</span>
                    </button>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setEventView('list')}
                            className={`flex items-center px-3 py-2 rounded-md text-sm transition-all ${eventView === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            <List className="w-4 h-4 mr-1" />
                            Lista
                        </button>
                        <button
                            onClick={() => setEventView('calendar')}
                            className={`flex items-center px-3 py-2 rounded-md text-sm transition-all ${eventView === 'calendar' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            <Grid className="w-4 h-4 mr-1" />
                            Calendário
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros de eventos */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filtros de Eventos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ano</label>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {[2023, 2024, 2025].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Semestre</label>
                        <select
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todos</option>
                            <option value="1">1º Semestre (Jan-Jun)</option>
                            <option value="2">2º Semestre (Jul-Dez)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Total de Eventos</label>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEvents.length}</div>
                    </div>
                </div>
            </div>

            {eventView === 'calendar' ? renderCalendar() : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Próximos eventos */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-green-600" />
                            Próximos Eventos (5)
                        </h3>
                        <div className="space-y-3">
                            {futureEvents.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">Nenhum evento futuro agendado.</p>
                            ) : (
                                futureEvents.map(event => (
                                    <div key={event.id} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                                        <h4 className="font-semibold text-green-800">{event.nome}</h4>
                                        <p className="text-sm text-green-600 flex items-center mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {format(new Date(event.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        </p>
                                        {event.local && (
                                            <p className="text-sm text-green-600 flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {event.local}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Eventos passados */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-gray-600" />
                            Eventos Passados (5)
                        </h3>
                        <div className="space-y-3">
                            {pastEvents.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">Nenhum evento passado registrado.</p>
                            ) : (
                                pastEvents.map(event => (
                                    <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-gray-400">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">{event.nome}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {format(new Date(event.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        </p>
                                        {event.local && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {event.local}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderBirthdays = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aniversários</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Aniversários do mês */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Gift className="w-5 h-5 mr-2 text-blue-600" />
                        Aniversários do Mês ({birthdays.thisMonth.length})
                    </h3>
                    <div className="space-y-3">
                        {birthdays.thisMonth.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">Nenhum aniversário este mês.</p>
                        ) : (
                            birthdays.thisMonth.map(member => (
                                <div key={member.id || member.nome} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                                {getInitials(member.nome)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-blue-800">{member.nome}</h4>
                                                <p className="text-sm text-blue-600">
                                                    {format(member.birthdayThisYear, 'dd/MM', { locale: ptBR })}
                                                    {calculateAge(member.nascimento) && ` - ${calculateAge(member.nascimento)} anos`}
                                                </p>
                                            </div>
                                        </div>
                                        {isToday(member.birthdayThisYear) && (
                                            <span className="bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                                                HOJE!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Aniversários passados (última semana) */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-600" />
                        Aniversários Recentes - Última Semana ({birthdays.recentPast.length})
                    </h3>
                    <div className="space-y-3">
                        {birthdays.recentPast.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">Nenhum aniversário na última semana.</p>
                        ) : (
                            birthdays.recentPast.map(member => (
                                <div key={member.id || member.nome} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-gray-400">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                            {getInitials(member.nome)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">{member.nome}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {format(member.birthdayThisYear, 'dd/MM', { locale: ptBR })}
                                                {calculateAge(member.nascimento) && ` - ${calculateAge(member.nascimento)} anos`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPrayerRequests = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos de Oração</h1>
                <button
                    onClick={handleAddPrayer}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pedido
                </button>
            </div>

            {/* Estatísticas dos pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100">Total de Pedidos</p>
                            <p className="text-3xl font-bold">{prayerStats.total}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-200" />
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100">Ativos</p>
                            <p className="text-3xl font-bold">{prayerStats.active}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-200" />
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100">Atendidos</p>
                            <p className="text-3xl font-bold">{prayerStats.answered}</p>
                        </div>
                        <Gift className="w-8 h-8 text-green-200" />
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100">Este Mês</p>
                            <p className="text-3xl font-bold">{prayerStats.thisMonth}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-200" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pedidos Ativos */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-red-600" />
                        Pedidos Ativos ({prayerRequests.filter(p => p.status === 'ativo').length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {prayerRequests.filter(prayer => prayer.status === 'ativo').length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">Nenhum pedido ativo.</p>
                        ) : (
                            prayerRequests.filter(prayer => prayer.status === 'ativo').map(prayer => (
                                <div key={prayer.id} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-red-800">{prayer.titulo}</h4>
                                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                            {prayer.categoria}
                                        </span>
                                    </div>
                                    <p className="text-sm text-red-700 mb-2">{prayer.descricao}</p>
                                    <div className="flex justify-between items-center text-xs text-red-600">
                                        <span>Por: {prayer.solicitante}</span>
                                        <span>{format(new Date(prayer.dataRequest), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pedidos Atendidos */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Gift className="w-5 h-5 mr-2 text-green-600" />
                        Pedidos Atendidos ({prayerRequests.filter(p => p.status === 'atendido').length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {prayerRequests.filter(prayer => prayer.status === 'atendido').length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">Nenhum pedido atendido.</p>
                        ) : (
                            prayerRequests.filter(prayer => prayer.status === 'atendido').map(prayer => (
                                <div key={prayer.id} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-green-800">{prayer.titulo}</h4>
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            {prayer.categoria}
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-700 mb-2">{prayer.descricao}</p>
                                    <div className="flex justify-between items-center text-xs text-green-600">
                                        <span>Por: {prayer.solicitante}</span>
                                        <div className="flex space-x-2">
                                            <span>Pedido: {format(new Date(prayer.dataRequest), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                            {prayer.dataResposta && (
                                                <span>• Atendido: {format(new Date(prayer.dataResposta), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>

            {/* Configurações de Aparência */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Aparência</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tema</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Escolha entre o tema claro ou escuro</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`text-sm ${!darkMode ? 'text-gray-900 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                Claro
                            </span>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${darkMode ? 'bg-white translate-x-6' : 'bg-gray-900 translate-x-1'
                                        }`}
                                />
                            </button>
                            <span className={`text-sm ${darkMode ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                Escuro
                            </span>
                        </div>

                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sair</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Outras Configurações */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sistema</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Notificações</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações sobre eventos e aniversários</p>
                        </div>
                        <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                            disabled
                        >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Backup Automático</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Fazer backup dos dados automaticamente</p>
                        </div>
                        <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                            disabled
                        >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Informações do Sistema */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sobre o Sistema</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Versão:</span>
                        <span className="text-gray-900 dark:text-white">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Última atualização:</span>
                        <span className="text-gray-900 dark:text-white">Janeiro 2024</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                        <span className="text-gray-900 dark:text-white">Progressive Web App (PWA)</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDiaconia = () => {
    const necessitados = members.filter(m => m.status === 'necessitado' || m.observacoes?.toLowerCase().includes('ajuda'));
    const diaconos = members.filter(m => m.funcao === 'diácono' || m.funcao === 'diaconia' || m.funcao === 'líder da diaconia');
    
    return (
    <div className="space-y-6">
    <div className="flex justify-between items-center">
    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white"> Diaconia</h1>
    <button 
        onClick={() => {
            setNewEscalaData({
                data: format(new Date(), 'yyyy-MM-dd'),
                horario: '19:00',
                diaconosSelecionados: []
            });
            setShowEscalaModal(true);
        }}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
    <Plus className="w-4 h-4 mr-2" />
Montar escala        </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
        <div className="flex items-center justify-between">
            <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Diáconos</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{diaconos.length}</p>
    </div>
        <Users className="w-8 h-8 text-purple-500" />
        </div>
    </div>

    </div>

    <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                        Lista de Diáconos ({diaconos.length})
                    </h3>
                    {diaconos.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Nenhum diácono cadastrado no momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {diaconos.map((diacono, index) => {
                                const age = calculateAge(diacono.nascimento);
                                const initials = getInitials(diacono.nome);
                                
                                return (
                                    <div key={diacono.id || index} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white font-semibold">
                                                {initials}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{diacono.nome}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {diacono.telefone || 'Sem telefone'}
                                                </p>
                                                {age && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        {age} anos
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Escalas Criadas ({escalas.length})
                    </h3>
                    {escalas.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma escala criada ainda.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Clique em "Montar escala" para criar a primeira.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {escalas.sort((a, b) => new Date(a.data) - new Date(b.data)).map((escala, index) => {
                                const dataEscala = parseISO(escala.data);
                                const isProxima = index === 0;
                                const dataFormatada = format(dataEscala, "EEEE - dd/MM/yyyy", { locale: ptBR });
                                
                                return (
                                    <div 
                                        key={escala.id} 
                                        className={`p-4 border-l-4 rounded-lg ${
                                            isProxima 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-gray-400 bg-gray-50 dark:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <p className={`font-semibold capitalize ${
                                                isProxima ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-300'
                                            }`}>
                                                {dataFormatada}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                    isProxima ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                                                }`}>
                                                    {escala.horario}
                                                </span>
                                                {isProxima && (
                                                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Próximo</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <Users className={`w-4 h-4 mt-0.5 ${
                                                    isProxima ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                                                }`} />
                                                <div className="flex-1">
                                                    <span className={`font-medium text-sm ${
                                                        isProxima ? 'text-blue-800 dark:text-blue-400' : 'text-gray-700 dark:text-gray-400'
                                                    }`}>
                                                        Diáconos escalados:
                                                    </span>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {escala.diaconos.map((diacono, dIndex) => (
                                                            <span 
                                                                key={dIndex}
                                                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                                                    isProxima 
                                                                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
                                                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                                }`}
                                                            >
                                                                <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                                                                    {getInitials(diacono.nome)}
                                                                </div>
                                                                {diacono.nome}
                                                            </span>
                                                        ))}
                                                    </div>
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
        );
    };

    const renderLouvor = () => {
        const musicos = members.filter(m => m.funcao === 'músico' || m.funcao === 'líder de louvor' || m.funcao === 'louvor');
        
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Louvor</h1>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setNewEscalaLouvorData({
                                    tipo: 'culto',
                                    data: format(new Date(), 'yyyy-MM-dd'),
                                    horario: '19:00',
                                    instrumentos: {}
                                });
                                setShowEscalaLouvorModal(true);
                            }}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Escala
                        </button>
                        <button 
                            onClick={() => setShowMusicModal(true)}
                            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Música
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                        className="card cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setShowMusicosModal(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Músicos Ativos</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{musicos.length}</p>
                            </div>
                            <Music className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    
                    <div 
                        className="card cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setShowMusicasCadastradasModal(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Músicas Cadastradas</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{playlistMusicas.length}</p>
                            </div>
                            <Music className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Próxima Escala de Louvor</h3>
                    {(() => {
                        const now = new Date();
                        const proximaEscala = escalasLouvor
                            .filter(e => new Date(`${e.data}T${e.horario}`) >= now)
                            .sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`))
                            [0];

                        if (!proximaEscala) {
                            return (
                                <div className="text-center py-8">
                                    <Music className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma escala cadastrada</p>
                                    <button
                                        onClick={() => setShowEscalaLouvorModal(true)}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
                                    >
                                        <CalendarPlus className="w-4 h-4" />
                                        Montar Escala
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {proximaEscala.tipo === 'culto' ? 'Culto' : 'Ensaio'} - {format(parseISO(proximaEscala.data), "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                                                <Clock className="w-5 h-5" />
                                                {proximaEscala.horario}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Músicos Escalados ({proximaEscala.musicos.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {proximaEscala.musicos.map((musico, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                                        {getInitials(musico.nome)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{musico.nome}</span>
                                                </div>
                                                {musico.instrumento && (
                                                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                                                        {musico.instrumento}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowEscalaLouvorModal(true)}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center justify-center gap-2"
                                >
                                    <CalendarPlus className="w-4 h-4" />
                                    Nova Escala
                                </button>
                            </div>
                        );
                    })()}
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Equipe de Louvor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {musicos.length === 0 ? (
                            <div className="col-span-2 text-center py-8">
                                <Music className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">Nenhum músico cadastrado ainda.</p>
                            </div>
                        ) : (
                            musicos.map(musico => (
                                <div key={musico.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <Music className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">{musico.nome}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{musico.funcao}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderKids = () => {
        const criancas = members.filter(m => {
            const age = calculateAge(m.nascimento);
            return age !== null && age <= 12;
        });
        
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Ministério Infantil</h1>
                    <button className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Atividade
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Crianças</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{criancas.length}</p>
                            </div>
                            <Baby className="w-8 h-8 text-pink-500" />
                        </div>
                    </div>
                    
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Professores</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Próxima Aula</h3>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Domingo, 09:00</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">Tema: O Amor de Deus</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">História: O Bom Samaritano</p>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Crianças por Faixa Etária</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Baby className="w-5 h-5 text-yellow-600" />
                                <span className="text-gray-900 dark:text-white">0-3 anos</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {criancas.filter(c => calculateAge(c.nascimento) <= 3).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Baby className="w-5 h-5 text-orange-600" />
                                <span className="text-gray-900 dark:text-white">4-7 anos</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {criancas.filter(c => {
                                    const age = calculateAge(c.nascimento);
                                    return age >= 4 && age <= 7;
                                }).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Baby className="w-5 h-5 text-pink-600" />
                                <span className="text-gray-900 dark:text-white">8-12 anos</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {criancas.filter(c => {
                                    const age = calculateAge(c.nascimento);
                                    return age >= 8 && age <= 12;
                                }).length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Próximas Atividades</h3>
                    <div className="space-y-3">
                        <div className="p-3 border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-900/20 rounded">
                            <p className="font-medium text-pink-900 dark:text-pink-300">Pic-nic das Crianças</p>
                            <p className="text-sm text-pink-700 dark:text-pink-400">Sábado, 15:00 - Parque da Igreja</p>
                        </div>
                        <div className="p-3 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded">
                            <p className="font-medium text-purple-900 dark:text-purple-300">Apresentação Dia das Crianças</p>
                            <p className="text-sm text-purple-700 dark:text-purple-400">12/10 - Ensaio na Quarta às 19h</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderJovens = () => {
        const jovens = members.filter(m => {
            const age = calculateAge(m.nascimento);
            return age !== null && age >= 13 && age <= 30;
        });
        
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Ministério de Jovens</h1>
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Evento
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Jovens</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jovens.length}</p>
                            </div>
                            <Sparkles className="w-8 h-8 text-indigo-500" />
                        </div>
                    </div>
                    
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Líderes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Encontros (Mês)</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                            </div>
                            <Calendar className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Próximo Encontro</h3>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sexta-feira, 19:30</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">Tema: Propósito e Identidade</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Palestrante: Pastor João Silva</p>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Jovens por Faixa Etária</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-900 dark:text-white">13-18 anos (Adolescentes)</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {jovens.filter(j => {
                                    const age = calculateAge(j.nascimento);
                                    return age >= 13 && age <= 18;
                                }).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <span className="text-gray-900 dark:text-white">19-25 anos (Jovens)</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {jovens.filter(j => {
                                    const age = calculateAge(j.nascimento);
                                    return age >= 19 && age <= 25;
                                }).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <span className="text-gray-900 dark:text-white">26-30 anos (Jovens Adultos)</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {jovens.filter(j => {
                                    const age = calculateAge(j.nascimento);
                                    return age >= 26 && age <= 30;
                                }).length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Próximos Eventos</h3>
                    <div className="space-y-3">
                        <div className="p-3 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                            <p className="font-medium text-indigo-900 dark:text-indigo-300">Acampamento de Jovens</p>
                            <p className="text-sm text-indigo-700 dark:text-indigo-400">15-17 de Março - Chácara Bethel</p>
                        </div>
                        <div className="p-3 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded">
                            <p className="font-medium text-purple-900 dark:text-purple-300">Conferência de Jovens 2024</p>
                            <p className="text-sm text-purple-700 dark:text-purple-400">10-12 de Maio - Centro de Convenções</p>
                        </div>
                        <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <p className="font-medium text-blue-900 dark:text-blue-300">Ação Social - Dia dos Jovens</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">Sábado, 08:00 - Comunidade São José</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleAddMusic = () => {
        setNewMusicData({ nome: '', artista: '', link: '' });
        setShowMusicModal(true);
    };

    const handleSubmitMusic = (e) => {
        e.preventDefault();
        const newMusic = {
            id: Date.now(),
            nome: newMusicData.nome,
            artista: newMusicData.artista,
            link: newMusicData.link
        };
        const updatedPlaylist = [...playlistMusicas, newMusic];
        setPlaylistMusicas(updatedPlaylist);
        localStorage.setItem('playlistZoe', JSON.stringify(updatedPlaylist));
        setShowMusicModal(false);
        setNewMusicData({ nome: '', artista: '', link: '' });
    };

    const handleDeleteMusic = (id) => {
        const updatedPlaylist = playlistMusicas.filter(m => m.id !== id);
        setPlaylistMusicas(updatedPlaylist);
        localStorage.setItem('playlistZoe', JSON.stringify(updatedPlaylist));
    };

    const renderPlaylistZoe = () => {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Playlist Zoe</h1>
                    <button 
                        onClick={handleAddMusic}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Música
                    </button>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <Music className="w-5 h-5 mr-2 text-red-600" />
                        O que estamos cantando ({playlistMusicas.length})
                    </h3>
                    <div className="space-y-3">
                        {playlistMusicas.length === 0 ? (
                            <div className="text-center py-8">
                                <Music className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">Nenhuma música adicionada ainda.</p>
                            </div>
                        ) : (
                            playlistMusicas.map((musica) => (
                                <div key={musica.id} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{musica.nome}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{musica.artista}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={musica.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
                                            >
                                                <Music className="w-4 h-4" />
                                                Ouvir
                                            </a>
                                            <button
                                                onClick={() => handleDeleteMusic(musica.id)}
                                                className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Estatísticas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Músicas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{playlistMusicas.length}</p>
                        </div>
                       
                        <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Última Atualização</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">Hoje</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                        <Music className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sobre a Playlist Zoe</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Esta playlist contém as músicas mais tocadas nos cultos e encontros da Igreja Zoe. 
                                Utilize os links para ouvir e ensaiar as músicas durante a semana.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Sidebar Desktop */}
            <div className={`hidden md:block bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${sidebarOpen ? 'md:w-64' : 'md:w-16'
                }`}>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        {sidebarOpen ? (
                            <div className="flex items-center space-x-3">
                                <img src="https://res.cloudinary.com/dxchbdcai/image/upload/v1759588261/Captura_de_Tela_2025-10-04_%C3%A0s_11.30.40_ydns5v.png" alt="Logo da Igreja" className="w-10 h-10 object-contain" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Igreja Admin</h2>
                            </div>
                        ) : (
                            <img src="https://res.cloudinary.com/dxchbdcai/image/upload/v1759588261/Captura_de_Tela_2025-10-04_%C3%A0s_11.30.40_ydns5v.png" alt="Logo da Igreja" className="w-8 h-8 mx-auto object-contain" />
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="px-4 py-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <nav className="mt-8">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                            >
                                <Icon className="w-5 h-5" />
                                {sidebarOpen && <span className="ml-3">{item.label}</span>}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Menu Flutuante Mobile */}
            {sidebarOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className={`md:hidden fixed bottom-0 left-4 right-4 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl z-[70] transform transition-all duration-300 mb-24 ${sidebarOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                        }`}>
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-2">
                                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
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
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${isActive
                                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105'
                                                }`}
                                        >
                                            <Icon className="w-7 h-7 mb-2" />
                                            <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Botão menu mobile */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed bottom-6 right-6 z-[80] p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Main Content */}
            <div className="flex-1 overflow-auto pb-20 md:pb-0">
                <div className="p-4 md:p-6">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'members' && renderMembers()}
                    {activeTab === 'events' && renderEvents()}
                    {activeTab === 'prayers' && renderPrayerRequests()}
                    {activeTab === 'birthdays' && renderBirthdays()}
                    {activeTab === 'diaconia' && renderDiaconia()}
                    {activeTab === 'louvor' && renderLouvor()}
                    {activeTab === 'playlistzoe' && renderPlaylistZoe()}
                    {activeTab === 'kids' && renderKids()}
                    {activeTab === 'jovens' && renderJovens()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </div>

            {/* Modais */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Membro</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (onAddMember) {
                                onAddMember(newMemberData);
                            }
                            setNewMemberData({
                                nome: '',
                                telefone: '',
                                nascimento: '',
                                idade: '',
                                genero: 'masculino',
                                funcao: 'membro',
                                status: 'ativo',
                                familia: ''
                            });
                            setShowMemberModal(false);
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newMemberData.nome}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="(11) 98765-4321"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="date"
                                        value={newMemberData.nascimento}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, nascimento: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: 25"
                                        min="0"
                                        max="120"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Função *
                                    </label>
                                    <select
                                        required
                                        value={newMemberData.funcao}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, funcao: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Família
                                    </label>
                                    <input
                                        type="text"
                                        value={newMemberData.familia}
                                        onChange={(e) => setNewMemberData({ ...newMemberData, familia: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: Família Silva"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowMemberModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                                >
                                    Adicionar Membro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEventModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Evento</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            console.log('Formulário submetido', newEventData);
                            if (onAddEvent) {
                                console.log('Chamando onAddEvent');
                                onAddEvent(newEventData);
                            } else {
                                console.warn('onAddEvent não está definido');
                            }
                            setNewEventData({
                                nome: '',
                                data: '',
                                local: '',
                                descricao: ''
                            });
                            setShowEventModal(false);
                            setSelectedDate(null);
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome do Evento *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newEventData.nome}
                                        onChange={(e) => setNewEventData({ ...newEventData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Culto de Celebração"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Data e Hora *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={newEventData.data}
                                        onChange={(e) => setNewEventData({ ...newEventData, data: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Local
                                    </label>
                                    <input
                                        type="text"
                                        value={newEventData.local}
                                        onChange={(e) => setNewEventData({ ...newEventData, local: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Templo Principal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={newEventData.descricao}
                                        onChange={(e) => setNewEventData({ ...newEventData, descricao: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Descrição do evento..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEventModal(false);
                                        setSelectedDate(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Adicionar Evento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPrayerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Pedido de Oração</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Funcionalidade em desenvolvimento...</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowPrayerModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de adicionar música */}
            {showMusicModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Música</h3>
                        <form onSubmit={handleSubmitMusic} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Nome da Música *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newMusicData.nome}
                                    onChange={(e) => setNewMusicData({ ...newMusicData, nome: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Ex: Bondade de Deus"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Artista *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newMusicData.artista}
                                    onChange={(e) => setNewMusicData({ ...newMusicData, artista: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Ex: Isaías Saad"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Link do YouTube *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={newMusicData.link}
                                    onChange={(e) => setNewMusicData({ ...newMusicData, link: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowMusicModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Adicionar Música
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de edição de membro */}
            {showEditMemberModal && selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editar Membro</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            confirmEditMember();
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editMemberData.nome}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="João Silva"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={editMemberData.telefone}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, telefone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="(11) 98765-4321"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="date"
                                        value={editMemberData.nascimento}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, nascimento: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Idade
                                    </label>
                                    <input
                                        type="number"
                                        value={editMemberData.idade}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, idade: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: 25"
                                        min="0"
                                        max="120"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Gênero *
                                    </label>
                                    <select
                                        required
                                        value={editMemberData.genero}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, genero: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Função *
                                    </label>
                                    <select
                                        required
                                        value={editMemberData.funcao}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, funcao: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Status *
                                    </label>
                                    <select
                                        required
                                        value={editMemberData.status}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Família
                                    </label>
                                    <input
                                        type="text"
                                        value={editMemberData.familia}
                                        onChange={(e) => setEditMemberData({ ...editMemberData, familia: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: Família Silva"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditMemberModal(false);
                                        setSelectedMember(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmação de deleção */}
            {showDeleteMemberModal && selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirmar Deleção</h3>
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Tem certeza que deseja deletar o membro:
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedMember.nome}
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowDeleteMemberModal(false);
                                    setSelectedMember(null);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteMember}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Deletar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de criar família */}
            {showFamilyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Criar Nova Família</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (onAddFamily) {
                                onAddFamily(newFamilyData);
                            }
                            setNewFamilyData({
                                nome: '',
                                descricao: '',
                                membrosIds: []
                            });
                            setFamilyMemberSearch('');
                            setShowFamilyModal(false);
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
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

                                <div className="md:col-span-2">
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
                            </div>

                            {/* Lista de membros para adicionar à família */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    Adicionar Membros à Família ({newFamilyData.membrosIds.length} selecionados)
                                </h4>
                                
                                {/* Campo de busca */}
                                <div className="mb-3 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={familyMemberSearch}
                                        onChange={(e) => setFamilyMemberSearch(e.target.value)}
                                        placeholder="Buscar membro pelo nome..."
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:text-white text-sm"
                                    />
                                </div>

                                <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                    {!familyMemberSearch.trim() ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p>Digite o nome de um membro para buscar</p>
                                        </div>
                                    ) : members.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            Nenhum membro cadastrado ainda.
                                        </div>
                                    ) : (
                                        (() => {
                                            const filteredMembers = members.filter(member => 
                                                member.nome.toLowerCase().includes(familyMemberSearch.toLowerCase())
                                            );

                                            if (filteredMembers.length === 0) {
                                                return (
                                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                        Nenhum membro encontrado com "{familyMemberSearch}".
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {filteredMembers.map((member, index) => {
                                                        const age = calculateAge(member.nascimento);
                                                        const initials = getInitials(member.nome);
                                                        const originalIndex = members.indexOf(member);
                                                        const memberId = generateMemberId(member, originalIndex);
                                                        const isSelected = newFamilyData.membrosIds.includes(memberId);

                                                        return (
                                                            <label
                                                                key={memberId}
                                                                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                                                    isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleMemberInFamily(memberId)}
                                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                                                                            {member.genero && <span className="capitalize">{member.genero}</span>}
                                                                            {age && <span> • {age} anos</span>}
                                                                            {member.funcao && <span> • {member.funcao}</span>}
                                                                        </div>
                                                                    </div>
                                                                    {member.familia && (
                                                                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                                                            {member.familia}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowFamilyModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newFamilyData.nome.trim() || newFamilyData.membrosIds.length === 0}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Criar Família ({newFamilyData.membrosIds.length} {newFamilyData.membrosIds.length === 1 ? 'membro' : 'membros'})
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de editar família */}
            {showEditFamilyModal && selectedFamily && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editar Família</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (onEditFamily) {
                                onEditFamily(selectedFamily.nome, editFamilyData);
                            }
                            setEditFamilyData({
                                nome: '',
                                descricao: '',
                                membrosIds: []
                            });
                            setFamilyMemberSearch('');
                            setShowEditFamilyModal(false);
                            setSelectedFamily(null);
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
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

                                <div className="md:col-span-2">
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
                            </div>

                            {/* Lista de membros para adicionar à família */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    Membros da Família ({editFamilyData.membrosIds.length} selecionados)
                                </h4>
                                
                                {/* Campo de busca */}
                                <div className="mb-3 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={familyMemberSearch}
                                        onChange={(e) => setFamilyMemberSearch(e.target.value)}
                                        placeholder="Buscar membro pelo nome..."
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:text-white text-sm"
                                    />
                                </div>

                                <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                    {!familyMemberSearch.trim() ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p>Digite o nome de um membro para buscar</p>
                                        </div>
                                    ) : members.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            Nenhum membro cadastrado ainda.
                                        </div>
                                    ) : (
                                        (() => {
                                            const filteredMembers = members.filter(member => 
                                                member.nome.toLowerCase().includes(familyMemberSearch.toLowerCase())
                                            );

                                            if (filteredMembers.length === 0) {
                                                return (
                                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                        Nenhum membro encontrado com "{familyMemberSearch}".
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {filteredMembers.map((member, index) => {
                                                        const age = calculateAge(member.nascimento);
                                                        const initials = getInitials(member.nome);
                                                        const originalIndex = members.indexOf(member);
                                                        const memberId = generateMemberId(member, originalIndex);
                                                        const isSelected = editFamilyData.membrosIds.includes(memberId);

                                                        return (
                                                            <label
                                                                key={memberId}
                                                                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                                                    isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleMemberInEditFamily(memberId)}
                                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                                                                            {member.genero && <span className="capitalize">{member.genero}</span>}
                                                                            {age && <span> • {age} anos</span>}
                                                                            {member.funcao && <span> • {member.funcao}</span>}
                                                                        </div>
                                                                    </div>
                                                                    {member.familia && member.familia !== selectedFamily.nome && (
                                                                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                                                            {member.familia}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditFamilyModal(false);
                                        setSelectedFamily(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!editFamilyData.nome.trim() || editFamilyData.membrosIds.length === 0}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Salvar Alterações ({editFamilyData.membrosIds.length} {editFamilyData.membrosIds.length === 1 ? 'membro' : 'membros'})
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Montar Escala de Diaconia */}
            {showEscalaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Montar Escala de Diaconia</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                // Salvar escala
                                const novaEscala = {
                                    id: Date.now(),
                                    data: newEscalaData.data,
                                    horario: newEscalaData.horario,
                                    diaconos: members.filter(m => 
                                        newEscalaData.diaconosSelecionados.includes(m.id || `diacono-${members.indexOf(m)}`)
                                    )
                                };
                                const novasEscalas = [...escalas, novaEscala];
                                setEscalas(novasEscalas);
                                localStorage.setItem('escalaDiaconia', JSON.stringify(novasEscalas));
                                console.log('Escala criada:', novaEscala);
                                setShowEscalaModal(false);
                            }}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Data do Culto
                                            </label>
                                            <input
                                                type="date"
                                                value={newEscalaData.data}
                                                onChange={(e) => setNewEscalaData({ ...newEscalaData, data: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Horário do Culto
                                            </label>
                                            <input
                                                type="time"
                                                value={newEscalaData.horario}
                                                onChange={(e) => setNewEscalaData({ ...newEscalaData, horario: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Selecione os Diáconos ({newEscalaData.diaconosSelecionados.length} selecionados)
                                        </h3>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {members.filter(m => m.funcao === 'diácono' || m.funcao === 'diaconia' || m.funcao === 'líder da diaconia').map((diacono, index) => {
                                                const diaconoId = diacono.id || `diacono-${index}`;
                                                const isSelected = newEscalaData.diaconosSelecionados.includes(diaconoId);
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                                            isSelected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                        }`}
                                                        onClick={() => {
                                                            const newSelecionados = isSelected
                                                                ? newEscalaData.diaconosSelecionados.filter(id => id !== diaconoId)
                                                                : [...newEscalaData.diaconosSelecionados, diaconoId];
                                                            setNewEscalaData({ ...newEscalaData, diaconosSelecionados: newSelecionados });
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                                                {getInitials(diacono.nome)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{diacono.nome}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{diacono.telefone}</p>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEscalaModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={newEscalaData.diaconosSelecionados.length === 0}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Criar Escala ({newEscalaData.diaconosSelecionados.length} {newEscalaData.diaconosSelecionados.length === 1 ? 'diácono' : 'diáconos'})
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Músicos Ativos */}
            {showMusicosModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Music className="w-7 h-7 text-purple-600" />
                                    Músicos Ativos ({members.filter(m => m.funcao === 'músico' || m.funcao === 'líder de louvor' || m.funcao === 'louvor').length})
                                </h2>
                                <button
                                    onClick={() => setShowMusicosModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {members.filter(m => m.funcao === 'músico' || m.funcao === 'líder de louvor' || m.funcao === 'louvor').length === 0 ? (
                                <div className="text-center py-12">
                                    <Music className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum músico cadastrado ainda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.filter(m => m.funcao === 'músico' || m.funcao === 'líder de louvor' || m.funcao === 'louvor').map((musico, index) => {
                                        const age = calculateAge(musico.nascimento);
                                        const initials = getInitials(musico.nome);
                                        
                                        return (
                                            <div key={index} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                                        {initials}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{musico.nome}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                            {musico.funcao}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        musico.funcao === 'líder de louvor' 
                                                            ? 'bg-purple-600 text-white' 
                                                            : 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                                                    }`}>
                                                        {musico.funcao === 'líder de louvor' ? 'Líder' : 'Membro'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    {musico.telefone && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{musico.telefone}</span>
                                                        </div>
                                                    )}
                                                    {age && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Users className="w-4 h-4" />
                                                            <span>{age} anos</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova Escala de Louvor */}
            {showEscalaLouvorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nova Escala de Louvor</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const musicos = Object.entries(newEscalaLouvorData.instrumentos)
                                    .filter(([_, musicoId]) => musicoId)
                                    .map(([instrumento, musicoId]) => {
                                        const musico = members.find(m => (m.id || `musico-${members.indexOf(m)}`) === musicoId);
                                        return { ...musico, instrumento };
                                    });
                                
                                const novaEscala = {
                                    id: Date.now(),
                                    tipo: newEscalaLouvorData.tipo,
                                    data: newEscalaLouvorData.data,
                                    horario: newEscalaLouvorData.horario,
                                    musicos: musicos
                                };
                                const novasEscalas = [...escalasLouvor, novaEscala];
                                setEscalasLouvor(novasEscalas);
                                localStorage.setItem('escalaLouvor', JSON.stringify(novasEscalas));
                                setNewEscalaLouvorData({
                                    tipo: 'culto',
                                    data: format(new Date(), 'yyyy-MM-dd'),
                                    horario: '19:00',
                                    instrumentos: {},
                                    musicas: []
                                });
                                setShowEscalaLouvorModal(false);
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tipo de Evento
                                        </label>
                                        <select
                                            value={newEscalaLouvorData.tipo}
                                            onChange={(e) => setNewEscalaLouvorData({ ...newEscalaLouvorData, tipo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="culto">Culto</option>
                                            <option value="ensaio">Ensaio</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {newEscalaLouvorData.tipo === 'culto' ? 'Data do Culto' : 'Data do Ensaio'}
                                            </label>
                                            <input
                                                type="date"
                                                value={newEscalaLouvorData.data}
                                                onChange={(e) => setNewEscalaLouvorData({ ...newEscalaLouvorData, data: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {newEscalaLouvorData.tipo === 'culto' ? 'Horário do Culto' : 'Horário do Ensaio'}
                                            </label>
                                            <input
                                                type="time"
                                                value={newEscalaLouvorData.horario}
                                                onChange={(e) => setNewEscalaLouvorData({ ...newEscalaLouvorData, horario: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Instrumentos ({Object.values(newEscalaLouvorData.instrumentos).filter(Boolean).length} escalados)
                                        </h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {['Voz 1', 'Voz 2', 'Voz 3', 'Teclado 1', 'Teclado 2', 'Guitarra', 'Contrabaixo', 'Violão', 'Bateria'].map((instrumento) => {
                                                const musicoId = newEscalaLouvorData.instrumentos[instrumento];
                                                const musico = musicoId ? members.find(m => (m.id || `musico-${members.indexOf(m)}`) === musicoId) : null;
                                                
                                                return (
                                                    <div key={instrumento} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Music className="w-5 h-5 text-purple-600" />
                                                                <span className="font-medium text-gray-900 dark:text-white">{instrumento}</span>
                                                            </div>
                                                            {musico && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newInstrumentos = { ...newEscalaLouvorData.instrumentos };
                                                                        delete newInstrumentos[instrumento];
                                                                        setNewEscalaLouvorData({ ...newEscalaLouvorData, instrumentos: newInstrumentos });
                                                                    }}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {musico ? (
                                                            <div className="flex items-center gap-3 p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                                                                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                                                    {getInitials(musico.nome)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{musico.nome}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{musico.funcao}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={musicoId || ''}
                                                                onChange={(e) => {
                                                                    setNewEscalaLouvorData({
                                                                        ...newEscalaLouvorData,
                                                                        instrumentos: {
                                                                            ...newEscalaLouvorData.instrumentos,
                                                                            [instrumento]: e.target.value || undefined
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                                                            >
                                                                <option value="">Selecione um músico</option>
                                                                {members.filter(m => m.funcao === 'músico' || m.funcao === 'líder de louvor' || m.funcao === 'louvor').map((musico, index) => {
                                                                    const id = musico.id || `musico-${index}`;
                                                                    return (
                                                                        <option key={id} value={id}>
                                                                            {musico.nome}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewEscalaLouvorData({
                                                tipo: 'culto',
                                                data: format(new Date(), 'yyyy-MM-dd'),
                                                horario: '19:00',
                                                instrumentos: {}
                                            });
                                            setShowEscalaLouvorModal(false);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={Object.values(newEscalaLouvorData.instrumentos).filter(Boolean).length === 0}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Criar Escala ({Object.values(newEscalaLouvorData.instrumentos).filter(Boolean).length} {Object.values(newEscalaLouvorData.instrumentos).filter(Boolean).length === 1 ? 'músico' : 'músicos'})
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Músicas Cadastradas */}
            {showMusicasCadastradasModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Music className="w-7 h-7 text-green-600" />
                                    Músicas Cadastradas ({playlistMusicas.length})
                                </h2>
                                <button
                                    onClick={() => setShowMusicasCadastradasModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {playlistMusicas.length === 0 ? (
                                <div className="text-center py-12">
                                    <Music className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Nenhuma música cadastrada ainda.</p>
                                    <button
                                        onClick={() => {
                                            setShowMusicasCadastradasModal(false);
                                            setShowMusicModal(true);
                                        }}
                                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Adicionar Primeira Música
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {playlistMusicas.map((musica) => (
                                        <div 
                                            key={musica.id} 
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                        <Music className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                            {musica.nome}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {musica.artista}
                                                        </p>
                                                        {musica.link && (
                                                            <a
                                                                href={musica.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-flex items-center gap-1"
                                                            >
                                                                <Music className="w-3 h-3" />
                                                                Ver no YouTube
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Deseja remover "${musica.nome}" da playlist?`)) {
                                                            handleDeleteMusic(musica.id);
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                <button
                                    onClick={() => {
                                        setShowMusicasCadastradasModal(false);
                                        setShowMusicModal(true);
                                    }}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Nova Música
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChurchAdminDashboard;
