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
  Trash2
} from 'lucide-react';
import { format, isAfter, isBefore, startOfWeek, endOfWeek, addDays, subDays, differenceInYears, startOfMonth, endOfMonth, isSameMonth, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChurchAdminDashboard = ({ members = [], events = [], prayerRequests = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventView, setEventView] = useState('list'); // 'list' ou 'calendar'
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
  const [selectedMember, setSelectedMember] = useState(null);

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
    setShowMemberModal(true);
  };

  const handleAddEvent = (date = null) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleAddPrayer = () => {
    setShowPrayerModal(true);
  };

  const handleCalendarDayClick = (date) => {
    handleAddEvent(date);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditMemberModal(true);
  };

  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setShowDeleteMemberModal(true);
  };

  // Funções/cargos disponíveis
  const availableRoles = [
    'membro',
    'pastor',
    'diácono',
    'líder de louvor',
    'músico',
    'porteiro',
    'tesoureiro',
    'secretário',
    'ancião',
    'obreiro'
  ];

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
    const startDate = startOfWeek(startOfMonth(calendarDate));
    const endDate = endOfWeek(endOfMonth(calendarDate));
    const days = [];
    let current = startDate;
    
    while (current <= endDate) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.data);
      return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'members', label: 'Membros', icon: Users },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'prayers', label: 'Pedidos de Oração', icon: Heart },
    { id: 'birthdays', label: 'Aniversários', icon: Gift },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard Pastoral</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4 w-full sm:w-auto">
          <button 
            onClick={handleAddMember}
            className="flex items-center px-4 py-2 bg-church-purple-600 text-white rounded-lg hover:bg-church-purple-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Membro
          </button>
          <button 
            onClick={handleAddEvent}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Novo Evento
          </button>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total de Membros</p>
              <p className="text-3xl font-bold">{memberStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Eventos Futuros</p>
              <p className="text-3xl font-bold">{futureEvents.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Pedidos Ativos</p>
              <p className="text-3xl font-bold">{prayerStats.active}</p>
            </div>
            <Heart className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Aniversários do Mês</p>
              <p className="text-3xl font-bold">{birthdays.thisMonth.length}</p>
            </div>
            <Gift className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filtros de Estatísticas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Gênero</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de barras agrupadas */}
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribuição por Faixa Etária e Gênero</h3>
        <div className="h-64 sm:h-80">
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Membros</h1>
        <button 
          onClick={handleAddMember}
          className="flex items-center px-4 py-2 bg-church-purple-600 text-white rounded-lg hover:bg-church-purple-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Membro
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Membro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Função</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gênero</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Idade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contato</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMembers.map((member, index) => {
                const age = calculateAge(member.nascimento);
                const initials = getInitials(member.nome);
                const memberId = generateMemberId(member, index);
                
                return (
                  <tr key={memberId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {memberId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-church-purple-500 flex items-center justify-center text-white font-semibold">
                            {initials}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{member.nome}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (member.funcao || 'membro') === 'pastor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' :
                        (member.funcao || 'membro') === 'diácono' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                        (member.funcao || 'membro') === 'líder de louvor' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' :
                        (member.funcao || 'membro') === 'músico' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {(member.funcao || 'membro').charAt(0).toUpperCase() + (member.funcao || 'membro').slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {member.genero || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {age ? `${age} anos` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        {member.email && (
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {member.email}
                          </div>
                        )}
                        {member.telefone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {member.telefone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status || 'ativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Editar membro"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Deletar membro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum membro encontrado com os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const calendarDays = getCalendarDays();
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {format(calendarDate, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setCalendarDate(addDays(calendarDate, -30))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCalendarDate(addDays(calendarDate, 30))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-gray-100 p-2 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
          
          {calendarDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, calendarDate);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleCalendarDayClick(day)}
                className={`calendar-day cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
              >
                <div className="font-medium mb-1">
                  {format(day, 'd')}
                </div>
                {dayEvents.map((event, index) => (
                  <div key={index} className="calendar-event" title={event.nome}>
                    {event.nome}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Eventos</h1>
        <div className="flex space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setEventView('list')}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                eventView === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4 mr-1" />
              Lista
            </button>
            <button
              onClick={() => setEventView('calendar')}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                eventView === 'calendar' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4 mr-1" />
              Calendário
            </button>
          </div>
          <button 
            onClick={handleAddEvent}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Novo Evento
          </button>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="1">1º Semestre (Jan-Jun)</option>
              <option value="2">2º Semestre (Jul-Dez)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Total de Eventos</label>
            <div className="text-2xl font-bold text-church-purple-600">{filteredEvents.length}</div>
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Aniversários</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Pedidos de Oração</h1>
        <button 
          onClick={handleAddPrayer}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </button>
      </div>

      {/* Estatísticas dos pedidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pedidos Ativos */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
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
              <span className={`text-sm ${!darkMode ? 'text-church-purple-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Claro
              </span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-church-purple-500 focus:ring-offset-2 ${
                  darkMode ? 'bg-church-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${darkMode ? 'text-church-purple-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Escuro
              </span>
            </div>
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
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-church-purple-500 focus:ring-offset-2"
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
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-church-purple-500 focus:ring-offset-2"
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar - Mobile optimizado */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'
      } md:relative fixed inset-y-0 left-0 z-50`}>
        <div className={`p-4 ${!sidebarOpen ? 'hidden md:block' : ''}`}>
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-xl font-bold text-church-purple-700 dark:text-church-purple-400">Igreja Admin</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <nav className={`mt-8 ${!sidebarOpen ? 'hidden md:block' : ''}`}>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  // Fecha sidebar no mobile ao clicar
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Overlay para mobile quando sidebar está aberta */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Botão flutuante de menu (mobile) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-50 md:hidden bg-church-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-church-purple-700 active:scale-95 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'members' && renderMembers()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'prayers' && renderPrayerRequests()}
          {activeTab === 'birthdays' && renderBirthdays()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Modais */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Membro</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Funcionalidade em desenvolvimento...</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowMemberModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Evento</h3>
            {selectedDate && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Data selecionada: {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 mb-4">Funcionalidade em desenvolvimento...</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedDate(null);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Pedido de Oração</h3>
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

      {/* Modal de edição de membro */}
      {showEditMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editar Membro</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Editando: <strong>{selectedMember.nome}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400">Funcionalidade em desenvolvimento...</p>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                onClick={() => {
                  setShowEditMemberModal(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowEditMemberModal(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de deleção */}
      {showDeleteMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
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
                onClick={() => {
                  // Aqui implementaria a lógica de deleção
                  console.log('Deletando membro:', selectedMember.nome);
                  setShowDeleteMemberModal(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChurchAdminDashboard;
