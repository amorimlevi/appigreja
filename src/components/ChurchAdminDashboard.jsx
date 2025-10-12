import React, { useState, useMemo, useEffect } from 'react';
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
    ChevronDown,
    ChevronUp,
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
    LogOut,
    Bell,
    Send,
    CheckCircle
} from 'lucide-react';
import { format, isAfter, isBefore, startOfWeek, endOfWeek, addDays, subDays, differenceInYears, startOfMonth, endOfMonth, isSameMonth, isToday, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomCalendar from './CustomCalendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatId } from '../utils/formatters';
import { getEventFoods, getEventParticipants, deleteEventFood, createMinistrySchedule, getMinistrySchedules, updateMinistrySchedule, deleteMinistrySchedule, getWorkshops, deleteWorkshop, createWorkshop, createAviso } from '../lib/supabaseService';

const ChurchAdminDashboard = ({ members = [], events = [], prayerRequests = [], families = [], onAddEvent, onEditEvent, onDeleteEvent, onAddMember, onEditMember, onDeleteMember, onAddFamily, onEditFamily, onLogout }) => {
    console.log('ChurchAdminDashboard renderizando - members:', members.length, 'events:', events.length, 'families:', families.length)
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
    const [expandedFamilies, setExpandedFamilies] = useState({});
    const [editMemberData, setEditMemberData] = useState({
        nome: '',
        telefone: '',
        nascimento: '',
        idade: '',
        genero: 'masculino',
        funcoes: [],
        status: 'ativo',
        familia: ''
    });
    const [newMemberData, setNewMemberData] = useState({
        nome: '',
        telefone: '',
        nascimento: '',
        idade: '',
        genero: 'masculino',
        funcoes: [],
        status: 'ativo',
        familia: ''
    });
    const [newEventData, setNewEventData] = useState({
        nome: '',
        data: '',
        local: '',
        descricao: '',
        alimentacao: false,
        comidas: []
    });
    const [novaComida, setNovaComida] = useState('');
    const [novaComidaEdit, setNovaComidaEdit] = useState('');
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
    const [showEscalaOptionsModal, setShowEscalaOptionsModal] = useState(false);
    const [showEditEscalaModal, setShowEditEscalaModal] = useState(false);
    const [selectedEscalaDiaconia, setSelectedEscalaDiaconia] = useState(null);
    const [newEscalaData, setNewEscalaData] = useState({
        categoria: 'culto',
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '19:00',
        diaconosSelecionados: []
    });
    const [editEscalaData, setEditEscalaData] = useState({
        categoria: 'culto',
        data: '',
        horario: '19:00',
        diaconosSelecionados: []
    });
    const [escalas, setEscalas] = useState(() => {
        const saved = localStorage.getItem('escalaDiaconia');
        return saved ? JSON.parse(saved) : [];
    });
    const [showMusicosModal, setShowMusicosModal] = useState(false);
    const [showEscalaLouvorModal, setShowEscalaLouvorModal] = useState(false);
    const [showViewEscalaModal, setShowViewEscalaModal] = useState(false);
    const [selectedEscala, setSelectedEscala] = useState(null);
    const [newEscalaLouvorData, setNewEscalaLouvorData] = useState({
        tipo: 'culto',
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '19:00',
        musicas: [],
        instrumentos: {}
    });
    const [newMusicaEscala, setNewMusicaEscala] = useState('');
    const [escalasLouvor, setEscalasLouvor] = useState([]);
    const [showMusicasCadastradasModal, setShowMusicasCadastradasModal] = useState(false);
    const [showProfessoresModal, setShowProfessoresModal] = useState(false);
    const [showCriancasModal, setShowCriancasModal] = useState(false);
    const [showJovensModal, setShowJovensModal] = useState(false);
    const [showEscalaProfessoresModal, setShowEscalaProfessoresModal] = useState(false);
    const [showDetalhesEscalaProfessoresModal, setShowDetalhesEscalaProfessoresModal] = useState(false);
    const [showEditEscalaProfessoresModal, setShowEditEscalaProfessoresModal] = useState(false);
    const [selectedEscalaProfessores, setSelectedEscalaProfessores] = useState(null);
    const [editEscalaProfessoresData, setEditEscalaProfessoresData] = useState({
        turmas: [],
        data: '',
        horario: '',
        professoresSelecionados: []
    });
    const [newEscalaProfessoresData, setNewEscalaProfessoresData] = useState({
        turmas: [],
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '09:00',
        professoresSelecionados: []
    });
    const [escalasProfessores, setEscalasProfessores] = useState([]);
    const [showAvisoModal, setShowAvisoModal] = useState(false);
    const [newAvisoData, setNewAvisoData] = useState({
        titulo: '',
        mensagem: '',
        destinatarios: ['todos']
    });
    const [avisos, setAvisos] = useState(() => {
        const saved = localStorage.getItem('avisos');
        return saved ? JSON.parse(saved) : [];
    });
    const [showOficinaModal, setShowOficinaModal] = useState(false);
    const [newOficinaData, setNewOficinaData] = useState({
        nome: '',
        descricao: '',
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '19:00',
        local: '',
        vagas: '',
        permissaoInscricao: ['todos']
    });
    const [oficinas, setOficinas] = useState([]);
    const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [selectedMemberForFood, setSelectedMemberForFood] = useState(null);
    const [eventFoodsFromDB, setEventFoodsFromDB] = useState([]);
    const [eventParticipants, setEventParticipants] = useState([]);
    const [showParticipantsSection, setShowParticipantsSection] = useState(false);
    const [showFoodsSection, setShowFoodsSection] = useState(false);
    const [showEditEventModal, setShowEditEventModal] = useState(false);
    const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
    const [editEventData, setEditEventData] = useState({
        nome: '',
        data: '',
        local: '',
        descricao: '',
        alimentacao: false,
        comidas: []
    });

    // Aplicar tema escuro ao DOM
    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    // Carregar escalas de louvor do banco
    React.useEffect(() => {
        const loadLouvorSchedules = async () => {
            try {
                const schedules = await getMinistrySchedules('louvor');
                console.log('Escalas de louvor carregadas no admin:', schedules);
                setEscalasLouvor(schedules);
            } catch (error) {
                console.error('Erro ao carregar escalas de louvor:', error);
            }
        };

        loadLouvorSchedules();
    }, []);

    // Carregar escalas de diaconia do banco
    React.useEffect(() => {
        const loadDiaconiaSchedules = async () => {
            try {
                const schedules = await getMinistrySchedules('diaconia');
                console.log('Escalas de diaconia carregadas no admin:', schedules);
                setEscalas(schedules);
            } catch (error) {
                console.error('Erro ao carregar escalas de diaconia:', error);
            }
        };

        loadDiaconiaSchedules();
    }, []);

    // Carregar escalas kids do banco
    React.useEffect(() => {
        const loadKidsSchedules = async () => {
            try {
                const schedules = await getMinistrySchedules('kids');
                console.log('Escalas kids carregadas no admin:', schedules);
                setEscalasProfessores(schedules);
            } catch (error) {
                console.error('Erro ao carregar escalas kids:', error);
            }
        };

        loadKidsSchedules();
    }, []);

    React.useEffect(() => {
        const loadWorkshops = async () => {
            try {
                console.log('Iniciando carregamento de oficinas...');
                const workshopsData = await getWorkshops();
                console.log('Dados brutos do Supabase:', workshopsData);
                if (workshopsData && workshopsData.length > 0) {
                    console.log('Tipo do primeiro ID:', typeof workshopsData[0].id, workshopsData[0].id);
                }
                // Remover filtro temporariamente
                setOficinas(workshopsData || []);
            } catch (error) {
                console.error('Erro ao carregar oficinas:', error);
            }
        };

        if (activeTab === 'jovens') {
            loadWorkshops();
        }
    }, [activeTab]);

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
            funcoes: ['membro'],
            status: 'ativo',
            familia: ''
        });
        setMemberView('individual');
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
        // Mapear os membros para seus IDs corretos
        const memberIds = family.membros.map(m => {
            const index = members.findIndex(member => member.nome === m.nome && member.nascimento === m.nascimento);
            return index >= 0 ? generateMemberId(m, index) : m.id;
        });
        setEditFamilyData({
            nome: family.nome || '',
            descricao: family.descricao || '',
            membrosIds: memberIds
        });
        setFamilyMemberSearch('');
        setShowEditFamilyModal(true);
    };

    const handleEditEscalaDiaconia = (escala) => {
        setEditEscalaData({
            categoria: escala.categoria,
            data: escala.data,
            horario: escala.horario,
            diaconosSelecionados: escala.diaconos.map(d => d.id)
        });
        setShowEscalaOptionsModal(false);
        setShowEditEscalaModal(true);
    };

    const handleSaveEditEscala = (e) => {
        e.preventDefault();
        const updatedEscalas = escalas.map(escala => {
            if (escala.id === selectedEscalaDiaconia.id) {
                const diaconosSelecionados = members
                    .filter(m => editEscalaData.diaconosSelecionados.includes(m.id))
                    .map(m => ({ id: m.id, nome: m.nome }));
                
                return {
                    ...escala,
                    categoria: editEscalaData.categoria,
                    data: editEscalaData.data,
                    horario: editEscalaData.horario,
                    diaconos: diaconosSelecionados
                };
            }
            return escala;
        });
        
        setEscalas(updatedEscalas);
        localStorage.setItem('escalaDiaconia', JSON.stringify(updatedEscalas));
        setShowEditEscalaModal(false);
        setSelectedEscalaDiaconia(null);
        setEditEscalaData({
            categoria: 'culto',
            data: '',
            horario: '19:00',
            diaconosSelecionados: []
        });
    };

    const handleDeleteEscalaDiaconia = (escalaId) => {
        if (confirm('Tem certeza que deseja deletar esta escala?')) {
            const updatedEscalas = escalas.filter(e => e.id !== escalaId);
            setEscalas(updatedEscalas);
            localStorage.setItem('escalaDiaconia', JSON.stringify(updatedEscalas));
            setShowEscalaOptionsModal(false);
            setSelectedEscalaDiaconia(null);
        }
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
            funcoes: member.funcoes || (member.funcao ? [member.funcao] : []),
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
        'jovem',
        'ministro',
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
        if (!name) return '??';
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
        // Gera um hash único baseado no nome e nascimento
        const uniqueString = `${member.nome}-${member.nascimento || ''}-${member.telefone || ''}`;
        let hash = 0;
        for (let i = 0; i < uniqueString.length; i++) {
            const char = uniqueString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `MBR${Math.abs(hash).toString().padStart(8, '0').substring(0, 8)}`;
    };

    // Função para gerar ID da família
    const generateFamilyId = (family) => {
        if (family.id) return family.id;
        // Gera um hash único baseado no nome, descricao e timestamp
        const uniqueString = `${family.nome}-${family.descricao || ''}-${Date.now()}`;
        let hash = 0;
        for (let i = 0; i < uniqueString.length; i++) {
            const char = uniqueString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `FAM${Math.abs(hash).toString().padStart(8, '0').substring(0, 8)}`;
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
        }).sort((a, b) => {
            // Ordenar por ID crescente
            const idA = a.id || 0;
            const idB = b.id || 0;
            return idA - idB;
        });
    }, [members, genderFilter, ageFilter, roleFilter, searchTerm]);
    
    // Membros individuais (sem família) para a view individual
    const individualMembers = useMemo(() => {
        return filteredMembers.filter(member => !member.familia || member.familia.trim() === '');
    }, [filteredMembers]);

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

    // Agrupar membros por família (usando dados do Supabase)
    const familyGroups = useMemo(() => {
        console.log('Calculando familyGroups - families:', families, 'members:', members);
        
        return families.map(family => {
            const familyMembers = members.filter(member => 
                family.membros_ids && family.membros_ids.includes(member.id)
            );
            
            return {
                id: family.id,
                nome: family.nome,
                descricao: family.descricao,
                membros: familyMembers,
                totalMembros: familyMembers.length
            };
        }).sort((a, b) => b.totalMembros - a.totalMembros);
    }, [families, members]);

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
        { id: 'birthdays', label: 'Aniversários', icon: Gift },
        { id: 'avisos', label: 'Avisos', icon: Bell },
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
                <img src="https://res.cloudinary.com/dxchbdcai/image/upload/v1759592247/Design_sem_nome_10_nwkjse.png" alt="Logo da Igreja" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Igreja Zoe</h1>
            </div>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setShowAvisoModal(true)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        <span className="text-sm md:text-base">Novo Aviso</span>
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

            {memberView === 'individual' ? (
                filteredMembers.length === 0 ? (
                    <div className="card text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhum membro encontrado com os filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(() => {
                            console.log('RENDERIZANDO MEMBROS INDIVIDUAIS. Total:', filteredMembers.length);
                            return null;
                        })()}
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
                                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {member.id ? formatId(member.id) : memberId}</p>
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
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {(member.funcoes && member.funcoes.length > 0 ? member.funcoes : ['membro']).map((funcao, idx) => {
                                                const funcaoLower = funcao.toLowerCase();
                                                const getFuncaoColor = () => {
                                                    if (age !== null && age <= 12) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
                                                    if (funcaoLower === 'pastor') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
                                                    if (funcaoLower === 'diácono' || funcaoLower === 'diacono' || funcaoLower === 'diaconia') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
                                                    if (funcaoLower === 'louvor' || funcaoLower.includes('louvor')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                                                    if (funcaoLower === 'músico' || funcaoLower === 'musico') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                                                    if (funcaoLower.includes('lider') || funcaoLower.includes('líder')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
                                                    if (funcaoLower === 'jovem' || funcaoLower === 'jovens') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
                                                    if (funcaoLower.includes('kids') || funcaoLower.includes('criança')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
                                                    if (funcaoLower.includes('professor')) return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
                                                    if (funcaoLower === 'membro') return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
                                                    return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
                                                };
                                                
                                                return (
                                                    <span key={idx} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFuncaoColor()}`}>
                                                        {age !== null && age <= 12 && idx === 0 ? 'Criança' : funcao.charAt(0).toUpperCase() + funcao.slice(1)}
                                                    </span>
                                                );
                                            })}
                                        </div>
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
                        {familyGroups.map((family, index) => {
                            const isExpanded = expandedFamilies[family.id];
                            
                            return (
                                <div key={family.id} className="card hover:shadow-lg transition-shadow">
                                    <div 
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => {
                                            setExpandedFamilies(prev => ({
                                                ...prev,
                                                [family.id]: !prev[family.id]
                                            }));
                                        }}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
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
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditFamily(family);
                                                }}
                                                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                                                title="Editar Família"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            {isExpanded ? (
                                                <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400 transform rotate-90 transition-transform" />
                                            ) : (
                                                <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform" />
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                                                            <div className="flex flex-wrap gap-1 justify-end">
                                                                {(member.funcoes && member.funcoes.length > 0 ? member.funcoes : ['membro']).map((funcao, idx) => {
                                                                    const funcaoLower = funcao.toLowerCase();
                                                                    const getFuncaoColor = () => {
                                                                        if (age !== null && age <= 12) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
                                                                        if (funcaoLower === 'pastor') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
                                                                        if (funcaoLower === 'diácono' || funcaoLower === 'diacono' || funcaoLower === 'diaconia') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
                                                                        if (funcaoLower === 'louvor' || funcaoLower.includes('louvor')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                                                                        if (funcaoLower === 'músico' || funcaoLower === 'musico') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                                                                        if (funcaoLower.includes('lider') || funcaoLower.includes('líder')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
                                                                        if (funcaoLower === 'jovem' || funcaoLower === 'jovens') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
                                                                        if (funcaoLower.includes('kids') || funcaoLower.includes('criança')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
                                                                        if (funcaoLower.includes('professor')) return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
                                                                        if (funcaoLower === 'membro') return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
                                                                        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
                                                                    };
                                                                    
                                                                    return (
                                                                        <span key={idx} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFuncaoColor()}`}>
                                                                            {age !== null && age <= 12 && idx === 0 ? 'Criança' : funcao.charAt(0).toUpperCase() + funcao.slice(1)}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditMember(member);
                                                                    }}
                                                                    className="p-1.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center justify-center"
                                                                    title="Editar"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteMember(member);
                                                                    }}
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
                                    )}
                                </div>
                            );
                        })}
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
                                        <div 
                                            key={`${event.id}-${idx}`} 
                                            className={`calendar-event text-xs ${event.tipo === 'oficina' ? 'bg-purple-500' : ''}`} 
                                            title={event.nome}
                                        >
                                            {event.tipo === 'oficina' && '🎓 '}
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
                            Próximos Eventos ({futureEvents.length})
                        </h3>
                        <div className="space-y-3">
                            {futureEvents.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">Nenhum evento futuro agendado.</p>
                            ) : (
                                futureEvents.map(event => (
                                    <div 
                                        key={event.id} 
                                        className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                                            event.tipo === 'oficina' 
                                                ? 'bg-purple-50 border-purple-500 hover:bg-purple-100' 
                                                : 'bg-green-50 border-green-500 hover:bg-green-100'
                                        }`}
                                        onClick={async () => {
                                            setSelectedEvent(event);
                                            setSelectedFoods([]);
                                            setShowParticipantsSection(false);
                                            setShowFoodsSection(false);
                                            
                                            // Buscar alimentações do banco de dados
                                            if (event.alimentacao && event.id) {
                                                try {
                                                    const foods = await getEventFoods(event.id);
                                                    setEventFoodsFromDB(foods || []);
                                                } catch (error) {
                                                    console.error('Erro ao buscar alimentações:', error);
                                                    setEventFoodsFromDB([]);
                                                }
                                            } else {
                                                setEventFoodsFromDB([]);
                                            }
                                            
                                            // Buscar participantes do evento
                                            if (event.id) {
                                                try {
                                                    const participants = await getEventParticipants(event.id);
                                                    setEventParticipants(participants || []);
                                                } catch (error) {
                                                    console.error('Erro ao buscar participantes:', error);
                                                    setEventParticipants([]);
                                                }
                                            } else {
                                                setEventParticipants([]);
                                            }
                                            
                                            setShowEventDetailsModal(true);
                                        }}
                                    >
                                        <h4 className={`font-semibold ${event.tipo === 'oficina' ? 'text-purple-800' : 'text-green-800'}`}>
                                            {event.tipo === 'oficina' && '🎓 '}
                                            {event.nome}
                                        </h4>
                                        <p className="text-sm text-green-600 flex items-center mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {format(new Date(event.data), "EEEE, dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                            Eventos Passados ({pastEvents.length})
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
                                            {format(new Date(event.data), "EEEE, dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
    const diaconos = members.filter(m => {
        const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
        return funcoes.some(f => f === 'diácono' || f === 'diaconia' || f === 'líder da diaconia' || f === 'lider da diaconia');
    });
    
    return (
    <div className="space-y-6">
    <div className="flex justify-between items-center">
    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white"> Diaconia</h1>
    <button 
        onClick={() => {
            setNewEscalaData({
                categoria: 'culto',
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
                                const diaconosEscalados = escala.membros_ids 
                                    ? members.filter(m => escala.membros_ids.includes(m.id))
                                    : escala.diaconos || [];
                                
                                return (
                                    <div 
                                        key={escala.id} 
                                        onClick={() => {
                                            setSelectedEscalaDiaconia(escala);
                                            setShowEscalaOptionsModal(true);
                                        }}
                                        className={`p-4 border-l-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow ${
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
                                                {(escala.tipo || escala.categoria) && (
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                                        (escala.tipo || escala.categoria) === 'culto' ? 'bg-purple-600 text-white' : 'bg-orange-600 text-white'
                                                    }`}>
                                                        {escala.tipo || escala.categoria}
                                                    </span>
                                                )}
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
                                                        {diaconosEscalados.map((diacono, dIndex) => (
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
        const musicos = members.filter(m => {
            const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
            return funcoes.some(f => f === 'músico' || f === 'líder de louvor' || f === 'louvor');
        });
        
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
                                    musicas: [],
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
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                        Próximas escalas ({escalasLouvor.length})
                    </h3>
                    {escalasLouvor.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma escala criada ainda.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Clique em "Nova Escala" para criar a primeira.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {escalasLouvor.sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`)).map((escala, index) => {
                                const now = new Date();
                                const dataEscala = new Date(`${escala.data}T${escala.horario}`);
                                const isProxima = dataEscala >= now && index === escalasLouvor.filter(e => new Date(`${e.data}T${e.horario}`) >= now).sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`)).findIndex(e => e.id === escala.id) && escalasLouvor.filter(e => new Date(`${e.data}T${e.horario}`) >= now).sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`)).findIndex(e => e.id === escala.id) === 0;
                                const dataFormatada = format(parseISO(escala.data), "EEEE - dd/MM/yyyy", { locale: ptBR });
                                
                                return (
                                    <div 
                                        key={escala.id} 
                                        onClick={() => {
                                            setSelectedEscala(escala);
                                            setShowViewEscalaModal(true);
                                        }}
                                        className={`p-4 border-l-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                                            isProxima 
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                                : 'border-gray-400 bg-gray-50 dark:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <p className={`font-semibold capitalize ${
                                                isProxima ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-gray-300'
                                            }`}>
                                                {dataFormatada}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                    escala.tipo === 'culto' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                                                }`}>
                                                    {escala.tipo === 'culto' ? 'Culto' : 'Ensaio'}
                                                </span>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                    isProxima ? 'bg-purple-600 text-white' : 'bg-gray-400 text-white'
                                                }`}>
                                                    {escala.horario}
                                                </span>
                                                {isProxima && (
                                                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Próximo</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {escala.musicas && escala.musicas.length > 0 && (
                                                <div className="flex items-start gap-2">
                                                    <Music className={`w-4 h-4 mt-0.5 ${
                                                        isProxima ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                                                    }`} />
                                                    <div className="flex-1">
                                                        <span className={`font-medium text-sm ${
                                                            isProxima ? 'text-purple-800 dark:text-purple-400' : 'text-gray-700 dark:text-gray-400'
                                                        }`}>
                                                            {escala.musicas.length} {escala.musicas.length === 1 ? 'música' : 'músicas'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-2">
                                                <Users className={`w-4 h-4 mt-0.5 ${
                                                    isProxima ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                                                }`} />
                                                <div className="flex-1">
                                                    <span className={`font-medium text-sm ${
                                                        isProxima ? 'text-purple-800 dark:text-purple-400' : 'text-gray-700 dark:text-gray-400'
                                                    }`}>
                                                        Músicos escalados:
                                                    </span>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {escala.musicos.map((musico, mIndex) => (
                                                            <span 
                                                                key={mIndex}
                                                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                                                    isProxima 
                                                                        ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200' 
                                                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                                }`}
                                                            >
                                                                <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                                                                    {getInitials(musico.nome)}
                                                                </div>
                                                                {musico.nome}
                                                                {musico.instrumento && ` - ${musico.instrumento}`}
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
        
        const professores = members.filter(m => {
            const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
            return funcoes.some(f => f === 'professor kids' || f === 'lider kids');
        });
        
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Kids</h1>
                    <button 
                        onClick={() => setShowEscalaProfessoresModal(true)}
                        className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Escala
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                        className="card cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setShowCriancasModal(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Crianças</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{criancas.length}</p>
                            </div>
                            <Baby className="w-8 h-8 text-pink-500" />
                        </div>
                    </div>
                    
                    <div 
                        className="card cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setShowProfessoresModal(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Professores</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{professores.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
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
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-pink-600" />
                        Próximas Escalas
                    </h3>
                    {escalasProfessores.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma escala criada ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {escalasProfessores
                                .sort((a, b) => new Date(a.data) - new Date(b.data))
                                .slice(0, 5)
                                .map((escala, idx) => {
                                    // Extrair turmas da descrição
                                    const turmas = escala.descricao?.includes('Turmas:') 
                                        ? escala.descricao.replace('Turmas: ', '').split(', ')
                                        : (escala.turmas || []);
                                    const hasPequenos = turmas.includes('Pequenos');
                                    const hasGrandes = turmas.includes('Grandes');
                                    
                                    let cardClasses = "p-4 rounded-lg border ";
                                    if (hasPequenos && hasGrandes) {
                                        cardClasses += "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-700";
                                    } else if (hasPequenos) {
                                        cardClasses += "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700";
                                    } else if (hasGrandes) {
                                        cardClasses += "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-300 dark:border-purple-700";
                                    } else {
                                        cardClasses += "bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800";
                                    }
                                    
                                    return (
                                    <div 
                                        key={idx} 
                                        className={`${cardClasses} cursor-pointer hover:shadow-lg transition-shadow`}
                                        onClick={() => {
                                            setSelectedEscalaProfessores(escala);
                                            setShowDetalhesEscalaProfessoresModal(true);
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-pink-600" />
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {format(parseISO(escala.data), "dd/MM/yyyy", { locale: ptBR })} - {escala.horario}
                                                    </span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {format(parseISO(escala.data), "EEEE", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {turmas && turmas.length > 0 && (
                                            <div className="mb-2">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Turmas:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {turmas.map((turma, i) => (
                                                        <span key={i} className={`text-xs px-2 py-0.5 text-white rounded-full ${
                                                            turma === 'Pequenos' ? 'bg-blue-500' : 'bg-purple-600'
                                                        }`}>
                                                            {turma}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Professores escalados:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(escala.membros_ids || escala.professoresSelecionados || []).map((profId, i) => {
                                                    const prof = members.find(m => m.id === profId);
                                                    return prof ? (
                                                        <span key={i} className="text-xs px-2 py-1 bg-pink-600 text-white rounded-full">
                                                            {prof.nome}
                                                        </span>
                                                    ) : null;
                                                })}
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

    const renderJovens = () => {
        const jovens = members.filter(m => {
            const age = calculateAge(m.nascimento);
            const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
            return (age !== null && age >= 13 && age <= 30) || funcoes.includes('jovem');
        });
        
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Jovens</h1>
                    <button 
                        onClick={() => setShowOficinaModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Oficina
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                        className="card cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setShowJovensModal(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Jovens</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jovens.length}</p>
                            </div>
                            <Sparkles className="w-8 h-8 text-indigo-500" />
                        </div>
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
                                <span className="text-gray-900 dark:text-white">19-24 anos (Jovens)</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {jovens.filter(j => {
                                    const age = calculateAge(j.nascimento);
                                    return age >= 19 && age <= 24;
                                }).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <span className="text-gray-900 dark:text-white">25+ anos (Jovens Adultos)</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {jovens.filter(j => {
                                    const age = calculateAge(j.nascimento);
                                    return age >= 25;
                                }).length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Oficinas</h3>
                        <button
                            onClick={() => setShowOficinaModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Oficina
                        </button>
                    </div>
                    {oficinas.length === 0 ? (
                        <div className="text-center py-12">
                            <Plus className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma oficina cadastrada ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {oficinas.map((oficina) => (
                                <div 
                                    key={oficina.id} 
                                    className="p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{oficina.nome}</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{oficina.descricao}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(oficina.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {oficina.local}
                                                </span>
                                                {oficina.vagas && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {oficina.vagas} vagas
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Deseja excluir esta oficina?')) {
                                                    try {
                                                        await deleteWorkshop(oficina.id);
                                                        const workshopsData = await getWorkshops();
                                                        const validWorkshops = (workshopsData || []).filter(w => typeof w.id === 'number');
                                                        setOficinas(validWorkshops);
                                                        alert('Oficina deletada com sucesso!');
                                                    } catch (error) {
                                                        console.error('Erro ao deletar oficina:', error);
                                                        alert('Erro ao deletar oficina.');
                                                    }
                                                }
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderAvisos = () => {
        const getDestinatariosCount = (destinatarios) => {
            // Se destinatarios é uma string (avisos antigos), converter para array
            const tipos = Array.isArray(destinatarios) ? destinatarios : [destinatarios];
            
            if (tipos.includes('todos')) return members.length;
            
            // Criar um Set para evitar contar o mesmo membro várias vezes
            const membrosUnicos = new Set();
            
            tipos.forEach(tipo => {
                if (tipo === 'criancas') {
                    members.filter(m => {
                        const age = calculateAge(m.nascimento);
                        return age !== null && age <= 12;
                    }).forEach(m => membrosUnicos.add(m.id));
                } else if (tipo === 'jovens') {
                    members.filter(m => {
                        const age = calculateAge(m.nascimento);
                        const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                        return (age !== null && age >= 13 && age <= 30) || funcoes.includes('jovem');
                    }).forEach(m => membrosUnicos.add(m.id));
                } else if (tipo === 'adultos') {
                    members.filter(m => {
                        const age = calculateAge(m.nascimento);
                        return age !== null && age > 30;
                    }).forEach(m => membrosUnicos.add(m.id));
                } else if (availableRoles.includes(tipo)) {
                    members.filter(m => {
                        const funcoes = m.funcoes || (m.funcao ? [m.funcao] : ['membro']);
                        return funcoes.includes(tipo);
                    }).forEach(m => membrosUnicos.add(m.id));
                }
            });
            
            return membrosUnicos.size;
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Avisos</h1>
                    <button 
                        onClick={() => setShowAvisoModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Aviso
                    </button>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Avisos Recentes</h3>
                    {avisos.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Nenhum aviso enviado ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {avisos.slice().reverse().map((aviso) => (
                                <div 
                                    key={aviso.id} 
                                    className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{aviso.titulo}</h4>
                                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                                                    {(() => {
                                                        const dest = Array.isArray(aviso.destinatarios) ? aviso.destinatarios : [aviso.destinatarios];
                                                        if (dest.includes('todos')) return 'Todos';
                                                        const labels = dest.map(d => {
                                                            if (d === 'criancas') return 'Crianças';
                                                            if (d === 'jovens') return 'Jovens';
                                                            if (d === 'adultos') return 'Adultos';
                                                            return d.charAt(0).toUpperCase() + d.slice(1);
                                                        });
                                                        return labels.join(', ');
                                                    })()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{aviso.mensagem}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {aviso.created_at ? format(new Date(aviso.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 
                                                     aviso.data ? format(new Date(aviso.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Data não disponível'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {getDestinatariosCount(aviso.destinatarios)} destinatários
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('Deseja excluir este aviso?')) {
                                                    const updatedAvisos = avisos.filter(a => a.id !== aviso.id);
                                                    setAvisos(updatedAvisos);
                                                    localStorage.setItem('avisos', JSON.stringify(updatedAvisos));
                                                }
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
                                            >
                                                <Trash2 className="w-5 h-5" />
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
        <div className="flex flex-col md:flex-row h-screen bg-white dark:bg-gray-900 transition-colors" style={{ 
            paddingTop: 'env(safe-area-inset-top, 0px)'
        }}>
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
                                {item.id === 'playlistzoe' ? (
                                    <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">Z</span>
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
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
                    <div 
                        className={`md:hidden fixed left-4 right-4 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl z-[70] transform transition-all duration-300 ${sidebarOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                        }`}
                        style={{
                            bottom: `calc(6rem + env(safe-area-inset-bottom, 0px))`
                        }}>
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
                        </div>
                    </div>
                </>
            )}

            {/* Botão menu mobile */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed z-40 p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95"
                style={{
                    bottom: `calc(1.5rem + env(safe-area-inset-bottom, 0px))`,
                    right: '1.5rem'
                }}
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Main Content */}
            <div className="flex-1 overflow-auto" style={{ 
                height: '100%',
                overflowY: 'scroll',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))'
            }}>
                <div className="p-4 md:p-6">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'members' && renderMembers()}
                    {activeTab === 'events' && renderEvents()}
                    {activeTab === 'birthdays' && renderBirthdays()}
                    {activeTab === 'avisos' && renderAvisos()}
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
                                funcoes: ['membro'],
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
                                        onChange={(e) => {
                                            const idade = calculateAge(e.target.value);
                                            setNewMemberData({ 
                                                ...newMemberData, 
                                                nascimento: e.target.value,
                                                idade: idade !== null ? idade.toString() : ''
                                            });
                                        }}
                                        style={{ minHeight: '42px', WebkitAppearance: 'none' }}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Funções * (Selecione uma ou mais)
                                    </label>
                                    <div className="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 max-h-40 overflow-y-auto">
                                        {availableRoles.map((role) => {
                                            const isChecked = newMemberData.funcoes.includes(role);
                                            return (
                                                <label key={role} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewMemberData({
                                                                        ...newMemberData,
                                                                        funcoes: [...newMemberData.funcoes, role]
                                                                    });
                                                                } else {
                                                                    setNewMemberData({
                                                                        ...newMemberData,
                                                                        funcoes: newMemberData.funcoes.filter(f => f !== role)
                                                                    });
                                                                }
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
                                                            isChecked 
                                                                ? 'bg-gray-800 border-gray-800 dark:bg-white dark:border-white' 
                                                                : 'bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-500'
                                                        }`}>
                                                            {isChecked && (
                                                                <X className="w-4 h-4 text-white dark:text-gray-800" strokeWidth={3} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {newMemberData.funcoes.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">Selecione pelo menos uma função</p>
                                    )}
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
                                descricao: '',
                                alimentacao: false,
                                comidas: []
                            });
                            setNovaComida('');
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Data *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={newEventData.data?.split('T')[0] || ''}
                                            onChange={(e) => {
                                                const time = newEventData.data?.split('T')[1] || '19:00';
                                                setNewEventData({ ...newEventData, data: `${e.target.value}T${time}` });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Hora *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={newEventData.data?.split('T')[1] || '19:00'}
                                            onChange={(e) => {
                                                const date = newEventData.data?.split('T')[0] || format(new Date(), 'yyyy-MM-dd');
                                                setNewEventData({ ...newEventData, data: `${date}T${e.target.value}` });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
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

                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEventData.alimentacao || false}
                                            onChange={(e) => setNewEventData({ ...newEventData, alimentacao: e.target.checked, comidas: e.target.checked ? (newEventData.comidas || []) : [] })}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alimentação</span>
                                    </label>
                                </div>

                                {newEventData.alimentacao && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={novaComida}
                                                onChange={(e) => setNovaComida(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (novaComida.trim()) {
                                                            setNewEventData({
                                                                ...newEventData,
                                                                comidas: [...(newEventData.comidas || []), { nome: novaComida.trim(), responsavel: null }]
                                                            });
                                                            setNovaComida('');
                                                        }
                                                    }
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="Digite uma comida (ex: Refrigerante, Salgados...)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (novaComida.trim()) {
                                                        setNewEventData({
                                                            ...newEventData,
                                                            comidas: [...(newEventData.comidas || []), { nome: novaComida.trim(), responsavel: null }]
                                                        });
                                                        setNovaComida('');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {newEventData.comidas && newEventData.comidas.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Comidas do evento:</p>
                                                <div className="space-y-2">
                                                    {newEventData.comidas.map((comida, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{comida.nome}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setNewEventData({
                                                                        ...newEventData,
                                                                        comidas: (newEventData.comidas || []).filter((_, i) => i !== index)
                                                                    });
                                                                }}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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

                                {/* Modal de Edição de Evento */}
            {showEditEventModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editar Evento</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (onEditEvent && selectedEvent) {
                                onEditEvent(selectedEvent.id, editEventData);
                            }
                            setShowEditEventModal(false);
                            setSelectedEvent(null);
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome do Evento *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editEventData.nome}
                                        onChange={(e) => setEditEventData({ ...editEventData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Data *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={editEventData.data?.split('T')[0] || ''}
                                            onChange={(e) => {
                                                const time = editEventData.data?.split('T')[1] || '19:00';
                                                setEditEventData({ ...editEventData, data: `${e.target.value}T${time}` });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Hora *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={editEventData.data?.split('T')[1] || '19:00'}
                                            onChange={(e) => {
                                                const date = editEventData.data?.split('T')[0] || format(new Date(), 'yyyy-MM-dd');
                                                setEditEventData({ ...editEventData, data: `${date}T${e.target.value}` });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Local
                                    </label>
                                    <input
                                        type="text"
                                        value={editEventData.local}
                                        onChange={(e) => setEditEventData({ ...editEventData, local: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={editEventData.descricao}
                                        onChange={(e) => setEditEventData({ ...editEventData, descricao: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editEventData.alimentacao || false}
                                            onChange={(e) => setEditEventData({ ...editEventData, alimentacao: e.target.checked, comidas: e.target.checked ? (editEventData.comidas || []) : [] })}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alimentação</span>
                                    </label>
                                </div>

                                {editEventData.alimentacao && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={novaComidaEdit}
                                                onChange={(e) => setNovaComidaEdit(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (novaComidaEdit.trim()) {
                                                            setEditEventData({
                                                                ...editEventData,
                                                                comidas: [...(editEventData.comidas || []), { nome: novaComidaEdit.trim(), responsavel: null }]
                                                            });
                                                            setNovaComidaEdit('');
                                                        }
                                                    }
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="Digite uma comida (ex: Refrigerante, Salgados...)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (novaComidaEdit.trim()) {
                                                        setEditEventData({
                                                            ...editEventData,
                                                            comidas: [...(editEventData.comidas || []), { nome: novaComidaEdit.trim(), responsavel: null }]
                                                        });
                                                        setNovaComidaEdit('');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {editEventData.comidas && editEventData.comidas.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Comidas do evento:</p>
                                                <div className="space-y-2">
                                                    {editEventData.comidas.map((comida, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                                            <div>
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{comida.nome}</span>
                                                                {comida.responsavel && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                                        ({comida.responsavel})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    console.log('Deletando comida:', comida);
                                                                    // Se tem ID, deletar do banco de dados
                                                                    if (comida.id) {
                                                                        try {
                                                                            console.log('Deletando alimentação do BD com ID:', comida.id);
                                                                            await deleteEventFood(comida.id);
                                                                            console.log('Alimentação deletada com sucesso');
                                                                        } catch (error) {
                                                                            console.error('Erro ao deletar alimentação:', error);
                                                                            alert(`Erro ao deletar alimentação: ${error.message || error}`);
                                                                            return;
                                                                        }
                                                                    } else {
                                                                        console.log('Comida sem ID, apenas removendo da lista local');
                                                                    }
                                                                    
                                                                    // Remover da lista local
                                                                    setEditEventData({
                                                                        ...editEventData,
                                                                        comidas: (editEventData.comidas || []).filter((_, i) => i !== index)
                                                                    });
                                                                }}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditEventModal(false);
                                        setShowEventDetailsModal(true);
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

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteEventModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirmar Exclusão</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Tem certeza que deseja deletar o evento <strong>{selectedEvent.nome}</strong>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowDeleteEventModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (onDeleteEvent && selectedEvent) {
                                        onDeleteEvent(selectedEvent.id);
                                    }
                                    setShowDeleteEventModal(false);
                                    setShowEventDetailsModal(false);
                                    setSelectedEvent(null);
                                    setEventFoodsFromDB([]);
                                    setEventParticipants([]);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Deletar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEventDetailsModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{selectedEvent.nome}</h3>
                            <button
                                onClick={() => {
                                    setShowEventDetailsModal(false);
                                    setSelectedEvent(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{format(new Date(selectedEvent.data), "EEEE, dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>

                            {selectedEvent.local && (
                                <div className="flex items-center text-gray-700 dark:text-gray-300">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{selectedEvent.local}</span>
                                </div>
                            )}

                            {selectedEvent.descricao && (
                                <div className="text-gray-700 dark:text-gray-300">
                                    <p className="font-medium mb-1">Descrição:</p>
                                    <p className="text-sm">{selectedEvent.descricao}</p>
                                </div>
                            )}

                            {/* Participantes Inscritos */}
                            {eventParticipants.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <button
                                        onClick={() => setShowParticipantsSection(!showParticipantsSection)}
                                        className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Participantes Inscritos ({eventParticipants.length})
                                            </h4>
                                        </div>
                                        {showParticipantsSection ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        )}
                                    </button>
                                    
                                    {showParticipantsSection && (
                                        <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {eventParticipants.map((participant) => (
                                                    <div 
                                                        key={participant.id} 
                                                        className="flex items-center p-2 bg-white dark:bg-gray-700 rounded text-sm"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {participant.member ? participant.member.nome : 'Nome não disponível'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedEvent.alimentacao && eventFoodsFromDB.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <button
                                        onClick={() => setShowFoodsSection(!showFoodsSection)}
                                        className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <Gift className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Alimentações do Evento ({eventFoodsFromDB.length})
                                            </h4>
                                        </div>
                                        {showFoodsSection ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        )}
                                    </button>

                                    {showFoodsSection && (
                                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                                                Distribuição de alimentos:
                                            </p>
                                            <div className="space-y-2">
                                                {eventFoodsFromDB.map((food) => (
                                                    <div key={food.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-700 rounded">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{food.nome}</span>
                                                        <span className={`px-3 py-1 rounded ${
                                                            food.member 
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                        }`}>
                                                            {food.member ? food.member.nome : 'Aguardando'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-blue-700 dark:text-blue-400">Total de itens:</span>
                                                    <span className="font-semibold text-blue-800 dark:text-blue-300">{eventFoodsFromDB.length}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-blue-700 dark:text-blue-400">Confirmados:</span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                                        {eventFoodsFromDB.filter(f => f.member).length}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-blue-700 dark:text-blue-400">Pendentes:</span>
                                                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                                        {eventFoodsFromDB.filter(f => !f.member).length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between mt-6">
                            <div className="flex space-x-2">
                                <button
                                    onClick={async () => {
                                        // Carregar alimentações do evento
                                        const foods = await getEventFoods(selectedEvent.id);
                                        
                                        setEditEventData({
                                            nome: selectedEvent.nome,
                                            data: selectedEvent.data,
                                            local: selectedEvent.local || '',
                                            descricao: selectedEvent.descricao || '',
                                            alimentacao: selectedEvent.alimentacao || false,
                                            comidas: foods.map(f => ({ id: f.id, nome: f.nome, responsavel: f.member?.nome || null }))
                                        });
                                        setShowEditEventModal(true);
                                        setShowEventDetailsModal(false);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Editar</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteEventModal(true);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Deletar</span>
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEventDetailsModal(false);
                                    setSelectedEvent(null);
                                    setEventFoodsFromDB([]);
                                    setEventParticipants([]);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Fechar
                            </button>
                        </div>
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
                                    Artista
                                </label>
                                <input
                                    type="text"
                                    value={newMusicData.artista}
                                    onChange={(e) => setNewMusicData({ ...newMusicData, artista: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Ex: Isaías Saad"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Link do YouTube
                                </label>
                                <input
                                    type="url"
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
                                        onChange={(e) => {
                                            const idade = calculateAge(e.target.value);
                                            setEditMemberData({ 
                                                ...editMemberData, 
                                                nascimento: e.target.value,
                                                idade: idade !== null ? idade.toString() : ''
                                            });
                                        }}
                                        style={{ minHeight: '42px', WebkitAppearance: 'none' }}
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
                                        readOnly
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
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Funções * (Selecione uma ou mais)
                                    </label>
                                    <div className="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 max-h-40 overflow-y-auto">
                                        {availableRoles.map((role) => {
                                            const isChecked = editMemberData.funcoes?.includes(role) || false;
                                            return (
                                                <label key={role} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                const funcoes = editMemberData.funcoes || [];
                                                                if (e.target.checked) {
                                                                    setEditMemberData({
                                                                        ...editMemberData,
                                                                        funcoes: [...funcoes, role]
                                                                    });
                                                                } else {
                                                                    setEditMemberData({
                                                                        ...editMemberData,
                                                                        funcoes: funcoes.filter(f => f !== role)
                                                                    });
                                                                }
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
                                                            isChecked 
                                                                ? 'bg-gray-800 border-gray-800 dark:bg-white dark:border-white' 
                                                                : 'bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-500'
                                                        }`}>
                                                            {isChecked && (
                                                                <X className="w-4 h-4 text-white dark:text-gray-800" strokeWidth={3} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {(!editMemberData.funcoes || editMemberData.funcoes.length === 0) && (
                                        <p className="text-xs text-red-500 mt-1">Selecione pelo menos uma função</p>
                                    )}
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

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (onAddFamily) {
                                try {
                                    const familyWithId = {
                                        ...newFamilyData,
                                        id: generateFamilyId(newFamilyData)
                                    };
                                    await onAddFamily(familyWithId);
                                    
                                    // Só fechar o modal se não houver erro
                                    setNewFamilyData({
                                        nome: '',
                                        descricao: '',
                                        membrosIds: []
                                    });
                                    setFamilyMemberSearch('');
                                    setShowFamilyModal(false);
                                } catch (error) {
                                    // Erro já foi tratado no handleAddFamily
                                    console.error('Erro no formulário:', error);
                                }
                            }
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
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                                        <Users className="w-4 h-4 mr-2" />
                                        Adicionar Membros à Família ({newFamilyData.membrosIds.length} selecionados)
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowFamilyModal(false);
                                            setShowMemberModal(true);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Novo Membro
                                    </button>
                                </div>
                                
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
                                                            <div
                                                                key={memberId}
                                                                onClick={() => toggleMemberInFamily(memberId)}
                                                                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                                                    isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => e.stopPropagation()}
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
                                                            </div>
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
                                const familyWithId = {
                                    ...editFamilyData,
                                    id: selectedFamily.id || generateFamilyId(selectedFamily)
                                };
                                onEditFamily(selectedFamily.id || selectedFamily.nome, familyWithId);
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

                                {/* Membros já cadastrados */}
                                {editFamilyData.membrosIds.length > 0 && (
                                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-2">
                                            Membros cadastrados nesta família:
                                        </p>
                                        <div className="space-y-2">
                                            {editFamilyData.membrosIds.map((memberId) => {
                                                const member = members.find((m, idx) => generateMemberId(m, idx) === memberId);
                                                if (!member) return null;
                                                const age = calculateAge(member.nascimento);
                                                const initials = getInitials(member.nome);
                                                
                                                return (
                                                    <div key={memberId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-xs">
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {member.nome}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {member.genero && <span className="capitalize">{member.genero}</span>}
                                                                    {age && <span> • {age} anos</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleMemberInEditFamily(memberId)}
                                                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                            title="Remover da família"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
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
                                                            <div
                                                                key={memberId}
                                                                onClick={() => toggleMemberInEditFamily(memberId)}
                                                                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                                                    isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => e.stopPropagation()}
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
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={!editFamilyData.nome.trim() || editFamilyData.membrosIds.length === 0}
                                    className="sm:w-auto w-full px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                >
                                    Salvar Alterações ({editFamilyData.membrosIds.length})
                                </button>
                                <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditFamilyModal(false);
                                            setSelectedFamily(null);
                                        }}
                                        className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-medium text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm(`Tem certeza que deseja deletar a família "${selectedFamily.nome}"? Isso não deletará os membros, apenas a família.`)) {
                                                if (onEditFamily) {
                                                    // Enviar requisição para deletar a família removendo todos os membros
                                                    onEditFamily(selectedFamily.id || selectedFamily.nome, {
                                                        id: selectedFamily.id || generateFamilyId(selectedFamily),
                                                        nome: selectedFamily.nome,
                                                        descricao: '',
                                                        membrosIds: []
                                                    });
                                                }
                                                setShowEditFamilyModal(false);
                                                setSelectedFamily(null);
                                                setEditFamilyData({
                                                    nome: '',
                                                    descricao: '',
                                                    membrosIds: []
                                                });
                                            }
                                        }}
                                        className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Deletar Família</span>
                                    </button>
                                </div>
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
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const diaconosIds = members
                                        .filter(m => newEscalaData.diaconosSelecionados.includes(m.id || `diacono-${members.indexOf(m)}`))
                                        .map(m => m.id);
                                    
                                    const escalaData = {
                                        ministerio: 'diaconia',
                                        tipo: newEscalaData.categoria || 'culto',
                                        data: newEscalaData.data,
                                        horario: newEscalaData.horario,
                                        membros_ids: diaconosIds
                                    };
                                    
                                    console.log('Criando escala de diaconia:', escalaData);
                                    await createMinistrySchedule(escalaData);
                                    
                                    // Recarregar escalas
                                    const schedules = await getMinistrySchedules('diaconia');
                                    setEscalas(schedules);
                                    
                                    setShowEscalaModal(false);
                                    setNewEscalaData({
                                        categoria: 'culto',
                                        data: format(new Date(), 'yyyy-MM-dd'),
                                        horario: '19:00',
                                        diaconosSelecionados: []
                                    });
                                } catch (error) {
                                    console.error('Erro ao criar escala de diaconia:', error);
                                    alert('Erro ao criar escala. Tente novamente.');
                                }
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Categoria
                                        </label>
                                        <select
                                            value={newEscalaData.categoria}
                                            onChange={(e) => setNewEscalaData({ ...newEscalaData, categoria: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="culto">Culto</option>
                                            <option value="limpeza">Limpeza</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {newEscalaData.categoria === 'culto' ? 'Data do Culto' : 'Data da Limpeza'}
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
                                                {newEscalaData.categoria === 'culto' ? 'Horário do Culto' : 'Horário da Limpeza'}
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
                                            {members.filter(m => {
                                                const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                                return funcoes.some(f => f === 'diácono' || f === 'diaconia' || f === 'líder da diaconia' || f === 'lider da diaconia');
                                            }).map((diacono, index) => {
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
                                        onClick={() => {
                                            setNewEscalaData({
                                                categoria: 'culto',
                                                data: format(new Date(), 'yyyy-MM-dd'),
                                                horario: '19:00',
                                                diaconosSelecionados: []
                                            });
                                            setShowEscalaModal(false);
                                        }}
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
                                    Músicos Ativos ({members.filter(m => {
                                        const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                        return funcoes.some(f => f === 'músico' || f === 'líder de louvor' || f === 'louvor');
                                    }).length})
                                </h2>
                                <button
                                    onClick={() => setShowMusicosModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {members.filter(m => {
                                const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                return funcoes.some(f => f === 'músico' || f === 'líder de louvor' || f === 'louvor');
                            }).length === 0 ? (
                                <div className="text-center py-12">
                                    <Music className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum músico cadastrado ainda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.filter(m => {
                                        const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                        return funcoes.some(f => f === 'músico' || f === 'líder de louvor' || f === 'louvor');
                                    }).map((musico, index) => {
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
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                
                                try {
                                    // Preparar array de músicos para a tabela de junção
                                    const musicos = Object.entries(newEscalaLouvorData.instrumentos)
                                        .filter(([_, musicoId]) => musicoId)
                                        .map(([instrumento, musicoId]) => ({
                                            id: musicoId,
                                            instrumento: instrumento
                                        }));
                                    
                                    if (selectedEscala) {
                                        // Editar escala existente
                                        await updateMinistrySchedule(selectedEscala.id, {
                                            ministerio: 'louvor',
                                            data: newEscalaLouvorData.data,
                                            horario: newEscalaLouvorData.horario,
                                            tipo: newEscalaLouvorData.tipo,
                                            musicas: newEscalaLouvorData.musicas,
                                            musicos: musicos
                                        });
                                        
                                        alert('Escala atualizada com sucesso!');
                                    } else {
                                        // Criar nova escala
                                        await createMinistrySchedule({
                                            ministerio: 'louvor',
                                            data: newEscalaLouvorData.data,
                                            horario: newEscalaLouvorData.horario,
                                            tipo: newEscalaLouvorData.tipo,
                                            musicas: newEscalaLouvorData.musicas,
                                            musicos: musicos
                                        });
                                        
                                        alert('Escala criada com sucesso!');
                                    }
                                    
                                    // Recarregar escalas
                                    const schedules = await getMinistrySchedules('louvor');
                                    setEscalasLouvor(schedules);
                                    
                                    // Resetar formulário
                                    setNewEscalaLouvorData({
                                        tipo: 'culto',
                                        data: format(new Date(), 'yyyy-MM-dd'),
                                        horario: '19:00',
                                        musicas: [],
                                        instrumentos: {}
                                    });
                                    
                                    setSelectedEscala(null);
                                    setShowEscalaLouvorModal(false);
                                } catch (error) {
                                    console.error('Erro ao salvar escala:', error);
                                    alert('Erro ao salvar escala');
                                }
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
                                            Músicas ({newEscalaLouvorData.musicas.length}/5)
                                        </h3>
                                        
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                value={newMusicaEscala}
                                                onChange={(e) => setNewMusicaEscala(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (newMusicaEscala.trim() && newEscalaLouvorData.musicas.length < 5) {
                                                            setNewEscalaLouvorData({
                                                                ...newEscalaLouvorData,
                                                                musicas: [...newEscalaLouvorData.musicas, newMusicaEscala.trim()]
                                                            });
                                                            setNewMusicaEscala('');
                                                        }
                                                    }
                                                }}
                                                placeholder="Nome da música..."
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                                                disabled={newEscalaLouvorData.musicas.length >= 5}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (newMusicaEscala.trim() && newEscalaLouvorData.musicas.length < 5) {
                                                        setNewEscalaLouvorData({
                                                            ...newEscalaLouvorData,
                                                            musicas: [...newEscalaLouvorData.musicas, newMusicaEscala.trim()]
                                                        });
                                                        setNewMusicaEscala('');
                                                    }
                                                }}
                                                disabled={!newMusicaEscala.trim() || newEscalaLouvorData.musicas.length >= 5}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {newEscalaLouvorData.musicas.length > 0 && (
                                            <div className="space-y-2">
                                                {newEscalaLouvorData.musicas.map((musica, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                                <Music className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{musica}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setNewEscalaLouvorData({
                                                                    ...newEscalaLouvorData,
                                                                    musicas: newEscalaLouvorData.musicas.filter((_, i) => i !== idx)
                                                                });
                                                            }}
                                                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                                                {members.filter(m => {
                                                                    const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                                                    return funcoes.some(f => f === 'músico' || f === 'líder de louvor' || f === 'louvor');
                                                                }).map((musico, index) => {
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

                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (selectedEscala && confirm('Deseja realmente excluir esta escala?')) {
                                                try {
                                                    await deleteMinistrySchedule(selectedEscala.id, 'louvor');
                                                    
                                                    // Recarregar escalas
                                                    const schedules = await getMinistrySchedules('louvor');
                                                    setEscalasLouvor(schedules);
                                                    
                                                    setNewEscalaLouvorData({
                                                        tipo: 'culto',
                                                        data: format(new Date(), 'yyyy-MM-dd'),
                                                        horario: '19:00',
                                                        musicas: [],
                                                        instrumentos: {}
                                                    });
                                                    setSelectedEscala(null);
                                                    setShowEscalaLouvorModal(false);
                                                    
                                                    alert('Escala excluída com sucesso!');
                                                } catch (error) {
                                                    console.error('Erro ao excluir escala:', error);
                                                    alert('Erro ao excluir escala');
                                                }
                                            }
                                        }}
                                        className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 ${!selectedEscala ? 'opacity-0 pointer-events-none' : ''}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </button>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewEscalaLouvorData({
                                                    tipo: 'culto',
                                                    data: format(new Date(), 'yyyy-MM-dd'),
                                                    horario: '19:00',
                                                    musicas: [],
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
                                            {selectedEscala ? 'Salvar Alterações' : 'Criar Escala'} ({Object.values(newEscalaLouvorData.instrumentos).filter(Boolean).length} {Object.values(newEscalaLouvorData.instrumentos).filter(Boolean).length === 1 ? 'músico' : 'músicos'})
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Visualizar Escala */}
            {showViewEscalaModal && selectedEscala && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedEscala.tipo === 'culto' ? 'Culto' : 'Ensaio'}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {format(parseISO(selectedEscala.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedEscala.horario}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowViewEscalaModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedEscala.musicas && selectedEscala.musicas.length > 0 && (
                                    <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Músicas ({selectedEscala.musicas.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedEscala.musicas.map((musica, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                        <Music className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {typeof musica === 'string' ? musica : musica.nome}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Músicos Escalados ({selectedEscala.musicos.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedEscala.musicos.map((musico, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                                        {getInitials(musico.nome)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{musico.nome}</p>
                                                        {musico.telefone && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{musico.telefone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {musico.instrumento && (
                                                    <span className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full font-medium">
                                                        {musico.instrumento}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => {
                                            setNewEscalaLouvorData({
                                                tipo: selectedEscala.tipo,
                                                data: selectedEscala.data,
                                                horario: selectedEscala.horario,
                                                musicas: selectedEscala.musicas || [],
                                                instrumentos: selectedEscala.musicos.reduce((acc, musico) => {
                                                    acc[musico.instrumento] = musico.id || `musico-${members.indexOf(musico)}`;
                                                    return acc;
                                                }, {})
                                            });
                                            setNewMusicaEscala('');
                                            setShowViewEscalaModal(false);
                                            setShowEscalaLouvorModal(true);
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 inline-flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar Escala
                                    </button>
                                    <button
                                        onClick={() => setShowViewEscalaModal(false)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
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

            {/* Modal Professores */}
            {showProfessoresModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-7 h-7 text-blue-600" />
                                    Professores Kids ({members.filter(m => m.funcoes?.includes('professor kids') || m.funcoes?.includes('lider kids')).length})
                                </h2>
                                <button
                                    onClick={() => setShowProfessoresModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {members.filter(m => m.funcoes?.includes('professor kids') || m.funcoes?.includes('lider kids')).length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum professor cadastrado ainda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.filter(m => m.funcoes?.includes('professor kids') || m.funcoes?.includes('lider kids')).map((professor, index) => {
                                        const age = calculateAge(professor.nascimento);
                                        
                                        return (
                                            <div 
                                                key={professor.id || index} 
                                                className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                                                        {getInitials(professor.nome)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{professor.nome}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {professor.funcoes?.includes('lider kids') ? 'Líder Kids' : 'Professor Kids'}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        professor.funcoes?.includes('lider kids') 
                                                            ? 'bg-pink-600 text-white' 
                                                            : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                    }`}>
                                                        {professor.funcoes?.includes('lider kids') ? 'Líder' : 'Professor'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    {professor.telefone && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{professor.telefone}</span>
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

            {/* Modal Crianças */}
            {showCriancasModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Baby className="w-7 h-7 text-pink-600" />
                                    Crianças Cadastradas ({members.filter(m => {
                                        const age = calculateAge(m.nascimento);
                                        return age !== null && age <= 12;
                                    }).length})
                                </h2>
                                <button
                                    onClick={() => setShowCriancasModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {members.filter(m => {
                                const age = calculateAge(m.nascimento);
                                return age !== null && age <= 12;
                            }).length === 0 ? (
                                <div className="text-center py-12">
                                    <Baby className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Nenhuma criança cadastrada ainda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.filter(m => {
                                        const age = calculateAge(m.nascimento);
                                        return age !== null && age <= 12;
                                    }).map((crianca, index) => {
                                        const age = calculateAge(crianca.nascimento);
                                        
                                        return (
                                            <div 
                                                key={crianca.id || index} 
                                                className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="h-12 w-12 rounded-full bg-pink-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                                                        {getInitials(crianca.nome)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{crianca.nome}</h4>
                                                        {crianca.familia && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {crianca.familia}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200">
                                                        {age} {age === 1 ? 'ano' : 'anos'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    {crianca.telefone && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{crianca.telefone}</span>
                                                        </div>
                                                    )}
                                                    {crianca.nascimento && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{format(parseISO(crianca.nascimento), "dd/MM/yyyy", { locale: ptBR })}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Users className="w-4 h-4" />
                                                        <span className="capitalize">{crianca.genero}</span>
                                                    </div>
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

            {/* Modal Jovens */}
            {showJovensModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-7 h-7 text-indigo-600" />
                                    Jovens Cadastrados ({members.filter(m => {
                                        const age = calculateAge(m.nascimento);
                                        return (age !== null && age >= 13 && age <= 30) || (m.funcao === 'jovem');
                                    }).length})
                                </h2>
                                <button
                                    onClick={() => setShowJovensModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {members.filter(m => {
                                const age = calculateAge(m.nascimento);
                                return (age !== null && age >= 13 && age <= 30) || (m.funcao === 'jovem');
                            }).length === 0 ? (
                                <div className="text-center py-12">
                                    <Sparkles className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum jovem cadastrado ainda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.filter(m => {
                                        const age = calculateAge(m.nascimento);
                                        return (age !== null && age >= 13 && age <= 30) || (m.funcao === 'jovem');
                                    }).map((jovem, index) => {
                                        const age = calculateAge(jovem.nascimento);
                                        let categoria = '';
                                        let corCategoria = '';
                                        
                                        if (age >= 13 && age <= 18) {
                                            categoria = 'Adolescente';
                                            corCategoria = 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
                                        } else if (age >= 19 && age <= 24) {
                                            categoria = 'Jovem';
                                            corCategoria = 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200';
                                        } else {
                                            categoria = 'Jovem Adulto';
                                            corCategoria = 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200';
                                        }
                                        
                                        return (
                                            <div 
                                                key={jovem.id || index} 
                                                className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                                                        {getInitials(jovem.nome)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{jovem.nome}</h4>
                                                        {jovem.familia && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {jovem.familia}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${corCategoria}`}>
                                                        {categoria}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Users className="w-4 h-4" />
                                                        <span>{age} anos</span>
                                                    </div>
                                                    {jovem.telefone && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{jovem.telefone}</span>
                                                        </div>
                                                    )}
                                                    {jovem.nascimento && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{format(parseISO(jovem.nascimento), "dd/MM/yyyy", { locale: ptBR })}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Users className="w-4 h-4" />
                                                        <span className="capitalize">{jovem.genero}</span>
                                                    </div>
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

            {/* Modal Nova Escala de Professores */}
            {showEscalaProfessoresModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-7 h-7 text-pink-600" />
                                    Nova Escala de Professores
                                </h2>
                                <button
                                onClick={() => {
                                setShowEscalaProfessoresModal(false);
                                setNewEscalaProfessoresData({
                                turmas: [],
                                data: format(new Date(), 'yyyy-MM-dd'),
                                horario: '09:00',
                                    professoresSelecionados: []
                                    });
                                }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (newEscalaProfessoresData.turmas.length === 0) {
                                    alert('Selecione pelo menos uma turma!');
                                    return;
                                }
                                if (newEscalaProfessoresData.professoresSelecionados.length === 0) {
                                    alert('Selecione pelo menos um professor!');
                                    return;
                                }
                                
                                try {
                                    // Salvar no Supabase
                                    const scheduleData = {
                                        ministerio: 'kids',
                                        data: newEscalaProfessoresData.data,
                                        horario: newEscalaProfessoresData.horario,
                                        descricao: `Turmas: ${newEscalaProfessoresData.turmas.join(', ')}`,
                                        membros_ids: newEscalaProfessoresData.professoresSelecionados
                                    };
                                    
                                    await createMinistrySchedule(scheduleData);
                                    
                                    // Recarregar escalas do Supabase
                                    const updatedSchedules = await getMinistrySchedules('kids');
                                    setEscalasProfessores(updatedSchedules);
                                    
                                    setShowEscalaProfessoresModal(false);
                                    setNewEscalaProfessoresData({
                                        turmas: [],
                                        data: format(new Date(), 'yyyy-MM-dd'),
                                        horario: '09:00',
                                        professoresSelecionados: []
                                    });
                                } catch (error) {
                                    console.error('Erro ao criar escala:', error);
                                    alert('Erro ao criar escala. Tente novamente.');
                                }
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selecione as Turmas
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Pequenos', 'Grandes'].map((turma) => {
                                                const isSelected = newEscalaProfessoresData.turmas.includes(turma);
                                                return (
                                                    <div 
                                                        key={turma}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setNewEscalaProfessoresData({
                                                                    ...newEscalaProfessoresData,
                                                                    turmas: newEscalaProfessoresData.turmas.filter(t => t !== turma)
                                                                });
                                                            } else {
                                                                setNewEscalaProfessoresData({
                                                                    ...newEscalaProfessoresData,
                                                                    turmas: [...newEscalaProfessoresData.turmas, turma]
                                                                });
                                                            }
                                                        }}
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                                                            isSelected 
                                                                ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/30' 
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-medium text-gray-900 dark:text-white">{turma}</span>
                                                            {isSelected && (
                                                                <div className="h-5 w-5 rounded-full bg-pink-600 flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Data
                                            </label>
                                            <input
                                                type="date"
                                                value={newEscalaProfessoresData.data}
                                                onChange={(e) => setNewEscalaProfessoresData({ ...newEscalaProfessoresData, data: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Horário
                                            </label>
                                            <input
                                                type="time"
                                                value={newEscalaProfessoresData.horario}
                                                onChange={(e) => setNewEscalaProfessoresData({ ...newEscalaProfessoresData, horario: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Selecione os Professores ({newEscalaProfessoresData.professoresSelecionados.length} selecionados)
                                        </h3>
                                        
                                        {members.filter(m => m.funcoes?.includes('professor kids') || m.funcoes?.includes('lider kids')).length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400">Nenhum professor cadastrado.</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                    Cadastre membros com função "Professor Kids" ou "Líder Kids"
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {members.filter(m => m.funcoes?.includes('professor kids') || m.funcoes?.includes('lider kids')).map((professor) => {
                                                    const isSelected = newEscalaProfessoresData.professoresSelecionados.includes(professor.id);
                                                    const age = calculateAge(professor.nascimento);
                                                    
                                                    return (
                                                        <div 
                                                            key={professor.id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setNewEscalaProfessoresData({
                                                                        ...newEscalaProfessoresData,
                                                                        professoresSelecionados: newEscalaProfessoresData.professoresSelecionados.filter(id => id !== professor.id)
                                                                    });
                                                                } else {
                                                                    setNewEscalaProfessoresData({
                                                                        ...newEscalaProfessoresData,
                                                                        professoresSelecionados: [...newEscalaProfessoresData.professoresSelecionados, professor.id]
                                                                    });
                                                                }
                                                            }}
                                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                                isSelected 
                                                                    ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/30' 
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold">
                                                                    {getInitials(professor.nome)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                                            {professor.nome}
                                                                        </h4>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                            professor.funcoes?.includes('lider kids') 
                                                                                ? 'bg-pink-600 text-white' 
                                                                                : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                                        }`}>
                                                                            {professor.funcoes?.includes('lider kids') ? 'Líder' : 'Professor'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                        {professor.telefone && <span>{professor.telefone}</span>}
                                                                        {age && <span>• {age} anos</span>}
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="h-6 w-6 rounded-full bg-pink-600 flex items-center justify-center">
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
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

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEscalaProfessoresModal(false);
                                            setNewEscalaProfessoresData({
                                                turmas: [],
                                                data: format(new Date(), 'yyyy-MM-dd'),
                                                horario: '09:00',
                                                professoresSelecionados: []
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={newEscalaProfessoresData.professoresSelecionados.length === 0}
                                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Criar Escala ({newEscalaProfessoresData.professoresSelecionados.length} {newEscalaProfessoresData.professoresSelecionados.length === 1 ? 'professor' : 'professores'})
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalhes da Escala de Professores */}
            {showDetalhesEscalaProfessoresModal && selectedEscalaProfessores && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-7 h-7 text-pink-600" />
                                    Detalhes da Escala
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowDetalhesEscalaProfessoresModal(false);
                                        setSelectedEscalaProfessores(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Data e Horário */}
                                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Calendar className="w-8 h-8 text-pink-600" />
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {format(parseISO(selectedEscalaProfessores.data), "dd/MM/yyyy", { locale: ptBR })}
                                            </h3>
                                            <p className="text-lg text-gray-600 dark:text-gray-400 capitalize">
                                                {format(parseISO(selectedEscalaProfessores.data), "EEEE", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-pink-600" />
                                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                                            {selectedEscalaProfessores.horario}
                                        </span>
                                    </div>
                                </div>

                                {/* Turmas */}
                                {selectedEscalaProfessores.descricao?.includes('Turmas:') && (() => {
                                    const turmas = selectedEscalaProfessores.descricao.replace('Turmas: ', '').split(', ');
                                    return (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Baby className="w-5 h-5 text-pink-600" />
                                                Turmas
                                            </h3>
                                            <div className="flex flex-wrap gap-3">
                                                {turmas.map((turma, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`px-6 py-3 rounded-lg text-white font-medium text-lg ${
                                                            turma === 'Pequenos' ? 'bg-blue-500' : 'bg-purple-600'
                                                        }`}
                                                    >
                                                        {turma}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Professores */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-pink-600" />
                                        Professores Escalados ({(selectedEscalaProfessores.membros_ids || selectedEscalaProfessores.professoresSelecionados || []).length})
                                    </h3>
                                    <div className="space-y-3">
                                        {(selectedEscalaProfessores.membros_ids || selectedEscalaProfessores.professoresSelecionados || []).map((profId, i) => {
                                            const prof = members.find(m => m.id === profId);
                                            if (!prof) return null;
                                            const age = calculateAge(prof.nascimento);
                                            
                                            return (
                                                <div 
                                                    key={i} 
                                                    className="p-4 rounded-lg border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold text-lg">
                                                            {getInitials(prof.nome)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                                    {prof.nome}
                                                                </h4>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    prof.funcao === 'lider kids' 
                                                                        ? 'bg-pink-600 text-white' 
                                                                        : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                                }`}>
                                                                    {prof.funcao === 'lider kids' ? 'Líder' : 'Professor'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                                {prof.telefone && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Phone className="w-4 h-4" />
                                                                        <span>{prof.telefone}</span>
                                                                    </div>
                                                                )}
                                                                {age && <span>• {age} anos</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const turmas = selectedEscalaProfessores.descricao?.includes('Turmas:')
                                                ? selectedEscalaProfessores.descricao.replace('Turmas: ', '').split(', ')
                                                : (selectedEscalaProfessores.turmas || []);
                                            
                                            setEditEscalaProfessoresData({
                                                turmas: turmas,
                                                data: selectedEscalaProfessores.data,
                                                horario: selectedEscalaProfessores.horario,
                                                professoresSelecionados: selectedEscalaProfessores.membros_ids || selectedEscalaProfessores.professoresSelecionados || []
                                            });
                                            setShowDetalhesEscalaProfessoresModal(false);
                                            setShowEditEscalaProfessoresModal(true);
                                        }}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar Escala
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Tem certeza que deseja deletar esta escala?')) {
                                                try {
                                                    await deleteMinistrySchedule(selectedEscalaProfessores.id);
                                                    
                                                    // Recarregar escalas do Supabase
                                                    const updatedSchedules = await getMinistrySchedules('kids');
                                                    setEscalasProfessores(updatedSchedules);
                                                    
                                                    setShowDetalhesEscalaProfessoresModal(false);
                                                    setSelectedEscalaProfessores(null);
                                                } catch (error) {
                                                    console.error('Erro ao deletar escala:', error);
                                                    alert('Erro ao deletar escala. Tente novamente.');
                                                }
                                            }
                                        }}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Deletar
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetalhesEscalaProfessoresModal(false);
                                        setSelectedEscalaProfessores(null);
                                    }}
                                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Escala de Professores */}
            {showEditEscalaProfessoresModal && selectedEscalaProfessores && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Edit className="w-7 h-7 text-blue-600" />
                                    Editar Escala de Professores
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowEditEscalaProfessoresModal(false);
                                        setEditEscalaProfessoresData({
                                            turmas: [],
                                            data: '',
                                            horario: '',
                                            professoresSelecionados: []
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (editEscalaProfessoresData.turmas.length === 0) {
                                    alert('Selecione pelo menos uma turma!');
                                    return;
                                }
                                if (editEscalaProfessoresData.professoresSelecionados.length === 0) {
                                    alert('Selecione pelo menos um professor!');
                                    return;
                                }
                                
                                try {
                                    // Atualizar no Supabase
                                    const scheduleData = {
                                        ministerio: 'kids',
                                        data: editEscalaProfessoresData.data,
                                        horario: editEscalaProfessoresData.horario,
                                        descricao: `Turmas: ${editEscalaProfessoresData.turmas.join(', ')}`,
                                        membros_ids: editEscalaProfessoresData.professoresSelecionados
                                    };
                                    
                                    await updateMinistrySchedule(selectedEscalaProfessores.id, scheduleData);
                                    
                                    // Recarregar escalas do Supabase
                                    const updatedSchedules = await getMinistrySchedules('kids');
                                    setEscalasProfessores(updatedSchedules);
                                    
                                    setShowEditEscalaProfessoresModal(false);
                                    setSelectedEscalaProfessores(null);
                                    setEditEscalaProfessoresData({
                                        turmas: [],
                                        data: '',
                                        horario: '',
                                        professoresSelecionados: []
                                    });
                                } catch (error) {
                                    console.error('Erro ao atualizar escala:', error);
                                    alert('Erro ao atualizar escala. Tente novamente.');
                                }
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selecione as Turmas
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Pequenos', 'Grandes'].map((turma) => {
                                                const isSelected = editEscalaProfessoresData.turmas.includes(turma);
                                                return (
                                                    <div 
                                                        key={turma}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setEditEscalaProfessoresData({
                                                                    ...editEscalaProfessoresData,
                                                                    turmas: editEscalaProfessoresData.turmas.filter(t => t !== turma)
                                                                });
                                                            } else {
                                                                setEditEscalaProfessoresData({
                                                                    ...editEscalaProfessoresData,
                                                                    turmas: [...editEscalaProfessoresData.turmas, turma]
                                                                });
                                                            }
                                                        }}
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                                                            isSelected 
                                                                ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/30' 
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-medium text-gray-900 dark:text-white">{turma}</span>
                                                            {isSelected && (
                                                                <div className="h-5 w-5 rounded-full bg-pink-600 flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Data
                                            </label>
                                            <input
                                                type="date"
                                                value={editEscalaProfessoresData.data}
                                                onChange={(e) => setEditEscalaProfessoresData({ ...editEscalaProfessoresData, data: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Horário
                                            </label>
                                            <input
                                                type="time"
                                                value={editEscalaProfessoresData.horario}
                                                onChange={(e) => setEditEscalaProfessoresData({ ...editEscalaProfessoresData, horario: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Selecione os Professores ({editEscalaProfessoresData.professoresSelecionados.length} selecionados)
                                        </h3>
                                        
                                        {members.filter(m => m.funcoes?.includes('professor kids') || m.funcoes?.includes('lider kids')).length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400">Nenhum professor cadastrado.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {members.filter(m => m.funcoes?.includes('professor kids') || m.funcoes?.includes('lider kids')).map((professor) => {
                                                    const isSelected = editEscalaProfessoresData.professoresSelecionados.includes(professor.id);
                                                    const age = calculateAge(professor.nascimento);
                                                    
                                                    return (
                                                        <div 
                                                            key={professor.id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setEditEscalaProfessoresData({
                                                                        ...editEscalaProfessoresData,
                                                                        professoresSelecionados: editEscalaProfessoresData.professoresSelecionados.filter(id => id !== professor.id)
                                                                    });
                                                                } else {
                                                                    setEditEscalaProfessoresData({
                                                                        ...editEscalaProfessoresData,
                                                                        professoresSelecionados: [...editEscalaProfessoresData.professoresSelecionados, professor.id]
                                                                    });
                                                                }
                                                            }}
                                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                                isSelected 
                                                                    ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/30' 
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold">
                                                                    {getInitials(professor.nome)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                                            {professor.nome}
                                                                        </h4>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                            professor.funcoes?.includes('lider kids') 
                                                                                ? 'bg-pink-600 text-white' 
                                                                                : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                                        }`}>
                                                                            {professor.funcoes?.includes('lider kids') ? 'Líder' : 'Professor'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                        {professor.telefone && <span>{professor.telefone}</span>}
                                                                        {age && <span>• {age} anos</span>}
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="h-6 w-6 rounded-full bg-pink-600 flex items-center justify-center">
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
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

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditEscalaProfessoresModal(false);
                                            setEditEscalaProfessoresData({
                                                turmas: [],
                                                data: '',
                                                horario: '',
                                                professoresSelecionados: []
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editEscalaProfessoresData.professoresSelecionados.length === 0}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Opções da Escala de Diaconia */}
            {showEscalaOptionsModal && selectedEscalaDiaconia && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    Opções da Escala
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowEscalaOptionsModal(false);
                                        setSelectedEscalaDiaconia(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                                    {format(parseISO(selectedEscalaDiaconia.data), "EEEE - dd/MM/yyyy", { locale: ptBR })}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {selectedEscalaDiaconia.horario} • {selectedEscalaDiaconia.diaconos.length} diáconos escalados
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleEditEscalaDiaconia(selectedEscalaDiaconia)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                    Editar Escala
                                </button>
                                <button
                                    onClick={() => handleDeleteEscalaDiaconia(selectedEscalaDiaconia.id)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Deletar Escala
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEscalaOptionsModal(false);
                                        setSelectedEscalaDiaconia(null);
                                    }}
                                    className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Escala de Diaconia */}
            {showEditEscalaModal && selectedEscalaDiaconia && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-7 h-7 text-blue-600" />
                                    Editar Escala de Diaconia
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowEditEscalaModal(false);
                                        setSelectedEscalaDiaconia(null);
                                        setEditEscalaData({
                                            categoria: 'culto',
                                            data: '',
                                            horario: '19:00',
                                            diaconosSelecionados: []
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEditEscala}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Categoria
                                            </label>
                                            <select
                                                value={editEscalaData.categoria}
                                                onChange={(e) => setEditEscalaData({ ...editEscalaData, categoria: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            >
                                                <option value="culto">Culto</option>
                                                <option value="evento">Evento</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Data
                                            </label>
                                            <input
                                                type="date"
                                                value={editEscalaData.data}
                                                onChange={(e) => setEditEscalaData({ ...editEscalaData, data: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Horário
                                            </label>
                                            <input
                                                type="time"
                                                value={editEscalaData.horario}
                                                onChange={(e) => setEditEscalaData({ ...editEscalaData, horario: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Selecione os Diáconos ({editEscalaData.diaconosSelecionados.length} selecionados)
                                        </h3>
                                        
                                        {members.filter(m => m.funcao === 'diaconia' || m.funcao === 'lider da diaconia').length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400">Nenhum diácono cadastrado.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {members.filter(m => m.funcao === 'diaconia' || m.funcao === 'lider da diaconia').map((diacono) => {
                                                    const isSelected = editEscalaData.diaconosSelecionados.includes(diacono.id);
                                                    const age = calculateAge(diacono.nascimento);
                                                    
                                                    return (
                                                        <div 
                                                            key={diacono.id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setEditEscalaData({
                                                                        ...editEscalaData,
                                                                        diaconosSelecionados: editEscalaData.diaconosSelecionados.filter(id => id !== diacono.id)
                                                                    });
                                                                } else {
                                                                    setEditEscalaData({
                                                                        ...editEscalaData,
                                                                        diaconosSelecionados: [...editEscalaData.diaconosSelecionados, diacono.id]
                                                                    });
                                                                }
                                                            }}
                                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                                isSelected 
                                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' 
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                                                    {getInitials(diacono.nome)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                                            {diacono.nome}
                                                                        </h4>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                            diacono.funcao === 'lider da diaconia' 
                                                                                ? 'bg-purple-600 text-white' 
                                                                                : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                                        }`}>
                                                                            {diacono.funcao === 'lider da diaconia' ? 'Líder' : 'Diácono'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                        {diacono.telefone && <span>{diacono.telefone}</span>}
                                                                        {age && <span>• {age} anos</span>}
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
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

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditEscalaModal(false);
                                            setSelectedEscalaDiaconia(null);
                                            setEditEscalaData({
                                                categoria: 'culto',
                                                data: '',
                                                horario: '19:00',
                                                diaconosSelecionados: []
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editEscalaData.diaconosSelecionados.length === 0}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Novo Aviso */}
            {showAvisoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Bell className="w-7 h-7 text-blue-600" />
                                    Novo Aviso
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAvisoModal(false);
                                        setNewAvisoData({ titulo: '', mensagem: '', destinatarios: ['todos'] });
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const avisoData = {
                                        titulo: newAvisoData.titulo,
                                        mensagem: newAvisoData.mensagem,
                                        destinatarios: newAvisoData.destinatarios
                                    };
                                    
                                    const novoAviso = await createAviso(avisoData);
                                    
                                    const updatedAvisos = [...avisos, novoAviso];
                                    setAvisos(updatedAvisos);
                                    localStorage.setItem('avisos', JSON.stringify(updatedAvisos));
                                    setShowAvisoModal(false);
                                    setNewAvisoData({ titulo: '', mensagem: '', destinatarios: ['todos'] });
                                } catch (error) {
                                    console.error('Erro ao criar aviso:', error);
                                    alert('Erro ao criar aviso. Tente novamente.');
                                }
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Título do Aviso
                                        </label>
                                        <input
                                            type="text"
                                            value={newAvisoData.titulo}
                                            onChange={(e) => setNewAvisoData({ ...newAvisoData, titulo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Ex: Culto Especial de Jovens"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mensagem
                                        </label>
                                        <textarea
                                            value={newAvisoData.mensagem}
                                            onChange={(e) => setNewAvisoData({ ...newAvisoData, mensagem: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Digite a mensagem do aviso..."
                                            rows="4"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Destinatários
                                        </label>
                                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-700 space-y-2">
                                            <div 
                                                onClick={() => {
                                                    if (newAvisoData.destinatarios.includes('todos')) {
                                                        setNewAvisoData({ ...newAvisoData, destinatarios: [] });
                                                    } else {
                                                        setNewAvisoData({ ...newAvisoData, destinatarios: ['todos'] });
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                    newAvisoData.destinatarios.includes('todos') 
                                                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' 
                                                        : 'bg-gray-50 dark:bg-gray-600 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                    newAvisoData.destinatarios.includes('todos')
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-gray-400 dark:border-gray-500'
                                                }`}>
                                                    {newAvisoData.destinatarios.includes('todos') && (
                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-semibold">Todos os Membros</span>
                                            </div>
                                            
                                            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                                            
                                            {availableRoles.map(role => (
                                                <div 
                                                    key={role}
                                                    onClick={() => {
                                                        if (newAvisoData.destinatarios.includes('todos')) return;
                                                        
                                                        let newDest = [...newAvisoData.destinatarios];
                                                        if (newDest.includes(role)) {
                                                            newDest = newDest.filter(d => d !== role);
                                                            if (newDest.length === 0) newDest = ['todos'];
                                                        } else {
                                                            newDest = newDest.filter(d => d !== 'todos');
                                                            newDest.push(role);
                                                        }
                                                        setNewAvisoData({ ...newAvisoData, destinatarios: newDest });
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                        newAvisoData.destinatarios.includes('todos')
                                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                                                            : newAvisoData.destinatarios.includes(role)
                                                                ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                                                                : 'bg-gray-50 dark:bg-gray-600 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                        newAvisoData.destinatarios.includes(role) && !newAvisoData.destinatarios.includes('todos')
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-gray-400 dark:border-gray-500'
                                                    }`}>
                                                        {newAvisoData.destinatarios.includes(role) && !newAvisoData.destinatarios.includes('todos') && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-900 dark:text-white">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAvisoModal(false);
                                            setNewAvisoData({ titulo: '', mensagem: '', destinatarios: ['todos'] });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Enviar Aviso
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova Oficina */}
            {showOficinaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Plus className="w-7 h-7 text-indigo-600" />
                                    Nova Oficina
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowOficinaModal(false);
                                        setNewOficinaData({
                                            nome: '',
                                            descricao: '',
                                            data: format(new Date(), 'yyyy-MM-dd'),
                                            horario: '19:00',
                                            local: '',
                                            vagas: '',
                                            permissaoInscricao: ['todos']
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const oficinaData = {
                                        nome: newOficinaData.nome,
                                        descricao: newOficinaData.descricao,
                                        data: `${newOficinaData.data}T${newOficinaData.horario}:00`,
                                        local: newOficinaData.local,
                                        vagas: parseInt(newOficinaData.vagas) || null
                                    };
                                    
                                    await createWorkshop(oficinaData);
                                    const workshopsData = await getWorkshops();
                                    setOficinas(workshopsData || []);
                                    alert('Oficina criada com sucesso!');
                                } catch (error) {
                                    console.error('Erro ao criar oficina:', error);
                                    alert('Erro ao criar oficina.');
                                }
                                
                                setShowOficinaModal(false);
                                setNewOficinaData({
                                    nome: '',
                                    descricao: '',
                                    data: format(new Date(), 'yyyy-MM-dd'),
                                    horario: '19:00',
                                    local: '',
                                    vagas: '',
                                    permissaoInscricao: ['todos']
                                });
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nome da Oficina
                                        </label>
                                        <input
                                            type="text"
                                            value={newOficinaData.nome}
                                            onChange={(e) => setNewOficinaData({ ...newOficinaData, nome: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Ex: Violão para Iniciantes"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Descrição
                                        </label>
                                        <textarea
                                            value={newOficinaData.descricao}
                                            onChange={(e) => setNewOficinaData({ ...newOficinaData, descricao: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Descreva a oficina..."
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Data
                                            </label>
                                            <input
                                                type="date"
                                                value={newOficinaData.data}
                                                onChange={(e) => setNewOficinaData({ ...newOficinaData, data: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Horário
                                            </label>
                                            <input
                                                type="time"
                                                value={newOficinaData.horario}
                                                onChange={(e) => setNewOficinaData({ ...newOficinaData, horario: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Local
                                            </label>
                                            <input
                                                type="text"
                                                value={newOficinaData.local}
                                                onChange={(e) => setNewOficinaData({ ...newOficinaData, local: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Ex: Sala 2"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Vagas
                                            </label>
                                            <input
                                                type="number"
                                                value={newOficinaData.vagas}
                                                onChange={(e) => setNewOficinaData({ ...newOficinaData, vagas: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Ex: 20"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Quem pode se inscrever?
                                        </label>
                                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-700 space-y-2">
                                            <div 
                                                onClick={() => {
                                                    if (newOficinaData.permissaoInscricao.includes('todos')) {
                                                        setNewOficinaData({ ...newOficinaData, permissaoInscricao: [] });
                                                    } else {
                                                        setNewOficinaData({ ...newOficinaData, permissaoInscricao: ['todos'] });
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                    newOficinaData.permissaoInscricao.includes('todos') 
                                                        ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500' 
                                                        : 'bg-gray-50 dark:bg-gray-600 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                    newOficinaData.permissaoInscricao.includes('todos')
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'border-gray-400 dark:border-gray-500'
                                                }`}>
                                                    {newOficinaData.permissaoInscricao.includes('todos') && (
                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-semibold">Todos os Membros</span>
                                            </div>
                                            
                                            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                                            
                                            {availableRoles.map(role => (
                                                <div 
                                                    key={role}
                                                    onClick={() => {
                                                        if (newOficinaData.permissaoInscricao.includes('todos')) return;
                                                        
                                                        let newPerm = [...newOficinaData.permissaoInscricao];
                                                        if (newPerm.includes(role)) {
                                                            newPerm = newPerm.filter(d => d !== role);
                                                            if (newPerm.length === 0) newPerm = ['todos'];
                                                        } else {
                                                            newPerm = newPerm.filter(d => d !== 'todos');
                                                            newPerm.push(role);
                                                        }
                                                        setNewOficinaData({ ...newOficinaData, permissaoInscricao: newPerm });
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                        newOficinaData.permissaoInscricao.includes('todos')
                                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                                                            : newOficinaData.permissaoInscricao.includes(role)
                                                                ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500'
                                                                : 'bg-gray-50 dark:bg-gray-600 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                        newOficinaData.permissaoInscricao.includes(role) && !newOficinaData.permissaoInscricao.includes('todos')
                                                            ? 'bg-indigo-600 border-indigo-600'
                                                            : 'border-gray-400 dark:border-gray-500'
                                                    }`}>
                                                        {newOficinaData.permissaoInscricao.includes(role) && !newOficinaData.permissaoInscricao.includes('todos') && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-900 dark:text-white">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOficinaModal(false);
                                            setNewOficinaData({
                                                nome: '',
                                                descricao: '',
                                                data: format(new Date(), 'yyyy-MM-dd'),
                                                horario: '19:00',
                                                local: '',
                                                vagas: '',
                                                permissaoInscricao: ['todos']
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Criar Oficina
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChurchAdminDashboard;
