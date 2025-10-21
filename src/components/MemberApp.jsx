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
    Edit,
    List,
    Trash2,
    Phone,
    Edit2,
    Image,
    Church
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, isSameMonth, isToday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatId } from '../utils/formatters';
import { searchMembers, getEventFoods, updateEventFood, registerEventParticipant, unregisterEventParticipant, checkEventRegistration, updateMember, getMinistrySchedules, getMembers, getFamilyByMemberId, getUnreadAvisosCount, markAvisoAsRead, getAvisosWithReadStatus, getPlaylistMusicas, getMemberById, createMinistrySchedule, updateMinistrySchedule, deleteMinistrySchedule, createPlaylistMusica, deletePlaylistMusica, getWorkshops, createWorkshop, updateWorkshop, deleteWorkshop, registerWorkshopParticipant, unregisterWorkshopParticipant, checkWorkshopRegistration, getWorkshopRegistrations, getPhotos } from '../lib/supabaseService';
import CustomCalendar from './CustomCalendar';
import Modal from './Modal';
import { initializePushNotifications, removeDeviceToken } from '../services/pushNotifications';
import { useBlockScroll } from '../hooks/useBlockScroll';

// Lista de versículos bíblicos
const VERSICULOS = [
    { texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", referencia: "João 3:16" },
    { texto: "Tudo posso naquele que me fortalece.", referencia: "Filipenses 4:13" },
    { texto: "O Senhor é o meu pastor, nada me faltará.", referencia: "Salmos 23:1" },
    { texto: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", referencia: "Provérbios 3:5" },
    { texto: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo.", referencia: "Salmos 23:4" },
    { texto: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.", referencia: "Salmos 37:5" },
    { texto: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.", referencia: "Isaías 40:31" },
    { texto: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.", referencia: "Romanos 8:28" },
    { texto: "O Senhor é a minha luz e a minha salvação; a quem temerei?", referencia: "Salmos 27:1" },
    { texto: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", referencia: "Isaías 41:10" },
    { texto: "Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.", referencia: "Mateus 6:33" },
    { texto: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.", referencia: "1 Pedro 5:7" },
    { texto: "A alegria do Senhor é a vossa força.", referencia: "Neemias 8:10" },
    { texto: "Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim.", referencia: "João 14:6" },
    { texto: "Grande é o Senhor e muito digno de ser louvado.", referencia: "Salmos 48:1" },
    { texto: "Eis que estou convosco todos os dias, até à consumação dos séculos.", referencia: "Mateus 28:20" },
    { texto: "O amor nunca falha.", referencia: "1 Coríntios 13:8" },
    { texto: "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles.", referencia: "Mateus 18:20" },
    { texto: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.", referencia: "Filipenses 4:4" },
    { texto: "Bem-aventurados os limpos de coração, porque eles verão a Deus.", referencia: "Mateus 5:8" }
];

const MemberApp = ({ currentMember, events = [], avisos = [], onAddMember, onLogout }) => {
    const [localMember, setLocalMember] = useState(currentMember);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

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

    const getInitials = (name) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Definir itens de menu padrão e por flag
    const defaultMenuItems = [
        { id: 'home', label: 'Feed', icon: BarChart3 },
        { id: 'perfil', label: 'Família', icon: Users },
        { id: 'eventos', label: 'Eventos', icon: Calendar },
        { id: 'avisos', label: 'Avisos', icon: Bell },
        { id: 'playlistzoe', label: 'Playlist Zoe', icon: null },
        { id: 'configuracoes', label: 'Configurações', icon: Settings }
    ];

    const flagMenuItems = {
        'louvor': { id: 'louvor', label: 'Louvor', icon: Music },
        'líder de louvor': { id: 'louvor', label: 'Louvor', icon: Music },
        'diaconia': { id: 'diaconia', label: 'Diaconia', icon: Heart },
        'lider da diaconia': { id: 'diaconia', label: 'Diaconia', icon: Heart },
        'kids': { id: 'kids', label: 'Kids', icon: Baby },
        'lider kids': { id: 'kids', label: 'Kids', icon: Baby },
        'professor kids': { id: 'kids', label: 'Kids', icon: Baby },
        'jovens': { id: 'jovens', label: 'Jovens', icon: Sparkles },
        'jovem': { id: 'jovens', label: 'Jovens', icon: Sparkles },
        'lider jovens': { id: 'jovens', label: 'Jovens', icon: Sparkles }
    };

    // Filtrar itens de menu baseado nas flags do membro
    const menuItems = useMemo(() => {
        const items = [...defaultMenuItems];
        const memberFuncoes = localMember?.funcoes || [];
        const addedIds = new Set();
        
        // Adicionar itens de menu para cada flag que o membro possui (evitar duplicatas)
        memberFuncoes.forEach(funcao => {
            if (flagMenuItems[funcao] && !addedIds.has(flagMenuItems[funcao].id)) {
                items.push(flagMenuItems[funcao]);
                addedIds.add(flagMenuItems[funcao].id);
            }
        });
        
        return items;
    }, [localMember]);
    const [activeTab, setActiveTab] = useState('home');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [eventView, setEventView] = useState('list'); // 'calendar' ou 'list'
    const [calendarViewMode, setCalendarViewMode] = useState('month'); // 'day', 'month', 'year'
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
    const [selectedFoods, setSelectedFoods] = useState({});
    const [isRegistered, setIsRegistered] = useState(false);
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
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [searchResults, setSearchResults] = useState([]);
    const [playlistMusicas, setPlaylistMusicas] = useState([]);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editProfileData, setEditProfileData] = useState({
        nome: '',
        telefone: '',
        nascimento: '',
        genero: '',
        funcoes: []
    });
    const [diaconiaSchedules, setDiaconiaSchedules] = useState([]);
    const [louvorSchedules, setLouvorSchedules] = useState([]);
    const [kidsSchedules, setKidsSchedules] = useState([]);
    const [jovensSchedules, setJovensSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleMembers, setScheduleMembers] = useState([]);
    const [showSearchMemberModal, setShowSearchMemberModal] = useState(false);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    const [unreadAvisosCount, setUnreadAvisosCount] = useState(0);
    const [filteredAvisos, setFilteredAvisos] = useState([]);
    const [showRegisterOtherModal, setShowRegisterOtherModal] = useState(false);
    const [registerOtherSearch, setRegisterOtherSearch] = useState('');
    const [registerOtherResults, setRegisterOtherResults] = useState([]);
    const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
    const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState(null);
    const [isLiderJovens, setIsLiderJovens] = useState(false);
    const [oficinas, setOficinas] = useState([]);
    const [jovensMembers, setJovensMembers] = useState([]);
    const [showOficinaModal, setShowOficinaModal] = useState(false);
    const [selectedOficina, setSelectedOficina] = useState(null);
    const [showOficinaDetailsModal, setShowOficinaDetailsModal] = useState(false);
    const [oficinaDetails, setOficinaDetails] = useState(null);
    const [isOficinaRegistered, setIsOficinaRegistered] = useState(false);
    const [oficinaParticipants, setOficinaParticipants] = useState([]);
    const [showEditOficinaModal, setShowEditOficinaModal] = useState(false);
    const [oficinaFormData, setOficinaFormData] = useState({
        nome: '',
        descricao: '',
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '19:00',
        local: '',
        vagas: 12,
        inscritos: 0,
        quem_pode_se_inscrever: ['todos']
    });
    const [newScheduleData, setNewScheduleData] = useState({
        data: '',
        horario: '19:00',
        categoria: 'culto',
        descricao: '',
        local: '',
        observacoes: '',
        membros_ids: [],
        musicas: [],
        instrumentos: {},
        newMusicaTemp: ''
    });
    const [showMusicModal, setShowMusicModal] = useState(false);
    const [newMusicData, setNewMusicData] = useState({
        nome: '',
        artista: '',
        link: ''
    });
    const [showMusicListModal, setShowMusicListModal] = useState(false);
    const [showMusiciansModal, setShowMusiciansModal] = useState(false);
    const [louvorMembers, setLouvorMembers] = useState([]);
    const [diaconiaMembers, setDiaconiaMembers] = useState([]);
    const [kidsMembers, setKidsMembers] = useState({ criancas: [], professores: [], all: [] });
    const [showDiaconiaScheduleModal, setShowDiaconiaScheduleModal] = useState(false);
    const [showEditDiaconiaScheduleModal, setShowEditDiaconiaScheduleModal] = useState(false);
    const [diaconiaScheduleToEdit, setDiaconiaScheduleToEdit] = useState(null);
    const [newDiaconiaScheduleData, setNewDiaconiaScheduleData] = useState({
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '19:00',
        categoria: 'culto',
        observacoes: '',
        diaconosSelecionados: []
    });
    const [showKidsScheduleModal, setShowKidsScheduleModal] = useState(false);
    const [showKidsListModal, setShowKidsListModal] = useState(false);
    const [showProfessoresListModal, setShowProfessoresListModal] = useState(false);
    const [showJovensListModal, setShowJovensListModal] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [showPhotoDetailsModal, setShowPhotoDetailsModal] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [showDetalhesEscalaProfessoresModal, setShowDetalhesEscalaProfessoresModal] = useState(false);
    const [showEditEscalaProfessoresModal, setShowEditEscalaProfessoresModal] = useState(false);

    useBlockScroll(
        showEventDetailsModal || showFamilyModal || showAddMemberModal || 
        showEditFamilyModal || showEditProfileModal || showScheduleModal || 
        showSearchMemberModal || showRegisterOtherModal || showCreateScheduleModal || 
        showEditScheduleModal || showOficinaModal || showOficinaDetailsModal || 
        showEditOficinaModal || showMusicModal || showMusicListModal || 
        showMusiciansModal || showDiaconiaScheduleModal || showEditDiaconiaScheduleModal || 
        showKidsScheduleModal || showKidsListModal || showProfessoresListModal || 
        showJovensListModal || showPhotoDetailsModal || showDetalhesEscalaProfessoresModal || 
        showEditEscalaProfessoresModal || sidebarOpen
    );
    const [showAvisosDropdown, setShowAvisosDropdown] = useState(false);
    const [dailyMusic, setDailyMusic] = useState(() => {
        const saved = localStorage.getItem('dailyMusic');
        if (saved) {
            const data = JSON.parse(saved);
            const today = format(new Date(), 'yyyy-MM-dd');
            if (data.date === today) {
                return data.music;
            }
        }
        return null;
    });
    const [dailyVerse, setDailyVerse] = useState(() => {
        const saved = localStorage.getItem('dailyVerse');
        if (saved) {
            const data = JSON.parse(saved);
            const today = format(new Date(), 'yyyy-MM-dd');
            if (data.date === today) {
                return data.verse;
            }
        }
        return null;
    });
    const [newKidsScheduleData, setNewKidsScheduleData] = useState({
        turmas: [],
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '09:00',
        professoresSelecionados: []
    });
    const [escalasKids, setEscalasKids] = useState(() => {
        const saved = localStorage.getItem('escalasKids');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedKidsSchedule, setSelectedKidsSchedule] = useState(null);
    const [editFormDataProfessores, setEditFormDataProfessores] = useState({
        turmas: [],
        data: '',
        horario: '',
        professoresSelecionados: []
    });

    // Detectar mudanças na preferência de cor do sistema
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            setDarkMode(e.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Forçar recálculo de viewport no mount
    useEffect(() => {
        const forceResize = () => {
            window.dispatchEvent(new Event('resize'));
        };
        
        forceResize();
        setTimeout(forceResize, 100);
        setTimeout(forceResize, 300);
    }, []);

    // Inicializar push notifications
    useEffect(() => {
        if (currentMember?.id) {
            initializePushNotifications(currentMember.id);
        }
        
        return () => {
            if (currentMember?.id) {
                removeDeviceToken(currentMember.id);
            }
        };
    }, [currentMember?.id]);

    // Recarregar dados do membro a cada 10 segundos
    useEffect(() => {
        const reloadMemberData = async () => {
            if (currentMember?.id) {
                try {
                    const updatedMember = await getMemberById(localMember.id);
                    if (updatedMember) {
                        setLocalMember(updatedMember);
                        localStorage.setItem('current_member', JSON.stringify(updatedMember));
                    }
                } catch (error) {
                    console.error('Erro ao recarregar dados do membro:', error);
                }
            }
        };

        // Carregar imediatamente
        reloadMemberData();

        // Recarregar a cada 10 segundos
        const interval = setInterval(reloadMemberData, 10000);
        return () => clearInterval(interval);
    }, [currentMember?.id]);

    // Carregar família do membro ao montar o componente
    useEffect(() => {
        const loadFamily = async () => {
            if (localMember?.id) {
                try {
                    const family = await getFamilyByMemberId(localMember.id);
                    if (family) {
                        // Carregar membros completos usando os IDs
                        const allMembers = await getMembers();
                        const familyMembers = allMembers.filter(m => 
                            family.membros_ids?.includes(m.id)
                        );
                        
                        setMyFamily({
                            ...family,
                            membros: familyMembers
                        });
                    }
                } catch (error) {
                    console.error('Erro ao carregar família:', error);
                }
            }
        };
        loadFamily();
    }, [localMember?.id]);

    // Carregar contador de avisos não lidos e avisos filtrados
    useEffect(() => {
        const loadAvisosData = async () => {
            if (localMember?.id) {
                try {
                    // Carregar contador de não lidos
                    const count = await getUnreadAvisosCount(localMember.id);
                    setUnreadAvisosCount(count);
                    
                    // Carregar apenas avisos que este membro pode ver
                    const avisosDoMembro = await getAvisosWithReadStatus(localMember.id);
                    setFilteredAvisos(avisosDoMembro || []);
                } catch (error) {
                    console.error('Erro ao carregar avisos:', error);
                }
            }
        };
        loadAvisosData();
        
        // Atualizar a cada 30 segundos
        const interval = setInterval(loadAvisosData, 30000);
        return () => clearInterval(interval);
    }, [localMember?.id, activeTab]);

    // Marcar todos os avisos como lidos quando acessar a aba de avisos
    useEffect(() => {
        const markAllAvisosAsRead = async () => {
            if (activeTab === 'avisos' && localMember?.id && filteredAvisos.length > 0) {
                try {
                    // Marcar apenas avisos não lidos
                    const unreadAvisos = filteredAvisos.filter(aviso => 
                        aviso.aviso_notifications && 
                        aviso.aviso_notifications.length > 0 && 
                        !aviso.aviso_notifications[0].lido
                    );
                    
                    // Marcar cada aviso não lido como lido
                    for (const aviso of unreadAvisos) {
                        await markAvisoAsRead(aviso.id, localMember.id);
                    }
                    
                    // Atualizar lista e contador se houver avisos marcados
                    if (unreadAvisos.length > 0) {
                        const avisosDoMembro = await getAvisosWithReadStatus(localMember.id);
                        setFilteredAvisos(avisosDoMembro || []);
                        setUnreadAvisosCount(0);
                    }
                } catch (error) {
                    console.error('Erro ao marcar avisos como lidos:', error);
                }
            }
        };
        markAllAvisosAsRead();
    }, [activeTab, filteredAvisos.length, localMember?.id]);

    // Carregar playlist Zoe
    useEffect(() => {
        const loadPlaylist = async () => {
            try {
                const musicas = await getPlaylistMusicas();
                setPlaylistMusicas(musicas || []);
            } catch (error) {
                console.error('Erro ao carregar playlist:', error);
                setPlaylistMusicas([]);
            }
        };
        loadPlaylist();
    }, []);

    // Carregar membros quando abrir o modal de escala
    useEffect(() => {
        const loadScheduleMembers = async () => {
            if (showScheduleModal && selectedSchedule && selectedSchedule.membros_ids?.length > 0) {
                try {
                    const allMembers = await getMembers();
                    const escalados = allMembers.filter(m => selectedSchedule.membros_ids.includes(m.id));
                    setScheduleMembers(escalados);
                } catch (error) {
                    console.error('Erro ao carregar membros da escala:', error);
                    setScheduleMembers([]);
                }
            } else {
                setScheduleMembers([]);
            }
        };
        loadScheduleMembers();
    }, [showScheduleModal, selectedSchedule]);

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

    // Carregar escalas quando mudar de aba
    useEffect(() => {
        const loadSchedules = async () => {
            if (['diaconia', 'louvor', 'kids', 'jovens'].includes(activeTab)) {
                // Verificar se o membro tem a flag do ministério
                const memberRoles = currentMember?.funcoes || [];
                let hasPermission = false;
                
                if (activeTab === 'louvor') {
                    hasPermission = memberRoles.some(role => 
                        role.toLowerCase().includes('louvor')
                    );
                } else if (activeTab === 'diaconia') {
                    hasPermission = memberRoles.some(role => 
                        role.toLowerCase().includes('diaconia') || role.toLowerCase().includes('diácono')
                    );
                } else if (activeTab === 'kids') {
                    hasPermission = memberRoles.some(role => 
                        role.toLowerCase().includes('kids')
                    );
                } else if (activeTab === 'jovens') {
                    hasPermission = memberRoles.some(role => 
                        role.toLowerCase().includes('jovens') || role.toLowerCase().includes('jovem')
                    );
                }
                
                if (!hasPermission) {
                    console.log(`Membro não tem permissão para ver escalas de ${activeTab}. Funções: ${memberRoles.join(', ')}`);
                    return;
                }

                setLoadingSchedules(true);
                try {
                    const schedules = await getMinistrySchedules(activeTab);
                    console.log(`Escalas carregadas para ${activeTab}:`, schedules);

                    switch (activeTab) {
                        case 'diaconia':
                            setDiaconiaSchedules(schedules);
                            // Carregar todos os membros com flag diaconia
                            const allMembersDiaconia = await getMembers();
                            const membrosDiaconia = allMembersDiaconia.filter(m => 
                                m.funcoes?.includes('diaconia') || 
                                m.funcoes?.includes('líder da diaconia') ||
                                m.funcoes?.includes('lider da diaconia')
                            );
                            setDiaconiaMembers(membrosDiaconia);
                            break;
                        case 'louvor':
                            console.log('Definindo louvorSchedules:', schedules);
                            setLouvorSchedules(schedules);
                            // Carregar todos os membros com flag louvor
                            const allMembers = await getMembers();
                            const musicosLouvor = allMembers.filter(m => 
                                m.funcoes?.includes('louvor') || 
                                m.funcoes?.includes('líder de louvor') ||
                                m.funcoes?.includes('lider de louvor')
                            );
                            console.log('Músicos de louvor:', musicosLouvor);
                            setLouvorMembers(musicosLouvor);
                            break;
                        case 'kids':
                            setKidsSchedules(schedules);
                            // Carregar todos os membros kids
                            const allMembersKids = await getMembers();
                            const criancas = allMembersKids.filter(m => {
                                const age = calculateAge(m.nascimento);
                                return age !== null && age <= 12;
                            });
                            const professores = allMembersKids.filter(m => {
                                const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                return funcoes.some(f => f === 'professor kids' || f === 'lider kids');
                            });
                            console.log('Professores Kids encontrados:', professores);
                            console.log('Todos os membros Kids:', allMembersKids);
                            setKidsMembers({ criancas, professores, all: allMembersKids });
                            break;
                        case 'jovens':
                            setJovensSchedules(schedules);
                            break;
                    }
                } catch (error) {
                    console.error(`Erro ao carregar escalas de ${activeTab}:`, error);
                } finally {
                    setLoadingSchedules(false);
                }
            }
        };

        loadSchedules();
    }, [activeTab, currentMember]);

    // Carregar fotos quando acessar a aba galeria ou home
    useEffect(() => {
        const loadPhotos = async () => {
            if (activeTab === 'galeria' || activeTab === 'home') {
                try {
                    const photosData = await getPhotos();
                    setPhotos(photosData || []);
                } catch (error) {
                    console.error('Erro ao carregar fotos:', error);
                }
            }
        };
        loadPhotos();
    }, [activeTab]);

    // Verificar se é líder jovens e carregar dados
    useEffect(() => {
        const checkLiderAndLoadData = async () => {
            if (activeTab === 'jovens' && currentMember) {
                const memberRoles = currentMember.funcoes || [];
                const isLider = memberRoles.includes('lider jovens');
                setIsLiderJovens(isLider);

                try {
                    // Carregar oficinas
                    const workshopsData = await getWorkshops();
                    setOficinas(workshopsData || []);

                    // Carregar membros jovens
                    const allMembers = await getMembers();
                    const jovens = allMembers.filter(m => {
                        const age = calculateAge(m.nascimento);
                        const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                        return (age !== null && age >= 13 && age <= 30) || funcoes.includes('jovem');
                    });
                    setJovensMembers(jovens);
                } catch (error) {
                    console.error('Erro ao carregar dados de jovens:', error);
                }
            }
        };

        checkLiderAndLoadData();
    }, [activeTab, currentMember]);

    // Detectar scroll para ocultar botões flutuantes
    useEffect(() => {
        let lastScrollY = window.scrollY;
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Esconde ao rolar para baixo, mostra ao rolar para cima ou estar no topo
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down
                setIsScrolling(true);
            } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
                // Scrolling up or at top
                setIsScrolling(false);
            }
            
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
        return filteredAvisos.slice(0, 5);
    }, [filteredAvisos]);

    // Função para selecionar evento e buscar comidas
    const handleSelectEvent = async (event) => {
        try {
            // Verificar se é workshop ou evento regular
            const isWorkshop = event.tipo === 'oficina' || event.workshopId;
            
            if (isWorkshop) {
                // Verificar inscrição em workshop
                const registered = await checkWorkshopRegistration(event.workshopId, currentMember.id);
                console.log('Workshop registration check:', event.workshopId, currentMember.id, registered);
                setIsRegistered(registered);
                setSelectedEvent(event);
            } else {
                // Verificar se o membro está inscrito no evento regular
                const registered = await checkEventRegistration(event.id, currentMember.id);
                console.log('Event registration check:', event.id, currentMember.id, registered);
                setIsRegistered(registered);

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
            }
            
            setShowEventDetailsModal(true);
        } catch (error) {
            console.error('Erro ao buscar dados do evento:', error);
            setSelectedEvent(event);
            setShowEventDetailsModal(true);
        }
    };

    // Função para inscrever/desinscrever no evento
    const handleEventRegistration = async () => {
        if (!selectedEvent || !currentMember) return;

        try {
            // Verificar se é workshop ou evento regular
            const isWorkshop = selectedEvent.tipo === 'oficina' || selectedEvent.workshopId;
            
            console.log('handleEventRegistration - selectedEvent:', selectedEvent);
            console.log('handleEventRegistration - currentMember.id:', currentMember.id);
            console.log('handleEventRegistration - isRegistered:', isRegistered);
            
            if (isWorkshop) {
                // Workshop: usar workshop_registrations
                const workshopId = selectedEvent.workshopId;
                
                if (isRegistered) {
                    console.log('Cancelando inscrição na oficina:', workshopId, currentMember.id);
                    await unregisterWorkshopParticipant(workshopId, currentMember.id);
                    // Verificar novamente o status após cancelar
                    const stillRegistered = await checkWorkshopRegistration(workshopId, currentMember.id);
                    console.log('Status após cancelamento (workshop):', stillRegistered);
                    setIsRegistered(stillRegistered);
                    alert('Você foi desinscrito da oficina.');
                } else {
                    console.log('Inscrevendo na oficina:', workshopId, currentMember.id);
                    await registerWorkshopParticipant(workshopId, currentMember.id);
                    // Verificar novamente o status após inscrever
                    const nowRegistered = await checkWorkshopRegistration(workshopId, currentMember.id);
                    console.log('Status após inscrição (workshop):', nowRegistered);
                    setIsRegistered(nowRegistered);
                    alert('Inscrição na oficina confirmada com sucesso!');
                }
            } else {
                // Evento regular: usar event_participants
                if (isRegistered) {
                    console.log('Cancelando inscrição no evento:', selectedEvent.id, currentMember.id);
                    const unregisterResult = await unregisterEventParticipant(selectedEvent.id, currentMember.id);
                    console.log('Resultado do unregister:', unregisterResult);
                    // Verificar novamente o status após cancelar
                    const stillRegistered = await checkEventRegistration(selectedEvent.id, currentMember.id);
                    console.log('Status após cancelamento (evento):', stillRegistered);
                    setIsRegistered(stillRegistered);
                    alert('Você foi desinscrito do evento.');
                } else {
                    console.log('Inscrevendo no evento:', selectedEvent.id, currentMember.id);
                    await registerEventParticipant(selectedEvent.id, currentMember.id);
                    // Verificar novamente o status após inscrever
                    const nowRegistered = await checkEventRegistration(selectedEvent.id, currentMember.id);
                    console.log('Status após inscrição (evento):', nowRegistered);
                    setIsRegistered(nowRegistered);
                    alert('Inscrição confirmada com sucesso!');
                }
            }
        } catch (error) {
            console.error('Erro ao processar inscrição:', error);
            alert('Erro ao processar inscrição. Tente novamente.');
        }
    };

    // Função para confirmar seleção de comidas
    const handleConfirmFoodSelection = async () => {
        if (!selectedEvent || !currentMember) return;

        try {
            // Atualizar cada comida selecionada no banco de dados
            const updatePromises = selectedEvent.comidas
                .filter(comida => selectedFoods[comida.nome])
                .map(comida =>
                    updateEventFood(comida.id, {
                        membro_id: localMember.id,
                        responsavel: localMember.nome
                    })
                );

            await Promise.all(updatePromises);

            // Atualizar localmente após salvar no banco
            const updatedEvent = {
                ...selectedEvent,
                comidas: selectedEvent.comidas?.map(comida => {
                    if (selectedFoods[comida.nome]) {
                        return {
                            ...comida,
                            responsavel: localMember.nome,
                            membro_id: localMember.id,
                            member: { id: localMember.id, nome: localMember.nome }
                        };
                    }
                    return comida;
                })
            };

            setSelectedEvent(updatedEvent);
            setSelectedFoods({});

            const selectedItems = Object.keys(selectedFoods).filter(k => selectedFoods[k]).join(', ');
            alert(`Seleção confirmada! Você se comprometeu a trazer: ${selectedItems}`);
        } catch (error) {
            console.error('Erro ao confirmar seleção de comidas:', error);
            alert('Erro ao confirmar seleção. Tente novamente.');
        }
    };

    // Buscar membros da família para inscrição de outros
    const handleRegisterOtherSearch = (query) => {
        setRegisterOtherSearch(query);
        
        if (!myFamily || !myFamily.membros) {
            setRegisterOtherResults([]);
            return;
        }

        if (query.trim().length >= 2) {
            const filtered = myFamily.membros.filter(member => 
                member.nome.toLowerCase().includes(query.toLowerCase()) &&
                member.id !== localMember.id // Excluir o próprio usuário
            );
            setRegisterOtherResults(filtered);
        } else {
            // Se não houver busca, mostrar todos da família exceto o próprio usuário
            const familyMembers = myFamily.membros.filter(member => member.id !== localMember.id);
            setRegisterOtherResults(familyMembers);
        }
    };

    // Inscrever outra pessoa no evento
    const handleRegisterOther = async (member) => {
        try {
            // Verificar se é workshop ou evento regular
            const isWorkshop = selectedEvent.tipo === 'oficina' || selectedEvent.workshopId;
            
            if (isWorkshop) {
                // Verificar se já está inscrito
                const alreadyRegistered = await checkWorkshopRegistration(selectedEvent.workshopId, member.id);
                if (alreadyRegistered) {
                    alert(`${member.nome} já está inscrito(a) nesta oficina.`);
                    return;
                }
                
                await registerWorkshopParticipant(selectedEvent.workshopId, member.id);
                alert(`${member.nome} foi inscrito(a) na oficina com sucesso!`);
            } else {
                // Verificar se já está inscrito
                const alreadyRegistered = await checkEventRegistration(selectedEvent.id, member.id);
                if (alreadyRegistered) {
                    alert(`${member.nome} já está inscrito(a) neste evento.`);
                    return;
                }
                
                await registerEventParticipant(selectedEvent.id, member.id);
                alert(`${member.nome} foi inscrito(a) no evento com sucesso!`);
            }
            
            setShowRegisterOtherModal(false);
            setRegisterOtherSearch('');
            setRegisterOtherResults([]);
        } catch (error) {
            console.error('Erro ao inscrever pessoa:', error);
            alert('Erro ao inscrever pessoa. Tente novamente.');
        }
    };

    // Renderizar calendário
    const renderCalendar = () => {
        const monthStart = startOfMonth(calendarDate);
        const monthEnd = endOfMonth(calendarDate);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

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
                const hasEvents = dayEvents.length > 0;

                days.push(
                    <div
                        key={day}
                        onClick={() => {
                            if (hasEvents) {
                                handleSelectEvent(dayEvents[0]);
                            }
                        }}
                        className={`
                            aspect-square flex items-center justify-center p-2 cursor-pointer
                            ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                            ${isTodayDate ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold' : ''}
                            ${hasEvents && !isTodayDate ? 'text-red-600 dark:text-red-400 font-semibold' : ''}
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

    // Renderizar detalhes do evento
    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        const eventDate = parseISO(selectedEvent.data);
        const hasFood = selectedEvent.alimentacao && selectedEvent.comidas?.length > 0;

        return (
            <Modal
                isOpen={showEventDetailsModal}
                onClose={() => {
                    setShowEventDetailsModal(false);
                    setSelectedEvent(null);
                    setSelectedFoods({});
                }}
                title={
                    <div>
                        {selectedEvent.tipo === 'oficina' && '🎓 '}
                        {selectedEvent.nome}
                        {selectedEvent.tipo === 'oficina' && (
                            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                Oficina
                            </span>
                        )}
                    </div>
                }
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="h-5 w-5 mr-2" />
                        <span style={{textTransform: 'capitalize'}}>{format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
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

                    {/* Botões de inscrição */}
                    <div className="mt-6 space-y-3">
                        <button
                            onClick={handleEventRegistration}
                            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${isRegistered
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {isRegistered ? (
                                <>
                                    <X className="h-5 w-5 mr-2" />
                                    Cancelar Inscrição
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Inscrever-se
                                </>
                            )}
                        </button>
                        {isRegistered && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                                ✓ Você está inscrito neste evento
                            </p>
                        )}
                        
                        <button
                            onClick={() => {
                                setShowRegisterOtherModal(true);
                                handleRegisterOtherSearch('');
                            }}
                            className="w-full px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white border border-blue-700"
                        >
                            <Users className="h-5 w-5 mr-2" />
                            Inscrever Familiar
                        </button>
                    </div>

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
                                                    ? 'bg-gray-100 dark:bg-black border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                                                    : euEscolhi
                                                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600'
                                                        : 'bg-white dark:bg-black border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-400'
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
            </Modal>
        );
    };

    // Verificar se é líder de louvor
    const isLiderLouvor = localMember?.funcoes?.includes('líder de louvor') || localMember?.funcoes?.includes('lider de louvor');
    
    // Verificar se é líder de diaconia
    const isLiderDiaconia = localMember?.funcoes?.includes('lider da diaconia') || localMember?.funcoes?.includes('líder da diaconia');
    
    // Verificar se é líder de kids
    const isLiderKids = localMember?.funcoes?.includes('lider kids') || localMember?.funcoes?.includes('líder kids');

    // Função para criar escala
    const handleCreateSchedule = async () => {
        try {
            // Converter instrumentos em array de músicos
            const musicos = Object.entries(newScheduleData.instrumentos || {})
                .filter(([_, musicoId]) => musicoId)
                .map(([instrumento, musicoId]) => ({
                    id: musicoId,
                    instrumento: instrumento
                }));
            
            // Preparar dados para enviar (remover campos que não existem na tabela)
            const { instrumentos, newMusicaTemp, categoria, descricao, local, membros_ids, ...scheduleDataToSend } = newScheduleData;
            
            await createMinistrySchedule({
                data: newScheduleData.data,
                horario: newScheduleData.horario,
                tipo: categoria,
                observacoes: newScheduleData.observacoes,
                musicas: newScheduleData.musicas || [],
                ministerio: 'louvor',
                musicos: musicos
            });
            
            // Recarregar escalas
            const escalas = await getMinistrySchedules('louvor');
            setLouvorSchedules(escalas);
            
            // Resetar form e fechar modal
            setNewScheduleData({
                data: '',
                horario: '19:00',
                categoria: 'culto',
                descricao: '',
                local: '',
                observacoes: '',
                membros_ids: [],
                musicas: [],
                instrumentos: {},
                newMusicaTemp: ''
            });
            setShowCreateScheduleModal(false);
            alert('Escala criada com sucesso!');
        } catch (error) {
            console.error('Erro ao criar escala:', error);
            alert('Erro ao criar escala');
        }
    };

    // Função para atualizar escala
    const handleUpdateSchedule = async () => {
        try {
            // Converter instrumentos em array de músicos
            const musicos = Object.entries(newScheduleData.instrumentos || {})
                .filter(([_, musicoId]) => musicoId)
                .map(([instrumento, musicoId]) => ({
                    id: musicoId,
                    instrumento: instrumento
                }));
            
            // Preparar dados para enviar (remover campos que não existem na tabela)
            const { instrumentos, newMusicaTemp, categoria, descricao, local, membros_ids, ...scheduleDataToSend } = newScheduleData;
            
            await updateMinistrySchedule(scheduleToEdit.id, {
                data: newScheduleData.data,
                horario: newScheduleData.horario,
                tipo: categoria,
                observacoes: newScheduleData.observacoes,
                musicas: newScheduleData.musicas || [],
                ministerio: 'louvor',
                musicos: musicos
            });
            
            // Recarregar escalas
            const escalas = await getMinistrySchedules('louvor');
            setLouvorSchedules(escalas);
            
            setShowEditScheduleModal(false);
            setScheduleToEdit(null);
            alert('Escala atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar escala:', error);
            alert('Erro ao atualizar escala');
        }
    };

    // Função para deletar escala
    const handleDeleteSchedule = async (id) => {
        if (!confirm('Deseja realmente deletar esta escala?')) return;
        
        try {
            await deleteMinistrySchedule(id, 'louvor');
            
            // Recarregar escalas
            const escalas = await getMinistrySchedules('louvor');
            setLouvorSchedules(escalas);
            
            alert('Escala deletada com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar escala:', error);
            alert('Erro ao deletar escala');
        }
    };

    // Função para adicionar música
    const handleSubmitMusic = async (e) => {
        e.preventDefault();
        try {
            const maxOrdem = playlistMusicas.length > 0 
                ? Math.max(...playlistMusicas.map(m => m.ordem || 0))
                : 0;

            const musicaData = {
                titulo: newMusicData.nome,
                artista: newMusicData.artista,
                link: newMusicData.link,
                ordem: maxOrdem + 1,
                ativa: true
            };

            await createPlaylistMusica(musicaData);
            const musicas = await getPlaylistMusicas();
            setPlaylistMusicas(musicas || []);
            setShowMusicModal(false);
            setNewMusicData({ nome: '', artista: '', link: '' });
            alert('Música adicionada com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar música:', error);
            alert('Erro ao adicionar música');
        }
    };

    // Funções de gestão de oficinas
    const handleSaveOficina = async () => {
        try {
            const oficinaData = {
                nome: oficinaFormData.nome,
                descricao: oficinaFormData.descricao,
                data: `${oficinaFormData.data}T${oficinaFormData.horario}:00`,
                local: oficinaFormData.local,
                vagas: parseInt(oficinaFormData.vagas),
                inscritos: parseInt(oficinaFormData.inscritos),
                quem_pode_se_inscrever: oficinaFormData.quem_pode_se_inscrever
            };

            if (selectedOficina) {
                await updateWorkshop(selectedOficina.id, oficinaData);
                alert('Oficina atualizada com sucesso!');
            } else {
                await createWorkshop(oficinaData);
                alert('Oficina criada com sucesso!');
            }

            const workshopsData = await getWorkshops();
            setOficinas(workshopsData || []);
            setShowOficinaModal(false);
            setSelectedOficina(null);
            setOficinaFormData({
                nome: '',
                descricao: '',
                data: format(new Date(), 'yyyy-MM-dd'),
                horario: '19:00',
                local: '',
                vagas: 12,
                inscritos: 0,
                quem_pode_se_inscrever: ['todos']
            });
        } catch (error) {
            console.error('Erro ao salvar oficina:', error);
            alert('Erro ao salvar oficina');
        }
    };

    const handleDeleteOficina = async (id) => {
        if (!confirm('Deseja realmente deletar esta oficina?')) return;

        try {
            await deleteWorkshop(id);
            alert('Oficina deletada com sucesso!');
            const workshopsData = await getWorkshops();
            setOficinas(workshopsData || []);
            setShowOficinaModal(false);
            setSelectedOficina(null);
        } catch (error) {
            console.error('Erro ao deletar oficina:', error);
            alert('Erro ao deletar oficina');
        }
    };

    const handleEditOficina = (oficina) => {
        setSelectedOficina(oficina);
        
        let dataFormatada = oficina.data;
        let horarioFormatado = '19:00';
        
        if (oficina.data && oficina.data.includes('T')) {
            const [dataPart, horaPart] = oficina.data.split('T');
            dataFormatada = dataPart;
            if (horaPart) {
                horarioFormatado = horaPart.substring(0, 5);
            }
        }
        
        setOficinaFormData({
            nome: oficina.nome || '',
            descricao: oficina.descricao || '',
            data: dataFormatada,
            horario: horarioFormatado,
            local: oficina.local || '',
            vagas: oficina.vagas || 12,
            inscritos: oficina.inscritos || 0,
            quem_pode_se_inscrever: oficina.quem_pode_se_inscrever || ['todos']
        });

        setShowOficinaModal(true);
    };

    const handleViewOficinaDetails = async (oficina) => {
        try {
            // Verificar se o ID é válido (número)
            if (typeof oficina.id !== 'number') {
                alert('Esta oficina possui um ID inválido. Por favor, entre em contato com o administrador.');
                return;
            }
            setOficinaDetails(oficina);
            const isRegistered = await checkWorkshopRegistration(oficina.id, localMember.id);
            setIsOficinaRegistered(isRegistered);
            
            // Buscar participantes da oficina
            const participants = await getWorkshopRegistrations(oficina.id);
            setOficinaParticipants(participants || []);
            
            setShowOficinaDetailsModal(true);
        } catch (error) {
            console.error('Erro ao verificar inscrição:', error);
            alert('Erro ao carregar detalhes da oficina.');
        }
    };

    const handleOficinaRegistration = async () => {
        if (!oficinaDetails || !localMember) return;

        try {
            if (isOficinaRegistered) {
                await unregisterWorkshopParticipant(oficinaDetails.id, localMember.id);
                setIsOficinaRegistered(false);
                alert('Inscrição cancelada com sucesso!');
            } else {
                // Verificar se ainda há vagas disponíveis
                if (oficinaParticipants.length >= oficinaDetails.vagas) {
                    alert('Não há mais vagas disponíveis para esta oficina.');
                    return;
                }
                
                await registerWorkshopParticipant(oficinaDetails.id, localMember.id);
                setIsOficinaRegistered(true);
                alert('Inscrição confirmada com sucesso!');
            }
            
            const updatedOficinas = await getWorkshops();
            setOficinas(updatedOficinas);
            
            // Atualizar a lista de participantes
            const participants = await getWorkshopRegistrations(oficinaDetails.id);
            setOficinaParticipants(participants || []);
        } catch (error) {
            console.error('Erro ao processar inscrição:', error);
            alert('Erro ao processar inscrição. Tente novamente.');
        }
    };

    return (
        <div className={`w-full flex flex-col ${darkMode ? 'dark' : ''}`} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100vh',
            overflow: 'hidden'
        }}>
            <div className="w-full h-full flex flex-col bg-white dark:bg-black overflow-hidden"
                style={{
                    paddingTop: 0,
                    marginTop: 'calc(-1 * env(safe-area-inset-top, 0px))'
                }}>
                {/* Header */}
                <div className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-700 shrink-0 z-40"
                    style={{
                        paddingTop: 'calc(env(safe-area-inset-top, 44px) + 48px)'
                    }}>
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors text-gray-900 dark:text-white"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Olá, {currentMember?.nome?.split(' ')[0] || 'Membro'}!
                                </h1>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowAvisosDropdown(!showAvisosDropdown)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors relative flex items-center justify-center text-gray-900 dark:text-white"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadAvisosCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                            {unreadAvisosCount}
                                        </span>
                                    )}
                                </button>
                                {showAvisosDropdown && (
                                    <>
                                        <div className="fixed inset-x-0 top-0 z-40" style={{ bottom: 0 }} onClick={() => setShowAvisosDropdown(false)} />
                                        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-black rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="font-bold text-gray-900 dark:text-white">Avisos Recentes</h3>
                                            </div>
                                            <div className="p-2">
                                                {recentAvisos.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {recentAvisos.slice(0, 5).map(aviso => {
                                                            const notification = aviso.aviso_notifications?.[0];
                                                            const isUnread = notification && !notification.lido;
                                                            
                                                            return (
                                                            <div 
                                                                key={aviso.id} 
                                                                className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg cursor-pointer transition-colors border-l-4 ${
                                                                    isUnread 
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                                                                        : 'bg-transparent border-transparent'
                                                                }`}
                                                                onClick={() => {
                                                                    setShowAvisosDropdown(false);
                                                                    setActiveTab('avisos');
                                                                    if (isUnread) {
                                                                        markAvisoAsRead(aviso.id, currentMember.id).then(() => {
                                                                            getAvisosWithReadStatus(currentMember.id).then(avisosData => {
                                                                                setAvisos(avisosData);
                                                                            });
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className="font-semibold text-sm text-gray-900 dark:text-white flex-1">{aviso.titulo}</p>
                                                                    {isUnread && (
                                                                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{aviso.mensagem}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                    {format(parseISO(aviso.created_at), "d 'de' MMM", { locale: ptBR })}
                                                                </p>
                                                            </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum aviso recente</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => {
                                                        setShowAvisosDropdown(false);
                                                        setActiveTab('avisos');
                                                    }}
                                                    className="w-full text-center text-sm text-gray-900 dark:text-white font-medium hover:underline"
                                                >
                                                    Ver todos os avisos →
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Modal em Grade */}
                {sidebarOpen && (
                    <>
                        <div className="fixed inset-x-0 top-0 bg-black/50 z-[800]" style={{ bottom: 0 }} onClick={() => setSidebarOpen(false)} />
                        <div className="fixed bottom-0 left-0 right-0 z-[900] bg-white dark:bg-black rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden"
                            style={{ 
                                paddingBottom: '1rem',
                                paddingLeft: 'env(safe-area-inset-left, 0px)',
                                paddingRight: 'env(safe-area-inset-right, 0px)'
                            }}>
                            <div className="p-6">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-12 h-1 bg-gray-300 dark:bg-black rounded-full"></div>
                                </div>

                                <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-100 dark:bg-black rounded-lg">
                                    <div className="h-12 w-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">
                                        {currentMember?.nome?.charAt(0) || 'M'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{currentMember?.nome}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {currentMember?.funcoes && localMember.funcoes.length > 0
                                                ? localMember.funcoes.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')
                                                : currentMember?.funcao ? currentMember.funcao.charAt(0).toUpperCase() + currentMember.funcao.slice(1) : 'Membro'
                                            }
                                        </p>
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
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${isActive
                                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105'
                                                        : 'bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:scale-105'
                                                    }`}
                                            >
                                                {item.id === 'avisos' && unreadAvisosCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                        {unreadAvisosCount}
                                                    </span>
                                                )}
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
                <div className="flex-1 overflow-y-auto p-4" style={{ 
                    paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
                    paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
                    paddingBottom: 0
                }}>
                    {/* Início */}
                    {activeTab === 'home' && (
                        <div className="space-y-6">
                            {/* Versículo do Dia */}
                            <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                {(() => {
                                    let verse = dailyVerse;
                                    
                                    if (!verse) {
                                        const today = format(new Date(), 'yyyy-MM-dd');
                                        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
                                        verse = VERSICULOS[dayOfYear % VERSICULOS.length];
                                        localStorage.setItem('dailyVerse', JSON.stringify({ date: today, verse }));
                                        setDailyVerse(verse);
                                    }
                                    
                                    if (!verse) return null;
                                    
                                    return (
                                        <div className="space-y-3">
                                            <p className="text-lg leading-relaxed italic text-gray-700 dark:text-gray-300">
                                                "{verse.texto}"
                                            </p>
                                            <p className="text-right font-semibold text-gray-900 dark:text-white">
                                                - {verse.referencia}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Carrossel de Fotos dos Cultos */}
                            {photos.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                        Nossa Programação
                                    </h2>
                                    <div className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-xl mx-auto">
                                        <div 
                                            className="relative h-40 sm:h-44 md:h-48 bg-transparent"
                                            onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                                            onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
                                            onTouchEnd={() => {
                                                if (touchStart - touchEnd > 50) {
                                                    // Swipe left - próxima foto
                                                    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
                                                }
                                                if (touchStart - touchEnd < -50) {
                                                    // Swipe right - foto anterior
                                                    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
                                                }
                                            }}
                                        >
                                        {photos[currentPhotoIndex].url?.match(/\.(mp4|webm|ogg)$/i) ? (
                                            <video
                                                src={photos[currentPhotoIndex].url}
                                                className="w-full h-full object-cover"
                                                controls
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={photos[currentPhotoIndex].url}
                                                alt={photos[currentPhotoIndex].titulo || 'Foto do culto'}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {/* Overlay com legenda */}
                                        {(photos[currentPhotoIndex].titulo || photos[currentPhotoIndex].descricao) && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                                {photos[currentPhotoIndex].titulo && (
                                                    <p className="text-white font-semibold text-lg">
                                                        {photos[currentPhotoIndex].titulo}
                                                    </p>
                                                )}
                                                {photos[currentPhotoIndex].descricao && (
                                                    <p className="text-gray-200 text-sm mt-1">
                                                        {photos[currentPhotoIndex].descricao}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                                </div>
                                                </div>
                                                </div>
                            )}

                            {/* Ouça Agora */}
                            {playlistMusicas.length > 0 && (
                                <div className="bg-black rounded-lg shadow-lg p-6">
                                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
                                        <Music className="w-5 h-5" />
                                        Ouça Agora
                                    </h2>
                                    {(() => {
                                        let randomMusic = dailyMusic;
                                        
                                        if (!randomMusic && playlistMusicas.length > 0) {
                                            randomMusic = playlistMusicas[Math.floor(Math.random() * playlistMusicas.length)];
                                            const today = format(new Date(), 'yyyy-MM-dd');
                                            localStorage.setItem('dailyMusic', JSON.stringify({ date: today, music: randomMusic }));
                                            setDailyMusic(randomMusic);
                                        }
                                        
                                        if (!randomMusic) return null;
                                        
                                        return (
                                            <div className="bg-black rounded-lg p-4 flex items-center justify-between" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
                                                <div>
                                                    <p className="font-semibold text-lg text-white">{randomMusic.titulo}</p>
                                                    {randomMusic.artista && (
                                                        <p className="text-sm text-gray-300 mt-1">{randomMusic.artista}</p>
                                                    )}
                                                    {randomMusic.duracao && (
                                                        <p className="text-xs text-gray-400 mt-1">{randomMusic.duracao}</p>
                                                    )}
                                                </div>
                                                {randomMusic.link && (
                                                    <button
                                                        onClick={() => {
                                                            let link = randomMusic.link;
                                                            if (link.includes('youtu.be/')) {
                                                                const videoId = link.split('youtu.be/')[1].split('?')[0];
                                                                link = `https://www.youtube.com/watch?v=${videoId}`;
                                                            }
                                                            window.open(link, '_blank', 'noopener,noreferrer');
                                                        }}
                                                        className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 flex-shrink-0"
                                                    >
                                                        <Music className="w-4 h-4" />
                                                        Ouvir Agora
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Próximos Eventos */}
                            <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Próximos Eventos
                                    </h2>
                                    <button
                                        onClick={() => setActiveTab('eventos')}
                                        className="text-sm text-gray-900 dark:text-white hover:underline font-medium"
                                    >
                                        Ver calendário →
                                    </button>
                                </div>
                                {futureEvents.slice(0, 3).length > 0 ? (
                                    <div className="space-y-3">
                                        {futureEvents.slice(0, 3).map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => handleSelectEvent(event)}
                                                className="p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-gray-900 dark:border-white hover:scale-[1.02]"
                                                style={{ backgroundColor: darkMode ? '#1C1C1E' : '#ffffff' }}
                                            >
                                                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {event.tipo === 'oficina' && '🎓 '}
                                                    {event.nome}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {format(parseISO(event.data), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                                        <p className="text-gray-500 dark:text-gray-400">Nenhum evento agendado</p>
                                    </div>
                                )}
                            </div>


                        </div>
                    )}

                    {/* Eventos */}
                    {activeTab === 'eventos' && (
                        <div className="space-y-4">
                            {/* Toggle View */}
                            <div className="flex justify-end mb-4">
                                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setEventView('list')}
                                        className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${eventView === 'list'
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                                            }`}
                                    >
                                        <List className="h-4 w-4 inline mr-2" />
                                        Lista
                                    </button>
                                    <button
                                        onClick={() => setEventView('calendar')}
                                        className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${eventView === 'calendar'
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                                            }`}
                                    >
                                        <Calendar className="h-4 w-4 inline mr-2" />
                                        Calendário
                                    </button>
                                </div>
                            </div>

                            {eventView === 'calendar' && (
                                <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                    {/* Cabeçalho do Mês */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white capitalize">
                                            {format(calendarDate, 'MMMM', { locale: ptBR })}
                                        </h2>
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                                            >
                                                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <button
                                                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
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
                                    {renderCalendar()}
                                </div>
                            )}

                            {/* Lista de Eventos */}
                            {eventView === 'list' && (
                                <div className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1">Próximos Eventos</h2>
                                    {events.filter(event => isAfter(parseISO(event.data), new Date())).length > 0 ? (
                                        events
                                            .filter(event => isAfter(parseISO(event.data), new Date()))
                                            .sort((a, b) => new Date(a.data) - new Date(b.data))
                                            .map(event => {
                                                const eventDate = parseISO(event.data);
                                                const isOficina = event.tipo === 'oficina';

                                                return (
                                                    <div
                                                        key={event.id}
                                                        onClick={() => handleSelectEvent(event)}
                                                        className="rounded-lg shadow-sm p-4 border-l-4 border-gray-900 dark:border-white cursor-pointer hover:shadow-md transition-all"
                                                        style={{ backgroundColor: darkMode ? '#1C1C1E' : '#ffffff' }}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                                    {isOficina && '🎓 '}{event.nome}
                                                                </h3>
                                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                    <Clock className="h-4 w-4 mr-1" />
                                                                    <span style={{textTransform: 'capitalize'}}>{format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                                                </div>
                                                                {event.local && (
                                                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                        <span>{event.local}</span>
                                                                    </div>
                                                                )}
                                                                {event.descricao && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                                                        {event.descricao}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isOficina && (
                                                                <span className="ml-3 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-medium">
                                                                    Oficina
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div className="bg-white dark:bg-black rounded-lg shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
                                            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">Nenhum evento próximo agendado</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Avisos */}
                    {activeTab === 'avisos' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Avisos</h2>
                                {filteredAvisos.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredAvisos.map(aviso => {
                                            const notification = aviso.aviso_notifications?.[0];
                                            const isUnread = notification && !notification.lido;
                                            
                                            return (
                                                <div 
                                                    key={aviso.id} 
                                                    className={`p-4 rounded-lg border transition-colors ${
                                                        isUnread 
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                                            : 'bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                            {isUnread && (
                                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                            )}
                                                            {aviso.titulo}
                                                        </h3>
                                                        {isUnread && (
                                                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                                                Novo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 mt-2">{aviso.mensagem}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    {format(parseISO(aviso.data_envio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                </p>
                                                {aviso.destinatarios && aviso.destinatarios.length > 0 && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                                    Para: {aviso.destinatarios.join(', ')}
                                                    </p>
                                                    )}
                                                    </div>
                                                    );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum aviso disponível</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Aniversários */}
                    {activeTab === 'aniversarios' && (
                        <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aniversários</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Diaconia */}
                    {activeTab === 'diaconia' && (
                        <div className="space-y-4">
                            {isLiderDiaconia ? (
                                <>
                                    {/* Botão de ação */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setDiaconiaScheduleToEdit(null);
                                                setNewDiaconiaScheduleData({
                                                    data: format(new Date(), 'yyyy-MM-dd'),
                                                    horario: '19:00',
                                                    categoria: 'culto',
                                                    observacoes: '',
                                                    diaconosSelecionados: []
                                                });
                                                setShowDiaconiaScheduleModal(true);
                                            }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Montar escala
                                        </button>
                                    </div>

                                    {/* Card de estatísticas */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-white dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Diáconos</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                                    {diaconiaMembers.length}
                                                </p>
                                                <Heart className="w-8 h-8 text-purple-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Próximas escalas */}
                                    <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            Escalas de Diaconia ({diaconiaSchedules?.length || 0})
                                        </h3>
                                        {!diaconiaSchedules || diaconiaSchedules.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Nenhuma escala criada ainda.</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Montar escala" para criar a primeira.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {diaconiaSchedules.slice(0, 5).map((escala, index) => {
                                                    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                                                    const membrosEscalados = escala.membros_ids || [];
                                                    const isProxima = index === 0;
                                                    
                                                    return (
                                                        <div
                                                            key={escala.id}
                                                            className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-lg transition-all ${
                                                                isProxima 
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                    : 'border-gray-300 bg-white dark:bg-black dark:border-gray-600'
                                                            }`}
                                                            onClick={() => {
                                                                setDiaconiaScheduleToEdit(escala);
                                                                setNewDiaconiaScheduleData({
                                                                    data: escala.data,
                                                                    horario: escala.horario || '',
                                                                    categoria: escala.tipo || escala.categoria || 'culto',
                                                                    observacoes: escala.observacoes || '',
                                                                    diaconosSelecionados: escala.membros_ids || []
                                                                });
                                                                setShowEditDiaconiaScheduleModal(true);
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <p className={`font-semibold ${isProxima ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                                                                    {capitalizeFirstLetter(format(parseISO(escala.data), "EEEE - dd/MM/yyyy", { locale: ptBR }))}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded ${
                                                                        (escala.tipo || escala.categoria) === 'culto' 
                                                                            ? 'bg-purple-500 text-white' 
                                                                            : 'bg-orange-500 text-white'
                                                                    }`}>
                                                                        {capitalizeFirstLetter(escala.tipo || escala.categoria || 'Culto')}
                                                                    </span>
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded ${
                                                                        isProxima ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                                                                    }`}>
                                                                        {escala.horario}
                                                                    </span>
                                                                    {isProxima && (
                                                                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">Próximo</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Observações */}
                                                            {escala.observacoes && (
                                                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    <span>💡 {escala.observacoes}</span>
                                                                </div>
                                                            )}

                                                            {/* Diáconos escalados */}
                                                            {membrosEscalados.length > 0 && (
                                                                <div>
                                                                    <div className={`flex items-center gap-2 mb-2 text-sm ${
                                                                        isProxima ? 'text-blue-800 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                                                                    }`}>
                                                                        <Users className="w-4 h-4" />
                                                                        <span className="font-medium">Diáconos escalados:</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {membrosEscalados.map((membroId) => {
                                                                            const membro = diaconiaMembers.find(m => m.id === membroId);
                                                                            if (!membro) return null;
                                                                            
                                                                            return (
                                                                                <div key={membroId} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                                                                    isProxima 
                                                                                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
                                                                                        : 'bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300'
                                                                                }`}>
                                                                                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                                                        {membro.nome?.charAt(0) || 'D'}
                                                                                    </div>
                                                                                    <span className="text-xs font-medium">
                                                                                        {membro.nome || 'Diácono'}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista de Diáconos */}
                                    <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-purple-600" />
                                            Lista de Diáconos ({diaconiaMembers.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {diaconiaMembers.length === 0 ? (
                                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                                    Nenhum diácono cadastrado ainda
                                                </p>
                                            ) : (
                                                diaconiaMembers.map((membro) => {
                                                    const idade = membro.idade || calculateAge(membro.nascimento);
                                                    
                                                    return (
                                                        <div
                                                            key={membro.id}
                                                            className="flex items-center justify-between gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                                    {membro.nome?.charAt(0)?.toUpperCase() || 'D'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 dark:text-white uppercase">
                                                                        {membro.nome || 'Sem nome'}
                                                                    </p>
                                                                    {membro.telefone ? (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{membro.telefone}</p>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-500 italic">Sem telefone</p>
                                                                    )}
                                                                    {idade && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-500">{idade} anos</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Heart className="w-6 h-6 mr-2 text-purple-600" />
                                            Ministério de Diaconia
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Ministério dedicado ao serviço e cuidado da igreja.
                                        </p>
                                    </div>

                                    {/* Escalas para membros normais */}
                                    <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            Escalas de Diaconia ({diaconiaSchedules?.length || 0})
                                        </h3>
                                        {!diaconiaSchedules || diaconiaSchedules.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Nenhuma escala criada ainda.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {diaconiaSchedules.slice(0, 5).map((escala, index) => {
                                                    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                                                    const membrosEscalados = escala.membros_ids || [];
                                                    const isEscalado = membrosEscalados.includes(localMember?.id);
                                                    const isProxima = index === 0;
                                                    
                                                    return (
                                                        <div
                                                            key={escala.id}
                                                            className={`p-4 rounded-lg border-l-4 ${
                                                                isProxima 
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                    : isEscalado 
                                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                                                        : 'border-gray-300 bg-white dark:bg-black'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <p className={`font-semibold ${
                                                                    isProxima ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                                                                }`}>
                                                                    {capitalizeFirstLetter(format(parseISO(escala.data), "EEEE - dd/MM/yyyy", { locale: ptBR }))}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded ${
                                                                        (escala.tipo || escala.categoria) === 'culto' 
                                                                            ? 'bg-purple-500 text-white' 
                                                                            : 'bg-orange-500 text-white'
                                                                    }`}>
                                                                        {capitalizeFirstLetter(escala.tipo || escala.categoria || 'Culto')}
                                                                    </span>
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded ${
                                                                        isProxima ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                                                                    }`}>
                                                                        {escala.horario}
                                                                    </span>
                                                                    {isProxima && (
                                                                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">Próximo</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {isEscalado && (
                                                                <div className="mb-3">
                                                                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                                                        ✓ Você está escalado
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Diáconos escalados */}
                                                            {membrosEscalados.length > 0 && (
                                                                <div className="mt-3">
                                                                    <div className={`flex items-center gap-2 mb-2 text-sm ${
                                                                        isProxima ? 'text-blue-800 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                                                                    }`}>
                                                                        <Users className="w-4 h-4" />
                                                                        <span className="font-medium">Diáconos escalados:</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {membrosEscalados.map((membroId) => {
                                                                            const membro = diaconiaMembers.find(m => m.id === membroId);
                                                                            if (!membro) return null;
                                                                            
                                                                            return (
                                                                                <div key={membroId} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                                                                    isProxima 
                                                                                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
                                                                                        : 'bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300'
                                                                                }`}>
                                                                                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                                                        {membro.nome?.charAt(0) || 'D'}
                                                                                    </div>
                                                                                    <span className="text-xs font-medium">
                                                                                        {membro.nome || 'Diácono'}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {escala.observacoes && (
                                                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    <span>💡 {escala.observacoes}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Louvor */}
                    {activeTab === 'louvor' && (
                        <div className="space-y-4">
                            {isLiderLouvor ? (
                                <>
                                    {/* Botões de ação */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowCreateScheduleModal(true)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Nova Escala
                                        </button>
                                        <button
                                            onClick={() => {
                                                setNewMusicData({ nome: '', artista: '', link: '' });
                                                setShowMusicModal(true);
                                            }}
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Nova Música
                                        </button>
                                    </div>

                                    {/* Cards de estatísticas */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setShowMusiciansModal(true)}
                                            className="bg-white dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:scale-105 transition-all"
                                        >
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Músicos Ativos</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {(() => {
                                                        const musicosUnicos = new Set();
                                                        louvorSchedules.forEach(escala => {
                                                            escala.musicos?.forEach(m => musicosUnicos.add(m.id));
                                                        });
                                                        return musicosUnicos.size || louvorMembers.length;
                                                    })()}
                                                </p>
                                                <Music className="w-8 h-8 text-purple-500" />
                                            </div>
                                        </div>
                                        <div 
                                            onClick={() => setShowMusicListModal(true)}
                                            className="bg-white dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:scale-105 transition-all"
                                        >
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Músicas Cadastradas</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{playlistMusicas.length}</p>
                                                <Music className="w-8 h-8 text-green-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Próximas escalas */}
                                    <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            Próximas escalas ({louvorSchedules?.length || 0})
                                        </h3>
                                        {!louvorSchedules || louvorSchedules.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Nenhuma escala criada ainda.</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Escala" para criar a primeira.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {louvorSchedules.slice(0, 5).map((escala) => {
                                                    const totalMusicas = escala.musicas ? escala.musicas.length : 0;
                                                    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                                                    
                                                    return (
                                                        <div
                                                            key={escala.id}
                                                            className="p-4 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                                                            onClick={() => {
                                                                // Preparar dados para edição
                                                                const instrumentos = {};
                                                                escala.musicos?.forEach(musico => {
                                                                    instrumentos[musico.instrumento] = musico.id;
                                                                });
                                                                
                                                                setScheduleToEdit(escala);
                                                                setNewScheduleData({
                                                                    data: escala.data,
                                                                    horario: escala.horario || '',
                                                                    categoria: escala.tipo || escala.categoria || 'culto',
                                                                    observacoes: escala.observacoes || '',
                                                                    musicas: escala.musicas || [],
                                                                    instrumentos: instrumentos
                                                                });
                                                                setShowEditScheduleModal(true);
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {capitalizeFirstLetter(format(parseISO(escala.data), "EEEE - dd/MM/yyyy", { locale: ptBR }))}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded">
                                                                        {capitalizeFirstLetter(escala.tipo || escala.categoria || 'Culto')}
                                                                    </span>
                                                                    <span className="px-3 py-1 bg-gray-400 text-white text-xs font-medium rounded">
                                                                        {escala.horario}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Músicas */}
                                                            {totalMusicas > 0 && (
                                                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    <Music className="w-4 h-4" />
                                                                    <span>{totalMusicas} música{totalMusicas !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            )}

                                                            {/* Músicos escalados */}
                                                            {escala.musicos && escala.musicos.length > 0 && (
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                                        <Users className="w-4 h-4" />
                                                                        <span>Músicos escalados:</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {escala.musicos.map((musico, idx) => (
                                                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                                                                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                                                    {musico.nome?.charAt(0) || 'M'}
                                                                                </div>
                                                                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                                                                    {musico.nome?.split(' ')[0] || 'Músico'} - {musico.instrumento}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Equipe de Louvor */}
                                    <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Equipe de Louvor</h3>
                                        <div className="space-y-2">
                                            {(() => {
                                                const louvorMusicosMap = new Map();
                                                louvorSchedules.forEach(escala => {
                                                    escala.musicos?.forEach(musico => {
                                                        if (!louvorMusicosMap.has(musico.id)) {
                                                            louvorMusicosMap.set(musico.id, {
                                                                ...musico,
                                                                instrumentos: new Set([musico.instrumento])
                                                            });
                                                        } else {
                                                            louvorMusicosMap.get(musico.id).instrumentos.add(musico.instrumento);
                                                        }
                                                    });
                                                });
                                                
                                                if (louvorMusicosMap.size === 0) {
                                                    return (
                                                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                                            Nenhum músico escalado ainda
                                                        </p>
                                                    );
                                                }
                                                
                                                return Array.from(louvorMusicosMap.values()).map((musico) => {
                                                    return (
                                                        <div
                                                            key={musico.id}
                                                            className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-black/50 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                                    <Music className="w-5 h-5" />
                                                                </div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{musico.nome}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 justify-end">
                                                                {Array.from(musico.instrumentos).map(inst => (
                                                                    <span key={inst} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                                                        {inst}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Music className="w-6 h-6 mr-2 text-purple-600" />
                                            Ministério de Louvor
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Ministério dedicado a conduzir a congregação em adoração através da música.
                                        </p>
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Confira as músicas que estamos cantando na aba "Playlist Zoe" 🎵
                                            </p>
                                        </div>
                                    </div>

                                    {/* Próximas escalas para membros normais */}
                                    <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            Próximas escalas ({louvorSchedules?.length || 0})
                                        </h3>
                                        {!louvorSchedules || louvorSchedules.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Nenhuma escala criada ainda.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {louvorSchedules.slice(0, 5).map((escala) => {
                                                    const totalMusicas = escala.musicas ? escala.musicas.length : 0;
                                                    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
                                                    
                                                    return (
                                                        <div
                                                            key={escala.id}
                                                            className="p-4 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                                                            onClick={() => {
                                                                // Preparar dados para edição
                                                                const instrumentos = {};
                                                                escala.musicos?.forEach(musico => {
                                                                    instrumentos[musico.instrumento] = musico.id;
                                                                });
                                                                
                                                                setScheduleToEdit(escala);
                                                                setNewScheduleData({
                                                                    data: escala.data,
                                                                    horario: escala.horario || '',
                                                                    categoria: escala.tipo || escala.categoria || 'culto',
                                                                    observacoes: escala.observacoes || '',
                                                                    musicas: escala.musicas || [],
                                                                    instrumentos: instrumentos
                                                                });
                                                                setShowEditScheduleModal(true);
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {capitalizeFirstLetter(format(parseISO(escala.data), "EEEE - dd/MM/yyyy", { locale: ptBR }))}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded">
                                                                        {capitalizeFirstLetter(escala.tipo || escala.categoria || 'Culto')}
                                                                    </span>
                                                                    <span className="px-3 py-1 bg-gray-400 text-white text-xs font-medium rounded">
                                                                        {escala.horario}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Músicas */}
                                                            {totalMusicas > 0 && (
                                                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    <Music className="w-4 h-4" />
                                                                    <span>{totalMusicas} música{totalMusicas !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            )}

                                                            {/* Músicos escalados */}
                                                            {escala.musicos && escala.musicos.length > 0 && (
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                                        <Users className="w-4 h-4" />
                                                                        <span>Músicos escalados:</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {escala.musicos.map((musico, idx) => (
                                                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                                                                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                                                    {musico.nome?.charAt(0) || 'M'}
                                                                                </div>
                                                                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                                                                    {musico.nome?.split(' ')[0] || 'Músico'} - {musico.instrumento}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Playlist Zoe */}
                    {activeTab === 'galeria' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Galeria de Fotos</h2>
                            
                            {photos.length === 0 ? (
                                <div className="bg-white dark:bg-black rounded-lg shadow-sm p-12 border border-gray-200 dark:border-gray-700 text-center">
                                    <Image className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Nenhuma foto na galeria ainda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {photos.map((photo) => (
                                        <div 
                                            key={photo.id}
                                            className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white dark:bg-black"
                                            onClick={() => {
                                                setSelectedPhoto(photo);
                                                setShowPhotoDetailsModal(true);
                                            }}
                                        >
                                            <img 
                                                src={photo.url} 
                                                alt={photo.titulo}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-2">
                                                    <p className="font-semibold text-sm">{photo.titulo}</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                                                    {photo.categoria}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Modal de Detalhes da Foto */}
                            {selectedPhoto && (
                                <Modal
                                    isOpen={showPhotoDetailsModal}
                                    onClose={() => setShowPhotoDetailsModal(false)}
                                    title={selectedPhoto.titulo}
                                    maxWidth="max-w-4xl"
                                >
                                    <div className="space-y-4">
                                        <img 
                                            src={selectedPhoto.url} 
                                            alt={selectedPhoto.titulo}
                                            className="w-full rounded-lg"
                                        />
                                        
                                        {selectedPhoto.descricao && (
                                            <p className="text-gray-600 dark:text-gray-400">{selectedPhoto.descricao}</p>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Categoria</p>
                                                <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedPhoto.categoria}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Data</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {selectedPhoto.data_foto ? format(new Date(selectedPhoto.data_foto), 'dd/MM/yyyy') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Modal>
                            )}
                        </div>
                    )}

                    {activeTab === 'playlistzoe' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Music className="w-6 h-6 mr-2 text-red-600" />
                                    Playlist Zoe
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Músicas que estamos cantando nos cultos e encontros
                                </p>

                                <div className="space-y-3">
                                    {playlistMusicas.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Music className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">Nenhuma música adicionada ainda.</p>
                                        </div>
                                    ) : (
                                        playlistMusicas.map((musica) => (
                                            <div key={musica.id} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-l-4 border-red-500">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{musica.titulo}</h4>
                                                        {musica.artista && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{musica.artista}</p>
                                                        )}
                                                        {musica.duracao && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{musica.duracao}</p>
                                                        )}
                                                    </div>
                                                    {musica.link && (
                                                        <button
                                                            onClick={() => {
                                                                // Converter youtu.be para youtube.com se necessário
                                                                let link = musica.link;
                                                                if (link.includes('youtu.be/')) {
                                                                    const videoId = link.split('youtu.be/')[1].split('?')[0];
                                                                    link = `https://www.youtube.com/watch?v=${videoId}`;
                                                                }
                                                                window.open(link, '_blank', 'noopener,noreferrer');
                                                            }}
                                                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
                                                        >
                                                            <Music className="w-4 h-4" />
                                                            Ouvir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Kids */}
                    {activeTab === 'kids' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Kids</h1>
                                {isLiderKids && (
                                    <button 
                                        onClick={() => setShowKidsScheduleModal(true)}
                                        className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nova Escala
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div 
                                    onClick={() => setShowKidsListModal(true)}
                                    className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-pink-500 dark:hover:border-pink-400 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Crianças</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {kidsMembers?.criancas?.length || 0}
                                            </p>
                                        </div>
                                        <Baby className="w-8 h-8 text-pink-500" />
                                    </div>
                                </div>
                                
                                <div 
                                    onClick={() => setShowProfessoresListModal(true)}
                                    className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Professores</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {kidsMembers?.professores?.length || 0}
                                            </p>
                                        </div>
                                        <Users className="w-8 h-8 text-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Crianças por Faixa Etária</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Baby className="w-5 h-5 text-yellow-600" />
                                            <span className="text-gray-900 dark:text-white">0-3 anos</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {kidsMembers?.criancas?.filter(m => {
                                                const age = calculateAge(m.nascimento);
                                                return age !== null && age <= 3;
                                            }).length || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Baby className="w-5 h-5 text-orange-600" />
                                            <span className="text-gray-900 dark:text-white">4-7 anos</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {kidsMembers?.criancas?.filter(m => {
                                                const age = calculateAge(m.nascimento);
                                                return age >= 4 && age <= 7;
                                            }).length || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Baby className="w-5 h-5 text-pink-600" />
                                            <span className="text-gray-900 dark:text-white">8-12 anos</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {kidsMembers?.criancas?.filter(m => {
                                                const age = calculateAge(m.nascimento);
                                                return age >= 8 && age <= 12;
                                            }).length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-black rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-pink-600" />
                                    Próximas Escalas ({kidsSchedules.length})
                                </h3>
                                {kidsSchedules.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">Nenhuma escala criada ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {kidsSchedules
                                            .sort((a, b) => new Date(a.data) - new Date(b.data))
                                            .slice(0, 5)
                                            .map((escala, idx) => {
                                                // Extrair turmas da descrição
                                                const turmas = escala.descricao?.includes('Turmas:') 
                                                    ? escala.descricao.replace('Turmas: ', '').split(', ')
                                                    : [];
                                                const hasPequenos = turmas.includes('Pequenos');
                                                const hasGrandes = turmas.includes('Grandes');
                                                
                                                let cardClasses = "p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-shadow ";
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
                                                        className={cardClasses}
                                                        onClick={() => {
                                                            setSelectedKidsSchedule(escala);
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
                                                        {turmas.length > 0 && (
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
                                                                {escala.membros_ids?.map((profId, i) => {
                                                                    const prof = kidsMembers.all?.find(m => m.id === profId);
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
                    )}

                    {/* Jovens */}
                    {activeTab === 'jovens' && (
                        <div className="space-y-4">
                            {isLiderJovens && (
                                <div className="flex justify-between items-center">
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Jovens</h1>
                                    <button
                                        onClick={() => {
                                            setSelectedOficina(null);
                                            setOficinaFormData({
                                                nome: '',
                                                descricao: '',
                                                data: format(new Date(), 'yyyy-MM-dd'),
                                                horario: '19:00',
                                                local: '',
                                                vagas: 12,
                                                inscritos: 0,
                                                quem_pode_se_inscrever: ['todos']
                                            });
                                            setShowOficinaModal(true);
                                        }}
                                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nova Oficina
                                    </button>
                                </div>
                            )}

                            {isLiderJovens && (
                                <div 
                                    onClick={() => setShowJovensListModal(true)}
                                    className="card cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Jovens</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {jovensMembers.filter(m => {
                                                    const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                                    return funcoes.includes('jovem');
                                                }).length}
                                            </p>
                                        </div>
                                        <Sparkles className="w-8 h-8 text-indigo-500" />
                                    </div>
                                </div>
                            )}

                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Jovens por Faixa Etária</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-blue-600" />
                                            <span className="text-gray-900 dark:text-white">13-18 anos (Adolescentes)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {jovensMembers.filter(j => {
                                                const funcoes = j.funcoes || (j.funcao ? [j.funcao] : []);
                                                const age = calculateAge(j.nascimento);
                                                return funcoes.includes('jovem') && age >= 13 && age <= 18;
                                            }).length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-indigo-600" />
                                            <span className="text-gray-900 dark:text-white">19-24 anos (Jovens)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {jovensMembers.filter(j => {
                                                const funcoes = j.funcoes || (j.funcao ? [j.funcao] : []);
                                                const age = calculateAge(j.nascimento);
                                                return funcoes.includes('jovem') && age >= 19 && age <= 24;
                                            }).length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-purple-600" />
                                            <span className="text-gray-900 dark:text-white">25+ anos (Jovens Adultos)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {jovensMembers.filter(j => {
                                                const funcoes = j.funcoes || (j.funcao ? [j.funcao] : []);
                                                const age = calculateAge(j.nascimento);
                                                return funcoes.includes('jovem') && age >= 25;
                                            }).length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Oficinas</h3>
                                    {isLiderJovens && (
                                        <button
                                            onClick={() => setShowOficinaModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Nova Oficina
                                        </button>
                                    )}
                                </div>
                                {oficinas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Sparkles className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">Nenhuma oficina cadastrada ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {oficinas.map((oficina) => (
                                            <div
                                                key={oficina.id}
                                                className="p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                                onClick={() => handleViewOficinaDetails(oficina)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                            {oficina.nome}
                                                        </h4>
                                                        {oficina.descricao && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                {oficina.descricao}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {oficina.data && format(new Date(oficina.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                            </span>
                                                            {oficina.vagas && (
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3" />
                                                                    {oficina.vagas} vagas
                                                                </span>
                                                            )}
                                                            {oficina.local && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {oficina.local}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isLiderJovens && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteOficina(oficina.id);
                                                            }}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Configurações */}
                    {activeTab === 'configuracoes' && (
                        <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Configurações</h2>
                            <p className="text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento</p>
                        </div>
                    )}

                    {/* Configurações */}
                    {activeTab === 'configuracoes' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <Settings className="w-6 h-6 mr-2 text-black dark:text-white" />
                                    Configurações
                                </h2>

                                {/* Perfil do Usuário */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meu Perfil</h3>

                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-black/50 rounded-lg">
                                        <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center text-white font-bold text-2xl">
                                            {currentMember?.nome?.charAt(0) || 'M'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{currentMember?.nome}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {currentMember?.funcoes && localMember.funcoes.length > 0
                                                    ? localMember.funcoes.join(', ')
                                                    : currentMember?.funcao || 'Membro'
                                                }
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                // Garantir que funcoes seja sempre um array
                                                let funcoesArray = [];

                                                if (Array.isArray(currentMember?.funcoes) && localMember.funcoes.length > 0) {
                                                    funcoesArray = [...localMember.funcoes];
                                                } else if (currentMember?.funcao) {
                                                    funcoesArray = [localMember.funcao];
                                                } else {
                                                    funcoesArray = ['membro'];
                                                }

                                                console.log('Abrindo modal de edição com funções:', funcoesArray);

                                                setEditProfileData({
                                                    nome: currentMember?.nome || '',
                                                    telefone: currentMember?.telefone || '',
                                                    nascimento: currentMember?.nascimento || '',
                                                    genero: currentMember?.genero || '',
                                                    funcoes: funcoesArray
                                                });
                                                setShowEditProfileModal(true);
                                            }}
                                            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar Perfil
                                        </button>
                                    </div>

                                    {/* Informações do Perfil */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{currentMember?.telefone || 'Não informado'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Data de Nascimento</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {currentMember?.nascimento
                                                    ? format(parseISO(localMember.nascimento), "dd/MM/yyyy", { locale: ptBR })
                                                    : 'Não informado'
                                                }
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Idade</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {currentMember?.nascimento
                                                    ? `${calculateAge(localMember.nascimento)} anos`
                                                    : 'Não informado'
                                                }
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Família</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{currentMember?.familia || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferências</h3>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Modo Escuro</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Sincronizado com o sistema</p>
                                        </div>
                                        <div className="p-2 bg-white dark:bg-black rounded-lg">
                                            {darkMode ? <Moon className="h-5 w-5 text-gray-900 dark:text-white" /> : <Sun className="h-5 w-5 text-gray-900 dark:text-white" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div
                                        className="flex items-center justify-between cursor-pointer p-4"
                                        onClick={() => {
                                            const familyId = myFamily?.nome || localMember.familia;
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
                                                    {myFamily?.nome || localMember.familia}
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
                                                className="p-2 bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                                                title="Editar Família"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            {expandedFamilies[myFamily?.nome || localMember.familia] ? (
                                                <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400 transform rotate-90 transition-transform" />
                                            ) : (
                                                <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform" />
                                            )}
                                        </div>
                                    </div>

                                    {expandedFamilies[myFamily?.nome || localMember.familia] && (
                                        <div className="space-y-3 p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                                            {myFamily ? (
                                                // Mostrar membros da família criada
                                                myFamily.membros.map((member, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
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
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm">
                                                            {currentMember?.nome?.charAt(0) || 'M'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {localMember.nome} (Você)
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <span>{localMember.funcao || 'Membro'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
                                    <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Você ainda não pertence a uma família.</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Clique em "Criar Família" para começar.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal de Adicionar Membro */}
                <Modal
                    isOpen={showAddMemberModal}
                    onClose={() => {
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
                    title="Adicionar Novo Membro"
                    maxWidth="max-w-2xl"
                >
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
                                        familia: localMember.familia || localMember.nome,
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
                                            nome: localMember.familia || localMember.nome,
                                            descricao: '',
                                            membros: [
                                                {
                                                    nome: localMember.nome,
                                                    funcao: localMember.funcao || 'Membro',
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        placeholder="(11) 98765-4321"
                                    />
                                </div>

                                <div>
                                    <CustomCalendar
                                        label="Data de Nascimento"
                                        value={newMemberData.dataNascimento}
                                        onChange={(date) => {
                                            const calculatedAge = calculateAge(date);
                                            setNewMemberData({
                                                ...newMemberData,
                                                dataNascimento: date,
                                                idade: calculatedAge !== null ? calculatedAge.toString() : ''
                                            });
                                        }}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                    <div className="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-black/50">
                                        {['Membro', 'Jovem', 'Louvor', 'Diaconia', 'Professor kids'].map((funcao) => {
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
                                                        <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${isChecked
                                                                ? 'bg-blue-600 border-blue-600'
                                                                : 'bg-white border-gray-400 dark:bg-black dark:border-gray-500'
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

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Adicionar Membro
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Modal de Criar Família */}
                <Modal
                    isOpen={showFamilyModal}
                    onClose={() => {
                        setShowFamilyModal(false);
                        setNewFamilyData({ nome: '', descricao: '' });
                        setSelectedMembers([]);
                        setFamilyMemberSearch('');
                    }}
                    title="Criar Nova Família"
                    maxWidth="max-w-2xl"
                >

                            <form onSubmit={async (e) => {
                                e.preventDefault();

                                try {
                                    // Criar família com o membro atual e membros selecionados
                                    const familyMembers = [
                                        {
                                            id: localMember.id,
                                            nome: localMember.nome,
                                            funcao: localMember.funcao || 'Membro',
                                            funcoes: localMember.funcoes || [],
                                            idade: localMember.idade,
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-black dark:text-white text-sm"
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
                                                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => { }}
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

                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
                                    >
                                        Criar Família
                                    </button>
                                </div>
                            </form>
                </Modal>

                {/* Modal de Editar Família */}
                <Modal
                    isOpen={showEditFamilyModal}
                    onClose={() => {
                        setShowEditFamilyModal(false);
                    }}
                    title="Editar Família"
                    maxWidth="max-w-2xl"
                >

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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        placeholder="Informações adicionais sobre a família..."
                                    />
                                </div>

                                {/* Lista de Membros */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Membros da Família
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSearchMemberModal(true);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Adicionar Membro
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                        {myFamily?.membros && myFamily.membros.length > 0 ? (
                                            myFamily.membros.map((membro) => (
                                                <div
                                                    key={membro.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {membro.nome}
                                                                {membro.id === localMember.id && (
                                                                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                                                        Você
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {membro.funcoes?.join(', ') || 'Membro'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {membro.id !== localMember.id && (
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (confirm(`Deseja remover ${membro.nome} da família?`)) {
                                                                    try {
                                                                        const newMembrosIds = editFamilyData.membrosIds.filter(id => id !== membro.id);
                                                                        setEditFamilyData({
                                                                            ...editFamilyData,
                                                                            membrosIds: newMembrosIds
                                                                        });
                                                                        
                                                                        // Atualizar no banco
                                                                        const { updateFamily } = await import('../lib/supabaseService');
                                                                        await updateFamily(editFamilyData.id, {
                                                                            membros_ids: newMembrosIds
                                                                        });
                                                                        
                                                                        // Atualizar estado local
                                                                        setMyFamily({
                                                                            ...myFamily,
                                                                            membros: myFamily.membros.filter(m => m.id !== membro.id)
                                                                        });
                                                                        
                                                                        alert('Membro removido com sucesso!');
                                                                    } catch (error) {
                                                                        console.error('Erro ao remover membro:', error);
                                                                        alert('Erro ao remover membro.');
                                                                    }
                                                                }
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                            title="Remover membro"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                                Nenhum membro na família ainda.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                </Modal>

                {/* Modal de Buscar e Adicionar Membro Existente */}
                <Modal
                    isOpen={showSearchMemberModal}
                    onClose={() => {
                        setShowSearchMemberModal(false);
                        setMemberSearchQuery('');
                        setMemberSearchResults([]);
                    }}
                    title="Adicionar Membro à Família"
                    maxWidth="max-w-2xl"
                >

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Buscar Membro
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={memberSearchQuery}
                                        onChange={async (e) => {
                                            setMemberSearchQuery(e.target.value);
                                            if (e.target.value.trim().length >= 2) {
                                                try {
                                                    const results = await searchMembers(e.target.value.trim());
                                                    // Filtrar membros que já estão na família
                                                    const filtered = results.filter(m => 
                                                        !myFamily?.membros?.some(fm => fm.id === m.id)
                                                    );
                                                    setMemberSearchResults(filtered);
                                                } catch (error) {
                                                    console.error('Erro ao buscar membros:', error);
                                                    setMemberSearchResults([]);
                                                }
                                            } else {
                                                setMemberSearchResults([]);
                                            }
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black dark:text-white"
                                        placeholder="Digite o nome do membro..."
                                    />
                                </div>
                            </div>

                            {/* Resultados da busca */}
                            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                                {memberSearchQuery.trim().length >= 2 && memberSearchResults.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                        Nenhum membro encontrado
                                    </p>
                                )}
                                {memberSearchResults.map((membro) => (
                                    <div
                                        key={membro.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
                                    >
                                        <div className="flex items-center gap-3">
                                            <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {membro.nome}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {membro.funcoes?.join(', ') || 'Membro'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    // Adicionar membro à família
                                                    const newMembrosIds = [...(editFamilyData.membrosIds || []), membro.id];
                                                    
                                                    // Atualizar no banco
                                                    const { updateFamily } = await import('../lib/supabaseService');
                                                    await updateFamily(editFamilyData.id, {
                                                        membros_ids: newMembrosIds
                                                    });
                                                    
                                                    // Atualizar estados locais
                                                    setEditFamilyData({
                                                        ...editFamilyData,
                                                        membrosIds: newMembrosIds
                                                    });
                                                    
                                                    setMyFamily({
                                                        ...myFamily,
                                                        membros: [...(myFamily.membros || []), membro]
                                                    });
                                                    
                                                    // Limpar busca e fechar modal
                                                    setMemberSearchQuery('');
                                                    setMemberSearchResults([]);
                                                    setShowSearchMemberModal(false);
                                                    
                                                    alert(`${membro.nome} foi adicionado à família!`);
                                                } catch (error) {
                                                    console.error('Erro ao adicionar membro:', error);
                                                    alert('Erro ao adicionar membro à família.');
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                ))}
                            </div>

                </Modal>

                {/* Modal de Editar Perfil */}
                <Modal
                    isOpen={showEditProfileModal}
                    onClose={() => {
                        setShowEditProfileModal(false);
                    }}
                    title="Editar Perfil"
                    maxWidth="max-w-2xl"
                >

                            <form onSubmit={async (e) => {
                                e.preventDefault();

                                try {
                                    console.log('Iniciando atualização de perfil...', {
                                        id: localMember.id,
                                        dados: editProfileData,
                                        funcoesAtuais: localMember.funcoes
                                    });

                                    // Validar se há pelo menos uma função selecionada
                                    if (!editProfileData.funcoes || editProfileData.funcoes.length === 0) {
                                        alert('Selecione pelo menos uma função');
                                        return;
                                    }

                                    console.log('Funções que serão salvas:', editProfileData.funcoes);

                                    // Atualizar perfil no Supabase
                                    const updatedMember = await updateMember(localMember.id, {
                                        nome: editProfileData.nome,
                                        telefone: editProfileData.telefone || null,
                                        nascimento: editProfileData.nascimento || null,
                                        genero: editProfileData.genero || null,
                                        funcoes: editProfileData.funcoes
                                    });

                                    console.log('Perfil atualizado com sucesso:', updatedMember);

                                    // Atualizar o membro atual localmente
                                    Object.assign(currentMember, updatedMember);

                                    // Atualizar o localStorage com os novos dados
                                    localStorage.setItem('current_member', JSON.stringify(updatedMember));
                                    console.log('localStorage atualizado:', updatedMember);

                                    setShowEditProfileModal(false);
                                    alert('Perfil atualizado com sucesso!');

                                    // Recarregar a página para refletir as mudanças
                                    window.location.reload();
                                } catch (error) {
                                    console.error('Erro detalhado ao atualizar perfil:', error);
                                    alert(`Erro ao atualizar perfil: ${error.message || 'Tente novamente'}`);
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editProfileData.nome}
                                        onChange={(e) => setEditProfileData({ ...editProfileData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={editProfileData.telefone}
                                        onChange={(e) => setEditProfileData({ ...editProfileData, telefone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="date"
                                        value={editProfileData.nascimento}
                                        onChange={(e) => setEditProfileData({ ...editProfileData, nascimento: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Gênero
                                    </label>
                                    <select
                                        value={editProfileData.genero}
                                        onChange={(e) => setEditProfileData({ ...editProfileData, genero: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Selecione</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Funções
                                    </label>
                                    <div className="space-y-2">
                                        {['membro', 'diaconia', 'louvor', 'jovens'].map(funcao => {
                                            const isChecked = editProfileData.funcoes.includes(funcao);
                                            return (
                                                <label
                                                    key={funcao}
                                                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${isChecked
                                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                                                            : 'bg-gray-50 dark:bg-black/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                >
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setEditProfileData({
                                                                        ...editProfileData,
                                                                        funcoes: [...editProfileData.funcoes, funcao]
                                                                    });
                                                                } else {
                                                                    setEditProfileData({
                                                                        ...editProfileData,
                                                                        funcoes: editProfileData.funcoes.filter(f => f !== funcao)
                                                                    });
                                                                }
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                                            isChecked 
                                                                ? 'bg-blue-600 border-blue-600' 
                                                                : 'bg-transparent border-gray-300 dark:border-gray-600'
                                                        }`}>
                                                            {isChecked && (
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-medium capitalize ${isChecked
                                                            ? 'text-blue-700 dark:text-blue-300'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {funcao}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                </Modal>

                {/* Modal de Lista de Crianças */}
                {showKidsListModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-black rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Baby className="w-6 h-6 text-pink-500" />
                                        Crianças Cadastradas
                                    </h2>
                                    <button
                                        onClick={() => setShowKidsListModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                                    >
                                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto max-h-[60vh]">
                                    {kidsMembers?.criancas?.length > 0 ? (
                                        <div className="space-y-3">
                                            {kidsMembers.criancas.map((crianca) => {
                                                const idade = crianca.idade || (crianca.nascimento ? calculateAge(crianca.nascimento) : null);
                                                let faixaEtaria = '';
                                                if (idade !== null) {
                                                    if (idade <= 3) faixaEtaria = '0-3 anos';
                                                    else if (idade <= 7) faixaEtaria = '4-7 anos';
                                                    else faixaEtaria = '8-12 anos';
                                                }
                                                
                                                return (
                                                    <div 
                                                        key={crianca.id}
                                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-black/50"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {crianca.nome}
                                                                </p>
                                                                <div className="flex items-center gap-4 mt-1">
                                                                    {idade !== null && (
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {idade} {idade === 1 ? 'ano' : 'anos'}
                                                                        </span>
                                                                    )}
                                                                    {faixaEtaria && (
                                                                        <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                                                                            {faixaEtaria}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Baby className="w-5 h-5 text-pink-500" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Baby className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Nenhuma criança cadastrada ainda.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Lista de Professores */}
                {showProfessoresListModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-7 h-7 text-blue-500" />
                                        Professores Kids
                                    </h2>
                                    <button
                                        onClick={() => setShowProfessoresListModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {kidsMembers?.professores?.length > 0 ? (
                                        kidsMembers.professores.map((professor) => {
                                            const age = calculateAge(professor.nascimento);
                                            const isLider = professor.funcoes?.includes('lider kids');
                                            
                                            return (
                                                <div 
                                                    key={professor.id}
                                                    className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-black"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                                                            {getInitials(professor.nome)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    {professor.nome}
                                                                </h3>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                                    isLider 
                                                                        ? 'bg-pink-600 text-white' 
                                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                }`}>
                                                                    {isLider ? 'Líder Kids' : 'Professor Kids'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                                {professor.telefone && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Phone className="w-4 h-4" />
                                                                        <span>{professor.telefone}</span>
                                                                    </div>
                                                                )}
                                                                {age && <span>• {age} anos</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Nenhum professor cadastrado ainda.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        onClick={() => setShowProfessoresListModal(false)}
                                        className="px-6 py-2 bg-gray-300 dark:bg-black text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-9000"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Lista de Jovens */}
                {showJovensListModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="w-7 h-7 text-indigo-500" />
                                        Jovens Cadastrados
                                    </h2>
                                    <button
                                        onClick={() => setShowJovensListModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {jovensMembers.filter(m => {
                                        const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                        return funcoes.includes('jovem');
                                    }).length > 0 ? (
                                        jovensMembers.filter(m => {
                                            const funcoes = m.funcoes || (m.funcao ? [m.funcao] : []);
                                            return funcoes.includes('jovem');
                                        }).map((jovem) => {
                                            const age = calculateAge(jovem.nascimento);
                                            const isLider = jovem.funcoes?.includes('lider_jovens');
                                            
                                            return (
                                                <div 
                                                    key={jovem.id}
                                                    className="p-4 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-black"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                                                            {getInitials(jovem.nome)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    {jovem.nome}
                                                                </h3>
                                                                {isLider && (
                                                                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-600 text-white">
                                                                        Líder de Jovens
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                                {jovem.telefone && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Phone className="w-4 h-4" />
                                                                        <span>{jovem.telefone}</span>
                                                                    </div>
                                                                )}
                                                                {age && <span>• {age} anos</span>}
                                                                {age && (
                                                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                                                        age >= 13 && age <= 18 
                                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                                                            : age >= 19 && age <= 24
                                                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                                    }`}>
                                                                        {age >= 13 && age <= 18 
                                                                            ? 'Adolescente' 
                                                                            : age >= 19 && age <= 24
                                                                                ? 'Jovem'
                                                                                : 'Jovem Adulto'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Nenhum jovem cadastrado ainda.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        onClick={() => setShowJovensListModal(false)}
                                        className="px-6 py-2 bg-gray-300 dark:bg-black text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-9000"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Nova Escala Kids */}
                {showKidsScheduleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-7 h-7 text-pink-600" />
                                        Nova Escala de Professores
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowKidsScheduleModal(false);
                                            setNewKidsScheduleData({
                                                turmas: [],
                                                data: format(new Date(), 'yyyy-MM-dd'),
                                                horario: '09:00',
                                                professoresSelecionados: []
                                            });
                                        }}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (newKidsScheduleData.turmas.length === 0) {
                                        alert('Selecione pelo menos uma turma!');
                                        return;
                                    }
                                    if (newKidsScheduleData.professoresSelecionados.length === 0) {
                                        alert('Selecione pelo menos um professor!');
                                        return;
                                    }
                                    
                                    try {
                                        // Salvar no Supabase
                                        const scheduleData = {
                                            ministerio: 'kids',
                                            descricao: `Turmas: ${newKidsScheduleData.turmas.join(', ')}`,
                                            data: `${newKidsScheduleData.data}T${newKidsScheduleData.horario}:00`,
                                            horario: newKidsScheduleData.horario,
                                            membros_ids: newKidsScheduleData.professoresSelecionados
                                        };
                                        
                                        const savedSchedule = await createMinistrySchedule(scheduleData);
                                        
                                        // Adicionar ao estado local com o ID do Supabase
                                        const novaEscala = {
                                            id: savedSchedule.id,
                                            ...newKidsScheduleData
                                        };
                                        const novasEscalas = [...escalasKids, novaEscala];
                                        setEscalasKids(novasEscalas);
                                        localStorage.setItem('escalasKids', JSON.stringify(novasEscalas));
                                        
                                        // Atualizar kidsSchedules imediatamente
                                        setKidsSchedules(prev => [...prev, savedSchedule]);
                                        
                                        setShowKidsScheduleModal(false);
                                        setNewKidsScheduleData({
                                            turmas: [],
                                            data: format(new Date(), 'yyyy-MM-dd'),
                                            horario: '09:00',
                                            professoresSelecionados: []
                                        });
                                    } catch (error) {
                                        console.error('Erro ao criar escala:', error);
                                        alert('Erro ao criar escala: ' + error.message);
                                    }
                                }}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Selecione as Turmas
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Pequenos', 'Grandes'].map((turma) => {
                                                    const isSelected = newKidsScheduleData.turmas.includes(turma);
                                                    return (
                                                        <div 
                                                            key={turma}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setNewKidsScheduleData({
                                                                        ...newKidsScheduleData,
                                                                        turmas: newKidsScheduleData.turmas.filter(t => t !== turma)
                                                                    });
                                                                } else {
                                                                    setNewKidsScheduleData({
                                                                        ...newKidsScheduleData,
                                                                        turmas: [...newKidsScheduleData.turmas, turma]
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
                                                    value={newKidsScheduleData.data}
                                                    onChange={(e) => setNewKidsScheduleData({ ...newKidsScheduleData, data: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Horário
                                                </label>
                                                <input
                                                    type="time"
                                                    value={newKidsScheduleData.horario}
                                                    onChange={(e) => setNewKidsScheduleData({ ...newKidsScheduleData, horario: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                                Selecione os Professores ({newKidsScheduleData.professoresSelecionados.length} selecionados)
                                            </h3>
                                            
                                            {!kidsMembers?.professores || kidsMembers.professores.length === 0 ? (
                                                <div className="text-center py-8 bg-gray-50 dark:bg-black rounded-lg">
                                                    <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                    <p className="text-gray-500 dark:text-gray-400">Nenhum professor cadastrado.</p>
                                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                        Cadastre membros com função "Professor Kids" ou "Líder Kids"
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {kidsMembers.professores.map((professor) => {
                                                        const isSelected = newKidsScheduleData.professoresSelecionados.includes(professor.id);
                                                        const age = professor.idade || (professor.nascimento ? calculateAge(professor.nascimento) : null);
                                                        
                                                        return (
                                                            <div 
                                                                key={professor.id}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setNewKidsScheduleData({
                                                                            ...newKidsScheduleData,
                                                                            professoresSelecionados: newKidsScheduleData.professoresSelecionados.filter(id => id !== professor.id)
                                                                        });
                                                                    } else {
                                                                        setNewKidsScheduleData({
                                                                            ...newKidsScheduleData,
                                                                            professoresSelecionados: [...newKidsScheduleData.professoresSelecionados, professor.id]
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
                                                setShowKidsScheduleModal(false);
                                                setNewKidsScheduleData({
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
                                            disabled={newKidsScheduleData.professoresSelecionados.length === 0}
                                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Criar Escala ({newKidsScheduleData.professoresSelecionados.length} {newKidsScheduleData.professoresSelecionados.length === 1 ? 'professor' : 'professores'})
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes do Evento */}
                {showEventDetailsModal && renderEventDetails()}

                {/* Modal de Inscrever Familiar */}
                <Modal
                    isOpen={showRegisterOtherModal}
                    onClose={() => {
                        setShowRegisterOtherModal(false);
                        setRegisterOtherSearch('');
                        setRegisterOtherResults([]);
                    }}
                    title="Inscrever Familiar"
                    maxWidth="max-w-md"
                >

                                {(!myFamily || !myFamily.membros || myFamily.membros.length <= 1) ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        Você não possui outros membros cadastrados na sua família.
                                    </p>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                value={registerOtherSearch}
                                                onChange={(e) => handleRegisterOtherSearch(e.target.value)}
                                                placeholder="Buscar familiar por nome..."
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="max-h-96 overflow-y-auto space-y-2">
                                            {registerOtherResults.length === 0 && registerOtherSearch.length >= 2 && (
                                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                                    Nenhum familiar encontrado
                                                </p>
                                            )}
                                            {registerOtherResults.map((member) => (
                                                <div
                                                    key={member.id}
                                                    onClick={() => handleRegisterOther(member)}
                                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                                                >
                                                    <p className="font-medium text-gray-900 dark:text-white">{member.nome}</p>
                                                    {member.email && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                </Modal>

                {/* Modal de Detalhes da Escala */}
                {showScheduleModal && selectedSchedule && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-black rounded-2xl max-w-lg w-full shadow-2xl">
                            <div className="p-6">
                                {/* Cabeçalho */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-full ${
                                            selectedSchedule.categoria === 'culto' 
                                                ? 'bg-purple-100 dark:bg-purple-900/30' 
                                                : 'bg-orange-100 dark:bg-orange-900/30'
                                        }`}>
                                            <Heart className={`w-6 h-6 ${
                                                selectedSchedule.categoria === 'culto'
                                                    ? 'text-purple-600 dark:text-purple-400'
                                                    : 'text-orange-600 dark:text-orange-400'
                                            }`} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Detalhes da Escala
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {selectedSchedule.categoria 
                                                    ? selectedSchedule.categoria.charAt(0).toUpperCase() + selectedSchedule.categoria.slice(1)
                                                    : 'Escala de Diaconia'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowScheduleModal(false);
                                            setSelectedSchedule(null);
                                            setScheduleMembers([]);
                                        }}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>

                                {/* Conteúdo */}
                                <div className="space-y-4">
                                    {/* Data e Horário */}
                                    <div className="bg-gray-50 dark:bg-black/50 rounded-xl p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium capitalize">
                                                    {format(parseISO(selectedSchedule.data), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                </span>
                                            </div>
                                            {selectedSchedule.horario && (
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{selectedSchedule.horario}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descrição */}
                                    {selectedSchedule.descricao && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Descrição
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-black/50 rounded-lg p-3">
                                                {selectedSchedule.descricao}
                                            </p>
                                        </div>
                                    )}

                                    {/* Local */}
                                    {selectedSchedule.local && (
                                    <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Local
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-black/50 rounded-lg p-3">
                                    <MapPin className="w-4 h-4" />
                                    <span>{selectedSchedule.local}</span>
                                    </div>
                                    </div>
                                    )}

                                    {/* Músicas */}
                                    {selectedSchedule.musicas && selectedSchedule.musicas.length > 0 && (
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Músicas ({selectedSchedule.musicas.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedSchedule.musicas.map((musica, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-black rounded-lg">
                                                        <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                            <Music className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {musica}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Músicos Escalados (para louvor) ou Membros Escalados (para diaconia) */}
                                    <div>
                                        {selectedSchedule.musicos && selectedSchedule.musicos.length > 0 ? (
                                            <>
                                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                    <Music className="w-4 h-4" />
                                                    Músicos Escalados ({selectedSchedule.musicos.length})
                                                </h3>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {selectedSchedule.musicos.map((musico, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center justify-between gap-3 p-3 rounded-lg ${
                                                                musico.id === currentMember?.id
                                                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700'
                                                                    : 'bg-gray-50 dark:bg-black/50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                                    musico.id === currentMember?.id
                                                                        ? 'bg-purple-600'
                                                                        : 'bg-gray-500'
                                                                }`}>
                                                                    {musico.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {musico.nome}
                                                                        {musico.id === currentMember?.id && (
                                                                            <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 font-bold">
                                                                                (Você)
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    {musico.telefone && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {musico.telefone}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                                                                {musico.instrumento}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    Membros Escalados ({(selectedSchedule.membros_ids || []).length})
                                                </h3>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {(selectedSchedule.membros_ids || []).length === 0 ? (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                                            Nenhum membro escalado
                                                        </p>
                                                    ) : scheduleMembers.length === 0 ? (
                                                        <div className="flex justify-center items-center py-8">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                                        </div>
                                                    ) : (
                                                        scheduleMembers.map((member, index) => (
                                                            <div
                                                                key={index}
                                                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                                                    member.id === currentMember?.id
                                                                        ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700'
                                                                        : 'bg-gray-50 dark:bg-black/50'
                                                                }`}
                                                            >
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                                    member.id === currentMember?.id
                                                                        ? 'bg-purple-600'
                                                                        : 'bg-gray-500'
                                                                }`}>
                                                                    {member.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {member.nome}
                                                                        {member.id === currentMember?.id && (
                                                                            <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 font-bold">
                                                                                (Você)
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    {member.telefone && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {member.telefone}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Observações */}
                                    {selectedSchedule.observacoes && (
                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Observações
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border-l-4 border-amber-400">
                                                💡 {selectedSchedule.observacoes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Rodapé */}
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {selectedSchedule.musicos ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setScheduleToEdit(selectedSchedule);
                                                    const instrumentos = {};
                                                    if (selectedSchedule.musicos) {
                                                        selectedSchedule.musicos.forEach(musico => {
                                                            instrumentos[musico.instrumento] = musico.id;
                                                        });
                                                    }
                                                    setNewScheduleData({
                                                        data: selectedSchedule.data,
                                                        horario: selectedSchedule.horario || '19:00',
                                                        categoria: selectedSchedule.tipo || selectedSchedule.categoria || 'culto',
                                                        descricao: selectedSchedule.descricao || '',
                                                        local: selectedSchedule.local || '',
                                                        observacoes: selectedSchedule.observacoes || '',
                                                        membros_ids: selectedSchedule.membros_ids || [],
                                                        musicas: selectedSchedule.musicas || [],
                                                        instrumentos: instrumentos,
                                                        newMusicaTemp: ''
                                                    });
                                                    setShowScheduleModal(false);
                                                    setShowEditScheduleModal(true);
                                                }}
                                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Editar Escala
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowScheduleModal(false);
                                                    setSelectedSchedule(null);
                                                    setScheduleMembers([]);
                                                }}
                                                className="px-6 py-2.5 bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                                            >
                                                Fechar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setShowScheduleModal(false);
                                                setSelectedSchedule(null);
                                                setScheduleMembers([]);
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                                        >
                                            Fechar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Lista de Músicas */}
                {showMusicListModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Music className="w-6 h-6 text-green-500" />
                                    Músicas Cadastradas ({playlistMusicas.length})
                                </h3>
                                <button
                                    onClick={() => setShowMusicListModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {playlistMusicas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Music className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">Nenhuma música cadastrada ainda</p>
                                    </div>
                                ) : (
                                    playlistMusicas.map((musica, index) => (
                                        <div 
                                            key={musica.id} 
                                            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                                            #{index + 1}
                                                        </span>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">
                                                            {musica.titulo}
                                                        </h4>
                                                    </div>
                                                    {musica.artista && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                            {musica.artista}
                                                        </p>
                                                    )}
                                                    {musica.duracao && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Duração: {musica.duracao}
                                                        </p>
                                                    )}
                                                </div>
                                                {musica.link && (
                                                    <button
                                                        onClick={() => {
                                                            let link = musica.link;
                                                            if (link.includes('youtu.be/')) {
                                                                const videoId = link.split('youtu.be/')[1].split('?')[0];
                                                                link = `https://www.youtube.com/watch?v=${videoId}`;
                                                            }
                                                            window.open(link, '_blank', 'noopener,noreferrer');
                                                        }}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                                                    >
                                                        <Music className="w-4 h-4" />
                                                        Ouvir
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowMusicListModal(false)}
                                    className="w-full px-4 py-2 bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Músicos Ativos */}
                {showMusiciansModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Music className="w-6 h-6 text-purple-500" />
                                    Músicos Ativos
                                </h3>
                                <button
                                    onClick={() => setShowMusiciansModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                {louvorMembers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">Nenhum músico cadastrado ainda</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            Total de {louvorMembers.length} {louvorMembers.length === 1 ? 'músico' : 'músicos'} na equipe
                                        </p>
                                        {louvorMembers.map((member) => {
                                            // Contar quantas escalas esse membro tem
                                            const escalasCount = louvorSchedules.filter(escala => 
                                                escala.membros_ids?.includes(member.id)
                                            ).length;
                                            
                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                                                >
                                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {member.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 dark:text-white">
                                                            {member.nome}
                                                            {member.id === localMember?.id && (
                                                                <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                                                                    Você
                                                                </span>
                                                            )}
                                                        </p>
                                                        {member.telefone && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {member.telefone}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            {member.funcoes?.join(', ') || 'Louvor'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            {escalasCount} {escalasCount === 1 ? 'escala' : 'escalas'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowMusiciansModal(false)}
                                    className="w-full px-4 py-2 bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Criar Escala de Louvor */}
                {showCreateScheduleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nova Escala de Louvor</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateSchedule();
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Evento
                                    </label>
                                    <select
                                        value={newScheduleData.categoria}
                                        onChange={(e) => setNewScheduleData({ ...newScheduleData, categoria: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                        required
                                    >
                                        <option value="culto">Culto</option>
                                        <option value="ensaio">Ensaio</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {newScheduleData.categoria === 'culto' ? 'Data do Culto' : 'Data do Ensaio'}
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={newScheduleData.data}
                                            onChange={(e) => setNewScheduleData({ ...newScheduleData, data: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {newScheduleData.categoria === 'culto' ? 'Horário do Culto' : 'Horário do Ensaio'}
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={newScheduleData.horario}
                                            onChange={(e) => setNewScheduleData({ ...newScheduleData, horario: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Músicas */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                        Músicas ({(newScheduleData.musicas || []).length}/5)
                                    </h3>
                                    
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newScheduleData.newMusicaTemp || ''}
                                            onChange={(e) => setNewScheduleData({ ...newScheduleData, newMusicaTemp: e.target.value })}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const musicas = newScheduleData.musicas || [];
                                                    if (newScheduleData.newMusicaTemp?.trim() && musicas.length < 5) {
                                                        setNewScheduleData({
                                                            ...newScheduleData,
                                                            musicas: [...musicas, newScheduleData.newMusicaTemp.trim()],
                                                            newMusicaTemp: ''
                                                        });
                                                    }
                                                }
                                            }}
                                            placeholder="Nome da música..."
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-black dark:text-white placeholder-gray-400"
                                            disabled={(newScheduleData.musicas || []).length >= 5}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const musicas = newScheduleData.musicas || [];
                                                if (newScheduleData.newMusicaTemp?.trim() && musicas.length < 5) {
                                                    setNewScheduleData({
                                                        ...newScheduleData,
                                                        musicas: [...musicas, newScheduleData.newMusicaTemp.trim()],
                                                        newMusicaTemp: ''
                                                    });
                                                }
                                            }}
                                            disabled={!newScheduleData.newMusicaTemp?.trim() || (newScheduleData.musicas || []).length >= 5}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {(newScheduleData.musicas || []).length > 0 && (
                                        <div className="space-y-2">
                                            {newScheduleData.musicas.map((musica, idx) => (
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
                                                            setNewScheduleData({
                                                                ...newScheduleData,
                                                                musicas: newScheduleData.musicas.filter((_, i) => i !== idx)
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

                                {/* Instrumentos */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                        Instrumentos ({Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length} escalados)
                                    </h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {['Voz 1', 'Voz 2', 'Voz 3', 'Teclado 1', 'Teclado 2', 'Guitarra', 'Contrabaixo', 'Violão', 'Bateria'].map((instrumento) => {
                                            const instrumentos = newScheduleData.instrumentos || {};
                                            const musicoId = instrumentos[instrumento];
                                            const musico = musicoId ? louvorMembers.find(m => m.id === musicoId) : null;
                                            
                                            return (
                                                <div key={instrumento} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Music className="w-5 h-5 text-purple-600" />
                                                            <span className="font-medium text-gray-900 dark:text-white">{instrumento}</span>
                                                        </div>
                                                        {musico && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newInstrumentos = { ...instrumentos };
                                                                    delete newInstrumentos[instrumento];
                                                                    setNewScheduleData({ ...newScheduleData, instrumentos: newInstrumentos });
                                                                }}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <select
                                                        value={musicoId || ''}
                                                        onChange={(e) => {
                                                            const selectedId = e.target.value;
                                                            if (selectedId) {
                                                                setNewScheduleData({
                                                                    ...newScheduleData,
                                                                    instrumentos: {
                                                                        ...instrumentos,
                                                                        [instrumento]: parseInt(selectedId)
                                                                    }
                                                                });
                                                            } else {
                                                                const newInstrumentos = { ...instrumentos };
                                                                delete newInstrumentos[instrumento];
                                                                setNewScheduleData({ ...newScheduleData, instrumentos: newInstrumentos });
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                    >
                                                        <option value="">Selecione um músico</option>
                                                        {louvorMembers.map(member => (
                                                            <option key={member.id} value={member.id}>
                                                                {member.nome}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateScheduleModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length === 0}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Criar Escala ({Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length} {Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length === 1 ? 'músico' : 'músicos'})
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Editar Escala de Louvor */}
                {showEditScheduleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Editar Escala de Louvor</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateSchedule();
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Evento
                                    </label>
                                    <select
                                        value={newScheduleData.categoria}
                                        onChange={(e) => setNewScheduleData({ ...newScheduleData, categoria: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                        required
                                    >
                                        <option value="culto">Culto</option>
                                        <option value="ensaio">Ensaio</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {newScheduleData.categoria === 'culto' ? 'Data do Culto' : 'Data do Ensaio'}
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={newScheduleData.data}
                                            onChange={(e) => setNewScheduleData({ ...newScheduleData, data: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {newScheduleData.categoria === 'culto' ? 'Horário do Culto' : 'Horário do Ensaio'}
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={newScheduleData.horario}
                                            onChange={(e) => setNewScheduleData({ ...newScheduleData, horario: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Músicas */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                        Músicas ({(newScheduleData.musicas || []).length}/5)
                                    </h3>
                                    
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newScheduleData.newMusicaTemp || ''}
                                            onChange={(e) => setNewScheduleData({ ...newScheduleData, newMusicaTemp: e.target.value })}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const musicas = newScheduleData.musicas || [];
                                                    if (newScheduleData.newMusicaTemp?.trim() && musicas.length < 5) {
                                                        setNewScheduleData({
                                                            ...newScheduleData,
                                                            musicas: [...musicas, newScheduleData.newMusicaTemp.trim()],
                                                            newMusicaTemp: ''
                                                        });
                                                    }
                                                }
                                            }}
                                            placeholder="Nome da música..."
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-black dark:text-white placeholder-gray-400"
                                            disabled={(newScheduleData.musicas || []).length >= 5}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const musicas = newScheduleData.musicas || [];
                                                if (newScheduleData.newMusicaTemp?.trim() && musicas.length < 5) {
                                                    setNewScheduleData({
                                                        ...newScheduleData,
                                                        musicas: [...musicas, newScheduleData.newMusicaTemp.trim()],
                                                        newMusicaTemp: ''
                                                    });
                                                }
                                            }}
                                            disabled={!newScheduleData.newMusicaTemp?.trim() || (newScheduleData.musicas || []).length >= 5}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {(newScheduleData.musicas || []).length > 0 && (
                                        <div className="space-y-2">
                                            {newScheduleData.musicas.map((musica, idx) => (
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
                                                            setNewScheduleData({
                                                                ...newScheduleData,
                                                                musicas: newScheduleData.musicas.filter((_, i) => i !== idx)
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

                                {/* Instrumentos */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                        Instrumentos ({Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length} escalados)
                                    </h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {['Voz 1', 'Voz 2', 'Voz 3', 'Teclado 1', 'Teclado 2', 'Guitarra', 'Contrabaixo', 'Violão', 'Bateria'].map((instrumento) => {
                                            const instrumentos = newScheduleData.instrumentos || {};
                                            const musicoId = instrumentos[instrumento];
                                            const musico = musicoId ? louvorMembers.find(m => m.id === musicoId) : null;
                                            
                                            return (
                                                <div key={instrumento} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Music className="w-5 h-5 text-purple-600" />
                                                            <span className="font-medium text-gray-900 dark:text-white">{instrumento}</span>
                                                        </div>
                                                        {musico && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newInstrumentos = { ...instrumentos };
                                                                    delete newInstrumentos[instrumento];
                                                                    setNewScheduleData({ ...newScheduleData, instrumentos: newInstrumentos });
                                                                }}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <select
                                                        value={musicoId || ''}
                                                        onChange={(e) => {
                                                            const selectedId = e.target.value;
                                                            if (selectedId) {
                                                                setNewScheduleData({
                                                                    ...newScheduleData,
                                                                    instrumentos: {
                                                                        ...instrumentos,
                                                                        [instrumento]: parseInt(selectedId)
                                                                    }
                                                                });
                                                            } else {
                                                                const newInstrumentos = { ...instrumentos };
                                                                delete newInstrumentos[instrumento];
                                                                setNewScheduleData({ ...newScheduleData, instrumentos: newInstrumentos });
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                    >
                                                        <option value="">Selecione um músico</option>
                                                        {louvorMembers.map(member => (
                                                            <option key={member.id} value={member.id}>
                                                                {member.nome}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Deseja realmente excluir esta escala?')) {
                                                handleDeleteSchedule(scheduleToEdit?.id);
                                                setShowEditScheduleModal(false);
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </button>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditScheduleModal(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length === 0}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Salvar Alterações ({Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length} {Object.values(newScheduleData.instrumentos || {}).filter(Boolean).length === 1 ? 'músico' : 'músicos'})
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de adicionar música */}
                {showMusicModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full">
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
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
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Adicionar Música
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Oficina */}
                {showOficinaModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                        <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                {selectedOficina ? 'Editar Oficina' : 'Nova Oficina'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome da Oficina *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={oficinaFormData.nome}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: Louvor e Adoração"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={oficinaFormData.descricao}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, descricao: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        placeholder="Descrição da oficina"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Data *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={oficinaFormData.data}
                                            onChange={(e) => setOficinaFormData({ ...oficinaFormData, data: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Horário *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={oficinaFormData.horario}
                                            onChange={(e) => setOficinaFormData({ ...oficinaFormData, horario: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Local
                                    </label>
                                    <input
                                        type="text"
                                        value={oficinaFormData.local}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, local: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: Sala 2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Número de Vagas *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={oficinaFormData.vagas}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, vagas: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        Quem pode se inscrever?
                                    </label>
                                    <div className="space-y-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                            oficinaFormData.quem_pode_se_inscrever.includes('todos')
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-sm'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
                                        }`}>
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={oficinaFormData.quem_pode_se_inscrever.includes('todos')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setOficinaFormData({ ...oficinaFormData, quem_pode_se_inscrever: ['todos'] });
                                                        } else {
                                                            setOficinaFormData({ ...oficinaFormData, quem_pode_se_inscrever: [] });
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-indigo-600 bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-500 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </div>
                                            <span className={`ml-3 text-sm font-semibold ${
                                                oficinaFormData.quem_pode_se_inscrever.includes('todos')
                                                    ? 'text-indigo-700 dark:text-indigo-300'
                                                    : 'text-gray-900 dark:text-white'
                                            }`}>Todos os Membros</span>
                                        </label>
                                        {[
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
                                            'professor kids'
                                        ].map((funcao) => {
                                            const isSelected = oficinaFormData.quem_pode_se_inscrever.includes(funcao);
                                            const isTodosSelected = oficinaFormData.quem_pode_se_inscrever.includes('todos');
                                            
                                            return (
                                                <label key={funcao} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                    isTodosSelected
                                                        ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-sm'
                                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
                                                }`}>
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const current = oficinaFormData.quem_pode_se_inscrever.filter(r => r !== 'todos');
                                                                if (e.target.checked) {
                                                                    setOficinaFormData({ ...oficinaFormData, quem_pode_se_inscrever: [...current, funcao] });
                                                                } else {
                                                                    setOficinaFormData({ ...oficinaFormData, quem_pode_se_inscrever: current.filter(r => r !== funcao) });
                                                                }
                                                            }}
                                                            disabled={isTodosSelected}
                                                            className="w-5 h-5 text-indigo-600 bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-500 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        />
                                                    </div>
                                                    <span className={`ml-3 text-sm ${
                                                        isTodosSelected
                                                            ? 'text-gray-400 dark:text-gray-500'
                                                            : isSelected
                                                                ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                                                                : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {funcao.charAt(0).toUpperCase() + funcao.slice(1)}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOficinaModal(false);
                                            setSelectedOficina(null);
                                            setOficinaFormData({
                                                nome: '',
                                                descricao: '',
                                                data: format(new Date(), 'yyyy-MM-dd'),
                                                horario: '19:00',
                                                local: '',
                                                vagas: 12,
                                                inscritos: 0,
                                                quem_pode_se_inscrever: ['todos']
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 dark:bg-black text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-9000"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveOficina}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        {selectedOficina ? 'Atualizar' : 'Criar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes da Oficina (para membros não-líderes) */}
                {showOficinaDetailsModal && oficinaDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {oficinaDetails.nome}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowOficinaDetailsModal(false);
                                            setOficinaDetails(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {oficinaDetails.descricao && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</h3>
                                            <p className="text-gray-900 dark:text-white">{oficinaDetails.descricao}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data e Horário</h3>
                                            <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {oficinaDetails.data && format(parseISO(oficinaDetails.data.split('T')[0]), "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                            <p className="text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                                                <Clock className="w-4 h-4" />
                                                {oficinaDetails.data && oficinaDetails.data.includes('T') ? oficinaDetails.data.split('T')[1].substring(0, 5) : '19:00'}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vagas</h3>
                                            <p className={`flex items-center gap-2 font-semibold ${
                                                oficinaParticipants.length >= oficinaDetails.vagas 
                                                    ? 'text-red-600 dark:text-red-400' 
                                                    : 'text-gray-900 dark:text-white'
                                            }`}>
                                                <Users className="w-4 h-4" />
                                                {oficinaParticipants.length}/{oficinaDetails.vagas || 12}
                                                {oficinaParticipants.length >= oficinaDetails.vagas && (
                                                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                                                        Esgotado
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {oficinaDetails.local && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local</h3>
                                            <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {oficinaDetails.local}
                                            </p>
                                        </div>
                                    )}

                                    {/* Lista de Inscritos */}
                                    {oficinaParticipants.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Inscritos ({oficinaParticipants.length})
                                            </h3>
                                            <div className="max-h-40 overflow-y-auto space-y-2">
                                                {oficinaParticipants.map((participant) => (
                                                    <div
                                                        key={participant.id}
                                                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-black rounded-lg"
                                                    >
                                                        <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                            {participant.member?.nome || 'Nome não disponível'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowOficinaDetailsModal(false);
                                                    setOficinaDetails(null);
                                                }}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                Fechar
                                            </button>
                                            {isLiderJovens && (
                                                <button
                                                    onClick={() => {
                                                        setOficinaFormData({
                                                            nome: oficinaDetails.nome,
                                                            descricao: oficinaDetails.descricao,
                                                            data: oficinaDetails.data?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
                                                            horario: oficinaDetails.data?.split('T')[1]?.substring(0, 5) || '19:00',
                                                            local: oficinaDetails.local,
                                                            vagas: oficinaDetails.vagas || 12,
                                                            permissaoInscricao: oficinaDetails.permissaoInscricao || ['todos']
                                                        });
                                                        setShowOficinaDetailsModal(false);
                                                        setShowEditOficinaModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleOficinaRegistration}
                                            disabled={(oficinaParticipants.length >= oficinaDetails.vagas) && !isOficinaRegistered}
                                            className={`px-4 py-2 rounded-lg text-white ${
                                                isOficinaRegistered
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : (oficinaParticipants.length >= oficinaDetails.vagas)
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                            }`}
                                        >
                                            {isOficinaRegistered 
                                                ? 'Cancelar Inscrição' 
                                                : (oficinaParticipants.length >= oficinaDetails.vagas)
                                                    ? 'Vagas Esgotadas'
                                                    : 'Inscrever-se'
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Editar Oficina */}
                {showEditOficinaModal && oficinaDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4">
                        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Editar Oficina
                                </h3>
                                <button
                                    onClick={() => setShowEditOficinaModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const workshopData = {
                                        nome: oficinaFormData.nome,
                                        descricao: oficinaFormData.descricao,
                                        data: `${oficinaFormData.data}T${oficinaFormData.horario}`,
                                        local: oficinaFormData.local,
                                        vagas: parseInt(oficinaFormData.vagas),
                                        permissao_inscricao: oficinaFormData.permissaoInscricao
                                    };

                                    await updateWorkshop(oficinaDetails.id, workshopData);
                                    alert('Oficina atualizada com sucesso!');
                                    setShowEditOficinaModal(false);
                                    
                                    // Recarregar lista de oficinas
                                    const updatedWorkshops = await getWorkshops();
                                    setOficinas(updatedWorkshops || []);
                                } catch (error) {
                                    console.error('Erro ao atualizar oficina:', error);
                                    alert('Erro ao atualizar oficina. Tente novamente.');
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Nome da Oficina *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={oficinaFormData.nome}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, nome: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={oficinaFormData.descricao}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, descricao: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Data *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={oficinaFormData.data}
                                            onChange={(e) => setOficinaFormData({ ...oficinaFormData, data: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Horário *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={oficinaFormData.horario}
                                            onChange={(e) => setOficinaFormData({ ...oficinaFormData, horario: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Local
                                    </label>
                                    <input
                                        type="text"
                                        value={oficinaFormData.local}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, local: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Número de Vagas *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={oficinaFormData.vagas}
                                        onChange={(e) => setOficinaFormData({ ...oficinaFormData, vagas: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-black dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditOficinaModal(false)}
                                        className="px-4 py-2 bg-gray-300 dark:bg-black text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-9000"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Criar Escala de Diaconia */}
                {showDiaconiaScheduleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Montar Escala de Diaconia</h2>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await createMinistrySchedule({
                                            data: newDiaconiaScheduleData.data,
                                            horario: newDiaconiaScheduleData.horario,
                                            tipo: newDiaconiaScheduleData.categoria,
                                            observacoes: newDiaconiaScheduleData.observacoes,
                                            ministerio: 'diaconia',
                                            membros_ids: newDiaconiaScheduleData.diaconosSelecionados
                                        });
                                        
                                        // Recarregar escalas
                                        const escalas = await getMinistrySchedules('diaconia');
                                        setDiaconiaSchedules(escalas);
                                        
                                        setShowDiaconiaScheduleModal(false);
                                        setNewDiaconiaScheduleData({
                                            data: format(new Date(), 'yyyy-MM-dd'),
                                            horario: '19:00',
                                            categoria: 'culto',
                                            observacoes: '',
                                            diaconosSelecionados: []
                                        });
                                        alert('Escala criada com sucesso!');
                                    } catch (error) {
                                        console.error('Erro ao criar escala:', error);
                                        alert('Erro ao criar escala. Tente novamente.');
                                    }
                                }}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Categoria
                                            </label>
                                            <select
                                                value={newDiaconiaScheduleData.categoria}
                                                onChange={(e) => setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, categoria: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                required
                                            >
                                                <option value="culto">Culto</option>
                                                <option value="limpeza">Limpeza</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {newDiaconiaScheduleData.categoria === 'culto' ? 'Data do Culto' : 'Data da Limpeza'}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newDiaconiaScheduleData.data}
                                                    onChange={(e) => setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, data: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {newDiaconiaScheduleData.categoria === 'culto' ? 'Horário do Culto' : 'Horário da Limpeza'}
                                                </label>
                                                <input
                                                    type="time"
                                                    value={newDiaconiaScheduleData.horario}
                                                    onChange={(e) => setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, horario: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                                Selecione os Diáconos ({newDiaconiaScheduleData.diaconosSelecionados.length} selecionados)
                                            </h3>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {diaconiaMembers.map((diacono) => {
                                                    const isSelected = newDiaconiaScheduleData.diaconosSelecionados.includes(diacono.id);
                                                    
                                                    return (
                                                        <div 
                                                            key={diacono.id} 
                                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                                                isSelected ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-600'
                                                            }`}
                                                            onClick={() => {
                                                                const newSelecionados = isSelected
                                                                    ? newDiaconiaScheduleData.diaconosSelecionados.filter(id => id !== diacono.id)
                                                                    : [...newDiaconiaScheduleData.diaconosSelecionados, diacono.id];
                                                                setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, diaconosSelecionados: newSelecionados });
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                                                    {diacono.nome?.charAt(0)?.toUpperCase() || 'D'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white uppercase">{diacono.nome}</p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{diacono.telefone || 'Sem telefone'}</p>
                                                                </div>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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
                                                setNewDiaconiaScheduleData({
                                                    data: format(new Date(), 'yyyy-MM-dd'),
                                                    horario: '19:00',
                                                    categoria: 'culto',
                                                    observacoes: '',
                                                    diaconosSelecionados: []
                                                });
                                                setShowDiaconiaScheduleModal(false);
                                            }}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={newDiaconiaScheduleData.diaconosSelecionados.length === 0}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Criar Escala ({newDiaconiaScheduleData.diaconosSelecionados.length} {newDiaconiaScheduleData.diaconosSelecionados.length === 1 ? 'diácono' : 'diáconos'})
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Editar Escala de Diaconia */}
                {showEditDiaconiaScheduleModal && diaconiaScheduleToEdit && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Editar Escala de Diaconia</h2>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await updateMinistrySchedule(diaconiaScheduleToEdit.id, {
                                            data: newDiaconiaScheduleData.data,
                                            horario: newDiaconiaScheduleData.horario,
                                            tipo: newDiaconiaScheduleData.categoria,
                                            observacoes: newDiaconiaScheduleData.observacoes,
                                            ministerio: 'diaconia',
                                            membros_ids: newDiaconiaScheduleData.diaconosSelecionados
                                        });
                                        
                                        // Recarregar escalas
                                        const escalas = await getMinistrySchedules('diaconia');
                                        setDiaconiaSchedules(escalas);
                                        
                                        setShowEditDiaconiaScheduleModal(false);
                                        setDiaconiaScheduleToEdit(null);
                                        alert('Escala atualizada com sucesso!');
                                    } catch (error) {
                                        console.error('Erro ao atualizar escala:', error);
                                        alert('Erro ao atualizar escala. Tente novamente.');
                                    }
                                }}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Categoria
                                            </label>
                                            <select
                                                value={newDiaconiaScheduleData.categoria}
                                                onChange={(e) => setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, categoria: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                required
                                            >
                                                <option value="culto">Culto</option>
                                                <option value="limpeza">Limpeza</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {newDiaconiaScheduleData.categoria === 'culto' ? 'Data do Culto' : 'Data da Limpeza'}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newDiaconiaScheduleData.data}
                                                    onChange={(e) => setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, data: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {newDiaconiaScheduleData.categoria === 'culto' ? 'Horário do Culto' : 'Horário da Limpeza'}
                                                </label>
                                                <input
                                                    type="time"
                                                    value={newDiaconiaScheduleData.horario}
                                                    onChange={(e) => setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, horario: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                                Selecione os Diáconos ({newDiaconiaScheduleData.diaconosSelecionados.length} selecionados)
                                            </h3>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {diaconiaMembers.map((diacono) => {
                                                    const isSelected = newDiaconiaScheduleData.diaconosSelecionados.includes(diacono.id);
                                                    
                                                    return (
                                                        <div 
                                                            key={diacono.id} 
                                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                                                isSelected ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-600'
                                                            }`}
                                                            onClick={() => {
                                                                const newSelecionados = isSelected
                                                                    ? newDiaconiaScheduleData.diaconosSelecionados.filter(id => id !== diacono.id)
                                                                    : [...newDiaconiaScheduleData.diaconosSelecionados, diacono.id];
                                                                setNewDiaconiaScheduleData({ ...newDiaconiaScheduleData, diaconosSelecionados: newSelecionados });
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                                                    {diacono.nome?.charAt(0)?.toUpperCase() || 'D'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white uppercase">{diacono.nome}</p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{diacono.telefone || 'Sem telefone'}</p>
                                                                </div>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (window.confirm('Tem certeza que deseja excluir esta escala?')) {
                                                    try {
                                                        await deleteMinistrySchedule(diaconiaScheduleToEdit.id, 'diaconia');
                                                        const escalas = await getMinistrySchedules('diaconia');
                                                        setDiaconiaSchedules(escalas);
                                                        setShowEditDiaconiaScheduleModal(false);
                                                        setDiaconiaScheduleToEdit(null);
                                                        alert('Escala excluída com sucesso!');
                                                    } catch (error) {
                                                        console.error('Erro ao excluir escala:', error);
                                                        alert('Erro ao excluir escala. Tente novamente.');
                                                    }
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Excluir
                                        </button>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowEditDiaconiaScheduleModal(false);
                                                    setDiaconiaScheduleToEdit(null);
                                                }}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={newDiaconiaScheduleData.diaconosSelecionados.length === 0}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Salvar ({newDiaconiaScheduleData.diaconosSelecionados.length} {newDiaconiaScheduleData.diaconosSelecionados.length === 1 ? 'diácono' : 'diáconos'})
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                        {/* Modal Detalhes da Escala de Professores Kids */}
                            {showDetalhesEscalaProfessoresModal && selectedKidsSchedule && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                            <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-7 h-7 text-pink-600" />
                                            Detalhes da Escala
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowDetalhesEscalaProfessoresModal(false);
                                                setSelectedKidsSchedule(null);
                                            }}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
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
                                                        {format(parseISO(selectedKidsSchedule.data), "dd/MM/yyyy", { locale: ptBR })}
                                                    </h3>
                                                    <p className="text-lg text-gray-600 dark:text-gray-400 capitalize">
                                                        {format(parseISO(selectedKidsSchedule.data), "EEEE", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-pink-600" />
                                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {selectedKidsSchedule.horario}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Turmas */}
                                        {selectedKidsSchedule.descricao?.includes('Turmas:') && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Baby className="w-5 h-5 text-pink-600" />
                                                    Turmas
                                                </h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {selectedKidsSchedule.descricao.replace('Turmas: ', '').split(', ').map((turma, i) => (
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
                                        )}

                                        {/* Professores */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Users className="w-5 h-5 text-pink-600" />
                                                Professores Escalados ({selectedKidsSchedule.membros_ids?.length || 0})
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedKidsSchedule.membros_ids?.map((profId, i) => {
                                                    const prof = kidsMembers.all?.find(m => m.id === profId);
                                                    if (!prof) return null;
                                                    const age = calculateAge(prof.nascimento);
                                                    
                                                    return (
                                                        <div 
                                                            key={i} 
                                                            className="p-4 rounded-lg border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-black"
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
                                                                            prof.funcoes?.includes('lider kids') 
                                                                                ? 'bg-pink-600 text-white' 
                                                                                : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                                        }`}>
                                                                            {prof.funcoes?.includes('lider kids') ? 'Líder' : 'Professor'}
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

                                    <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                                        <button
                                            onClick={() => {
                                                setEditFormDataProfessores({
                                                    turmas: selectedKidsSchedule.descricao?.replace('Turmas: ', '').split(', ') || [],
                                                    data: format(parseISO(selectedKidsSchedule.data), 'yyyy-MM-dd'),
                                                    horario: selectedKidsSchedule.horario,
                                                    professoresSelecionados: selectedKidsSchedule.membros_ids || []
                                                });
                                                setShowEditEscalaProfessoresModal(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                            Editar Escala
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Tem certeza que deseja deletar esta escala?')) {
                                                    try {
                                                        await deleteMinistrySchedule(selectedKidsSchedule.id);
                                                        setKidsSchedules(prev => prev.filter(s => s.id !== selectedKidsSchedule.id));
                                                        setShowDetalhesEscalaProfessoresModal(false);
                                                        setSelectedKidsSchedule(null);
                                                    } catch (error) {
                                                        console.error('Erro ao deletar escala:', error);
                                                        alert('Erro ao deletar escala');
                                                    }
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            Deletar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDetalhesEscalaProfessoresModal(false);
                                                setSelectedKidsSchedule(null);
                                            }}
                                            className="px-6 py-3 bg-gray-300 dark:bg-black text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-9000"
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Editar Escala de Professores */}
                    {showEditEscalaProfessoresModal && selectedKidsSchedule && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Edit2 className="w-7 h-7 text-blue-600" />
                                            Editar Escala
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowEditEscalaProfessoresModal(false);
                                            }}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                                        >
                                            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>

                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (editFormDataProfessores.turmas.length === 0) {
                                            alert('Selecione pelo menos uma turma');
                                            return;
                                        }
                                        if (editFormDataProfessores.professoresSelecionados.length === 0) {
                                            alert('Selecione pelo menos um professor');
                                            return;
                                        }

                                        try {
                                            const updatedScheduleData = {
                                                data: `${editFormDataProfessores.data}T${editFormDataProfessores.horario}:00`,
                                                horario: editFormDataProfessores.horario,
                                                descricao: `Turmas: ${editFormDataProfessores.turmas.join(', ')}`,
                                                membros_ids: editFormDataProfessores.professoresSelecionados
                                            };

                                            await updateMinistrySchedule(selectedKidsSchedule.id, updatedScheduleData);
                                            
                                            const updatedSchedules = await getMinistrySchedules('kids');
                                            setKidsSchedules(updatedSchedules);

                                            setShowEditEscalaProfessoresModal(false);
                                            setShowDetalhesEscalaProfessoresModal(false);
                                            setSelectedKidsSchedule(null);
                                        } catch (error) {
                                            console.error('Erro ao atualizar escala:', error);
                                            alert('Erro ao atualizar escala');
                                        }
                                    }} className="space-y-6">
                                        {/* Turmas */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Turmas *
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Pequenos', 'Grandes'].map(turma => (
                                                    <button
                                                        key={turma}
                                                        type="button"
                                                        onClick={() => {
                                                            setEditFormDataProfessores(prev => ({
                                                                ...prev,
                                                                turmas: prev.turmas.includes(turma)
                                                                    ? prev.turmas.filter(t => t !== turma)
                                                                    : [...prev.turmas, turma]
                                                            }));
                                                        }}
                                                        className={`p-4 rounded-lg border-2 transition-all ${
                                                            editFormDataProfessores.turmas.includes(turma)
                                                                ? turma === 'Pequenos' 
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                    : 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Baby className={`w-5 h-5 ${
                                                                editFormDataProfessores.turmas.includes(turma)
                                                                    ? turma === 'Pequenos' ? 'text-blue-500' : 'text-purple-600'
                                                                    : 'text-gray-400'
                                                            }`} />
                                                            <span className={`font-medium ${
                                                                editFormDataProfessores.turmas.includes(turma)
                                                                    ? turma === 'Pequenos' ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                                {turma}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Data e Horário */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Data *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={editFormDataProfessores.data}
                                                    onChange={(e) => setEditFormDataProfessores(prev => ({ ...prev, data: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Horário *
                                                </label>
                                                <input
                                                    type="time"
                                                    value={editFormDataProfessores.horario}
                                                    onChange={(e) => setEditFormDataProfessores(prev => ({ ...prev, horario: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-black dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Professores */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Professores *
                                            </label>
                                            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                                                {kidsMembers.all?.map(professor => {
                                                    const age = calculateAge(professor.nascimento);
                                                    return (
                                                        <button
                                                            key={professor.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditFormDataProfessores(prev => ({
                                                                    ...prev,
                                                                    professoresSelecionados: prev.professoresSelecionados.includes(professor.id)
                                                                        ? prev.professoresSelecionados.filter(id => id !== professor.id)
                                                                        : [...prev.professoresSelecionados, professor.id]
                                                                }));
                                                            }}
                                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                                                editFormDataProfessores.professoresSelecionados.includes(professor.id)
                                                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                                    editFormDataProfessores.professoresSelecionados.includes(professor.id)
                                                                        ? 'bg-pink-600'
                                                                        : 'bg-gray-400'
                                                                }`}>
                                                                    {getInitials(professor.nome)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`font-medium ${
                                                                            editFormDataProfessores.professoresSelecionados.includes(professor.id)
                                                                                ? 'text-pink-700 dark:text-pink-300'
                                                                                : 'text-gray-700 dark:text-gray-300'
                                                                        }`}>
                                                                            {professor.nome}
                                                                        </span>
                                                                        {professor.funcoes?.includes('lider kids') && (
                                                                            <span className="text-xs px-2 py-0.5 bg-pink-600 text-white rounded-full">
                                                                                Líder
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {age && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{age} anos</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditEscalaProfessoresModal(false)}
                                                className="flex-1 px-6 py-3 bg-gray-300 dark:bg-black text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-9000"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Salvar Alterações
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    export default MemberApp;
