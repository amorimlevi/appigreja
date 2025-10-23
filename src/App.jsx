import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ChurchAdminDashboard from './components/ChurchAdminDashboard'
import Login from './components/Login'
import MemberApp from './components/MemberApp'
import MemberLogin from './components/MemberLogin'
import MemberSignup from './components/MemberSignup'
import { useSupabaseData } from './hooks/useSupabaseData'
import { 
    createMember, 
    updateMember, 
    deleteMember, 
    createEvent, 
    updateEvent,
    deleteEvent,
    createEventFood,
    deleteEventFood,
    getEventFoods,
    createFamily,
    updateFamily,
    createAviso,
    loginMember
} from './lib/supabaseService'
import { notifyNewEvent } from './services/sendPushNotification'

console.log('App.jsx carregado!')

// Dados de exemplo para demonstração
const sampleMembers = [
  {
    id: 'MBR0001',
    nome: 'Pastor Marcos Silva',
    email: 'pastor.marcos@email.com',
    telefone: '(11) 98765-1111',
    nascimento: '1975-05-12',
    genero: 'masculino',
    funcao: 'pastor',
    status: 'ativo',
    observacoes: 'Pastor titular da igreja'
  },
  {
    id: 'MBR0002',
    nome: 'Ana Paula Costa',
    email: 'ana.costa@email.com',
    telefone: '(11) 98765-2222',
    nascimento: '1988-08-20',
    genero: 'feminino',
    funcao: 'lider da diaconia',
    status: 'ativo',
    observacoes: 'Líder do ministério de assistência social'
  },
  {
    id: 'MBR0003',
    nome: 'Rafael Oliveira',
    email: 'rafael.oliveira@email.com',
    telefone: '(11) 98765-3333',
    nascimento: '1992-03-15',
    genero: 'masculino',
    funcao: 'líder de louvor',
    status: 'ativo',
    observacoes: 'Coordenador do ministério de louvor'
  },
  {
    id: 'MBR0004',
    nome: 'Juliana Santos',
    email: 'juliana.santos@email.com',
    telefone: '(11) 98765-4444',
    nascimento: '1990-11-08',
    genero: 'feminino',
    funcao: 'lider kids',
    status: 'ativo',
    observacoes: 'Líder do ministério infantil'
  },
  {
    id: 'MBR0005',
    nome: 'Bruno Carvalho',
    email: 'bruno.carvalho@email.com',
    telefone: '(11) 98765-5555',
    nascimento: '1995-02-28',
    genero: 'masculino',
    funcao: 'lider jovens',
    status: 'ativo',
    observacoes: 'Líder do ministério de jovens'
  },
  {
    id: 'MBR0006',
    nome: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    telefone: '(11) 98765-6666',
    nascimento: '1985-07-14',
    genero: 'feminino',
    funcao: 'professor kids',
    status: 'ativo',
    observacoes: 'Professora da turma dos pequenos'
  },
  {
    id: 'MBR0007',
    nome: 'Diego Ferreira',
    email: 'diego.ferreira@email.com',
    telefone: '(11) 98765-7777',
    nascimento: '1993-09-22',
    genero: 'masculino',
    funcao: 'professor kids',
    status: 'ativo',
    observacoes: 'Professor da turma dos grandes'
  },
  {
    id: 'MBR0008',
    nome: 'Eduardo Alves',
    email: 'eduardo.alves@email.com',
    telefone: '(11) 98765-8888',
    nascimento: '1987-12-05',
    genero: 'masculino',
    funcao: 'ministro',
    status: 'ativo',
    observacoes: 'Ministro de evangelismo'
  },
  {
    id: 'MBR0009',
    nome: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    telefone: '(11) 98765-9999',
    nascimento: '1991-06-18',
    genero: 'feminino',
    funcao: 'louvor',
    status: 'ativo',
    observacoes: 'Vocalista do grupo de louvor'
  },
  {
    id: 'MBR0010',
    nome: 'Gabriel Souza',
    email: 'gabriel.souza@email.com',
    telefone: '(11) 98765-0000',
    nascimento: '1989-04-30',
    genero: 'masculino',
    funcao: 'louvor',
    status: 'ativo',
    observacoes: 'Guitarrista do grupo de louvor'
  },
  {
    id: 'MBR0011',
    nome: 'Helena Rocha',
    email: 'helena.rocha@email.com',
    telefone: '(11) 98765-1122',
    nascimento: '1994-10-11',
    genero: 'feminino',
    funcao: 'diaconia',
    status: 'ativo',
    observacoes: 'Membro do ministério de assistência'
  },
  {
    id: 'MBR0012',
    nome: 'Igor Santos',
    email: 'igor.santos@email.com',
    telefone: '(11) 98765-2233',
    nascimento: '1986-01-25',
    genero: 'masculino',
    funcao: 'diaconia',
    status: 'ativo',
    observacoes: 'Coordenador de visitas hospitalares'
  },
  {
    id: 'MBR0013',
    nome: 'Joana Pereira',
    email: 'joana.pereira@email.com',
    telefone: '(11) 98765-3344',
    nascimento: '1998-07-07',
    genero: 'feminino',
    funcao: 'membro',
    status: 'ativo',
    observacoes: 'Membro ativo da congregação'
  },
  {
    id: 'MBR0014',
    nome: 'Carlos Roberto',
    email: 'carlos.roberto@email.com',
    telefone: '(11) 98765-4455',
    nascimento: '1960-03-20',
    genero: 'masculino',
    funcao: 'membro',
    status: 'ativo',
    observacoes: 'Membro fundador da igreja'
  },
  {
    id: 'MBR0015',
    nome: 'Larissa Campos',
    email: 'larissa.campos@email.com',
    telefone: '(11) 98765-5566',
    nascimento: '2002-12-15',
    genero: 'feminino',
    funcao: 'membro',
    status: 'ativo',
    observacoes: 'Jovem adulto da igreja'
  },
  {
    id: 'MBR0016',
    nome: 'Miguel Nunes',
    email: 'miguel.nunes@email.com',
    telefone: '(11) 98765-6677',
    nascimento: '2008-05-03',
    genero: 'masculino',
    funcao: 'membro',
    status: 'ativo',
    observacoes: 'Adolescente participante do ministério infantil'
  },
  {
    id: 'MBR0017',
    nome: 'Natália Silva',
    email: 'natalia.silva@email.com',
    telefone: '(11) 98765-7788',
    nascimento: '2015-09-10',
    genero: 'feminino',
    funcao: 'membro',
    status: 'ativo',
    observacoes: 'Criança da turma dos pequenos'
  },
  {
    id: 'MBR0018',
    nome: 'Otávio Costa',
    email: 'otavio.costa@email.com',
    telefone: '(11) 98765-8899',
    nascimento: '1970-11-28',
    genero: 'masculino',
    funcao: 'ministro',
    status: 'ativo',
    observacoes: 'Ministro de música'
  },
  {
    id: 'MBR0019',
    nome: 'Patrícia Gomes',
    email: 'patricia.gomes@email.com',
    telefone: '(11) 98765-9900',
    nascimento: '1983-08-16',
    genero: 'feminino',
    funcao: 'professor kids',
    status: 'ativo',
    observacoes: 'Professora auxiliar do ministério infantil'
  },
  {
    id: 'MBR0020',
    nome: 'Ricardo Dias',
    email: 'ricardo.dias@email.com',
    telefone: '(11) 98765-0011',
    nascimento: '1978-02-09',
    genero: 'masculino',
    funcao: 'louvor',
    status: 'ativo',
    observacoes: 'Baterista do grupo de louvor'
  }
];

const sampleEvents = [
  {
    id: 'EVT0001',
    nome: 'Culto Dominical',
    descricao: 'Culto principal da igreja com pregação e louvor',
    data: '2024-01-07T09:00:00',
    local: 'Santuário Principal',
    tipo: 'culto'
  },
  {
    id: 'EVT0002',
    nome: 'Estudo Bíblico Semanal',
    descricao: 'Estudo das escrituras e oração',
    data: '2024-01-10T19:30:00',
    local: 'Sala de Reuniões',
    tipo: 'estudo'
  },
  {
    id: 'EVT0003',
    nome: 'Reunião de Oração',
    descricao: 'Momento de oração e intercessão',
    data: '2024-01-12T18:00:00',
    local: 'Capela',
    tipo: 'culto'
  },
  {
    id: 'EVT0004',
    nome: 'Conferência de Liderança',
    descricao: 'Treinamento para líderes e ministérios',
    data: '2024-02-15T14:00:00',
    local: 'Auditório',
    tipo: 'conferencia'
  },
  {
    id: 'EVT0005',
    nome: 'Retiro Espiritual',
    descricao: 'Final de semana de renovação espiritual',
    data: '2024-03-22T08:00:00',
    local: 'Chácara Bethel',
    tipo: 'retiro'
  },
  {
    id: 'EVT0006',
    nome: 'Festa Junina',
    descricao: 'Celebração comunitária com toda a família',
    data: '2024-06-28T15:00:00',
    local: 'Pátio da Igreja',
    tipo: 'outro'
  },
  {
    id: 'EVT0007',
    nome: 'Culto de Natal',
    descricao: 'Celebração especial do nascimento de Cristo',
    data: '2024-12-24T20:00:00',
    local: 'Santuário Principal',
    tipo: 'culto'
  },
  {
    id: 'EVT0008',
    nome: 'Vigília de Ano Novo',
    descricao: 'Oração e gratidão na virada do ano',
    data: '2024-12-31T22:00:00',
    local: 'Santuário Principal',
    tipo: 'culto'
  },
  // Eventos passados
  {
    id: 'EVT0009',
    nome: 'Culto de Ação de Graças',
    descricao: 'Gratidão pelas bênçãos recebidas',
    data: '2023-11-26T10:00:00',
    local: 'Santuário Principal',
    tipo: 'culto'
  },
  {
    id: 'EVT0010',
    nome: 'Batismo Público',
    descricao: 'Cerimônia de batismo de novos membros',
    data: '2023-10-15T16:00:00',
    local: 'Batistério',
    tipo: 'culto'
  }
];

const samplePrayerRequests = [
  {
    id: 'PRY0001',
    titulo: 'Cura para minha mãe',
    descricao: 'Minha mãe está hospitalizada com pneumonia. Peço orações para sua recuperação completa.',
    categoria: 'Saúde',
    solicitante: 'João da Silva Santos',
    dataRequest: '2024-01-05T10:30:00',
    status: 'ativo',
    privacidade: 'publico'
  },
  {
    id: 'PRY0002',
    titulo: 'Emprego',
    descricao: 'Estou desempregado há 6 meses. Peço orações para encontrar um trabalho digno.',
    categoria: 'Profissional',
    solicitante: 'Carlos Eduardo Souza',
    dataRequest: '2024-01-03T14:20:00',
    status: 'ativo',
    privacidade: 'publico'
  },
  {
    id: 'PRY0003',
    titulo: 'Paz familiar',
    descricao: 'Conflitos em casa têm causado muito sofrimento. Peço orações pela restauração da harmonia.',
    categoria: 'Família',
    solicitante: 'Maria Oliveira Costa',
    dataRequest: '2024-01-01T09:15:00',
    status: 'ativo',
    privacidade: 'publico'
  },
  {
    id: 'PRY0004',
    titulo: 'Sabedoria nos estudos',
    descricao: 'Estou no último ano da faculdade e preciso de sabedoria para as decisões sobre meu futuro.',
    categoria: 'Estudos',
    solicitante: 'Fernanda Cristina Alves',
    dataRequest: '2023-12-28T16:45:00',
    status: 'ativo',
    privacidade: 'publico'
  },
  {
    id: 'PRY0005',
    titulo: 'Proteção na viagem',
    descricao: 'Agradeço as orações! Voltei em segurança da viagem de trabalho.',
    categoria: 'Viagem',
    solicitante: 'Pedro Henrique Lima',
    dataRequest: '2023-12-15T08:00:00',
    status: 'atendido',
    dataResposta: '2023-12-22T20:30:00',
    privacidade: 'publico'
  },
  {
    id: 'PRY0006',
    titulo: 'Nascimento do bebê',
    descricao: 'Glória a Deus! O bebê nasceu saudável e a mãe está bem. Muito obrigada pelas orações.',
    categoria: 'Família',
    solicitante: 'Ana Carolina Ferreira',
    dataRequest: '2023-11-20T12:00:00',
    status: 'atendido',
    dataResposta: '2023-12-10T15:20:00',
    privacidade: 'publico'
  },
  {
    id: 'PRY0007',
    titulo: 'Conversão do esposo',
    descricao: 'Meu marido ainda não conhece Jesus. Peço orações pela conversão dele.',
    categoria: 'Evangelismo',
    solicitante: 'Juliana Pereira Mendes',
    dataRequest: '2023-12-20T19:30:00',
    status: 'ativo',
    privacidade: 'publico'
  },
  {
    id: 'PRY0008',
    titulo: 'Direção ministerial',
    descricao: 'Busco direção de Deus sobre como servir melhor na obra do Senhor.',
    categoria: 'Ministério',
    solicitante: 'Roberto Silva Neto',
    dataRequest: '2024-01-02T11:15:00',
    status: 'ativo',
    privacidade: 'publico'
  }
];

// Classe para gerenciar dados (mesma lógica do código anterior, mas adaptada para React)
class DataManager {
  constructor() {
    this.members = JSON.parse(localStorage.getItem('church_members')) || sampleMembers;
    this.events = JSON.parse(localStorage.getItem('church_events')) || sampleEvents;
    this.prayerRequests = JSON.parse(localStorage.getItem('church_prayers')) || samplePrayerRequests;
  }

  saveMembers() {
    localStorage.setItem('church_members', JSON.stringify(this.members));
  }

  saveEvents() {
    localStorage.setItem('church_events', JSON.stringify(this.events));
  }

  savePrayerRequests() {
    localStorage.setItem('church_prayers', JSON.stringify(this.prayerRequests));
  }

  getMembers() {
    return this.members;
  }

  getEvents() {
    return this.events;
  }

  getPrayerRequests() {
    return this.prayerRequests;
  }

  addMember(member) {
    member.id = `MBR${String(this.members.length + 1).padStart(4, '0')}`;
    member.dataCadastro = new Date().toISOString();
    this.members.push(member);
    this.saveMembers();
    return member;
  }

  addEvent(event) {
    event.id = `EVT${String(this.events.length + 1).padStart(4, '0')}`;
    event.dataCriacao = new Date().toISOString();
    this.events.push(event);
    this.saveEvents();
    return event;
  }

  addPrayerRequest(prayer) {
    prayer.id = `PRY${String(this.prayerRequests.length + 1).padStart(4, '0')}`;
    prayer.dataRequest = new Date().toISOString();
    prayer.status = prayer.status || 'ativo';
    this.prayerRequests.push(prayer);
    this.savePrayerRequests();
    return prayer;
  }
}

function AppContent() {
  const location = useLocation();
  
  // Usar hook do Supabase
  const {
    members,
    setMembers,
    events,
    setEvents,
    families,
    setFamilies,
    avisos,
    setAvisos,
    prayerRequests,
    setPrayerRequests,
    loading,
    error,
    reload
  } = useSupabaseData();
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('church_authenticated') === 'true';
  });
  const [currentMember, setCurrentMember] = useState(() => {
    const saved = localStorage.getItem('current_member');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSignup, setShowSignup] = useState(false);

  const handleAddEvent = async (eventData) => {
    try {
      // Separar comidas dos dados do evento
      const { comidas, ...eventOnlyData } = eventData;
      
      // Criar o evento
      const newEvent = await createEvent(eventOnlyData);
      
      // Se há comidas, criar cada uma na tabela event_foods
      if (comidas && comidas.length > 0) {
        for (const comida of comidas) {
          await createEventFood({
            event_id: newEvent.id,
            nome: comida.nome,
            responsavel: comida.responsavel || null,
            membro_id: null
          });
        }
      }
      
      // Enviar notificação push
      await notifyNewEvent(newEvent.nome, newEvent.id);
      
      // Não adiciona ao estado aqui - a subscription realtime fará isso automaticamente
      // setEvents([...events, newEvent]);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento');
    }
  };

  const handleEditEvent = async (eventId, updatedData) => {
    try {
      // Separar comidas dos dados do evento
      const { comidas, ...eventOnlyData } = updatedData;
      
      console.log('Editando evento:', eventId, eventOnlyData);
      await updateEvent(eventId, eventOnlyData);
      
      // Adicionar apenas novas alimentações (deletar já é feito em tempo real no modal)
      if (comidas) {
        const newFoods = comidas.filter(c => !c.id);
        for (const comida of newFoods) {
          await createEventFood({
            event_id: eventId,
            nome: comida.nome,
            responsavel: comida.responsavel || null,
            membro_id: null
          });
        }
      }
      
      setEvents(events.map(event => event.id === eventId ? { ...event, ...eventOnlyData } : event));
      alert('Evento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar evento:', error);
      alert(`Erro ao editar evento: ${error.message || error}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      alert('Erro ao deletar evento');
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      console.log('Dados enviados para criar membro:', memberData);
      
      // Limpar dados: converter campos vazios para null
      const cleanedData = {
        ...memberData,
        senha: memberData.senha || 'senha123',
        idade: memberData.idade && memberData.idade !== '' ? parseInt(memberData.idade) : null,
        nascimento: memberData.nascimento && memberData.nascimento !== '' ? memberData.nascimento : null,
        email: memberData.email && memberData.email !== '' ? memberData.email : null,
        telefone: memberData.telefone && memberData.telefone !== '' ? memberData.telefone : null,
        familia: memberData.familia && memberData.familia !== '' ? memberData.familia : null,
        funcoes: Array.isArray(memberData.funcoes) && memberData.funcoes.length > 0 ? memberData.funcoes : ['membro']
      };
      
      const newMember = await createMember(cleanedData);
      setMembers([...members, newMember]);
    } catch (error) {
      console.error('Erro detalhado ao criar membro:', error);
      alert(`Erro ao criar membro: ${error.message || error}`);
    }
  };

  const handleEditMember = async (member, updatedData) => {
    try {
      console.log('Editando membro:', member.id, 'com dados:', updatedData);
      
      // Limpar dados antes de enviar
      const cleanedData = {
        ...updatedData,
        idade: updatedData.idade && updatedData.idade !== '' ? parseInt(updatedData.idade) : null,
        nascimento: updatedData.nascimento && updatedData.nascimento !== '' ? updatedData.nascimento : null,
        email: updatedData.email && updatedData.email !== '' ? updatedData.email : null,
        telefone: updatedData.telefone && updatedData.telefone !== '' ? updatedData.telefone : null,
        familia: updatedData.familia && updatedData.familia !== '' ? updatedData.familia : null,
        funcoes: Array.isArray(updatedData.funcoes) && updatedData.funcoes.length > 0 ? updatedData.funcoes : ['membro']
      };
      
      console.log('Dados limpos:', cleanedData);
      
      const updated = await updateMember(member.id, cleanedData);
      setMembers(members.map(m => m.id === member.id ? updated : m));
      
      console.log('Membro atualizado com sucesso');
    } catch (error) {
      console.error('Erro detalhado ao atualizar membro:', error);
      console.error('Mensagem:', error.message);
      console.error('Detalhes:', error.details);
      alert(`Erro ao atualizar membro: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteMember = async (member) => {
    try {
      await deleteMember(member.id);
      setMembers(members.filter(m => m.id !== member.id));
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      alert('Erro ao deletar membro');
    }
  };

  const handleAddFamily = async (familyData) => {
    try {
      console.log('Tentando criar família com dados:', familyData);
      
      // Salvar família no Supabase
      const newFamily = await createFamily({
        nome: familyData.nome,
        descricao: familyData.descricao || '',
        membros_ids: familyData.membrosIds
      });

      console.log('Família criada no Supabase:', newFamily);

      // Adicionar a nova família ao estado
      setFamilies([...families, newFamily]);

      // Atualizar membros localmente apenas se necessário
      if (familyData.membrosIds && familyData.membrosIds.length > 0) {
        console.log('Atualizando membros localmente...');
        const updatedMembers = members.map(member => {
          if (familyData.membrosIds.includes(member.id)) {
            return { ...member, familia: familyData.nome, familiaId: newFamily.id };
          }
          return member;
        });
        setMembers(updatedMembers);
      }

      console.log('Família criada com sucesso!');
    } catch (error) {
      console.error('Erro completo ao criar família:', error);
      console.error('Mensagem do erro:', error.message);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      alert(`Erro ao criar família: ${error.message || 'Tente novamente.'}`);
      throw error; // Re-lançar o erro para que o modal saiba que falhou
    }
  };

  const handleEditFamily = async (oldFamilyId, familyData) => {
    try {
      // Atualizar família no Supabase
      const updatedFamily = await updateFamily(familyData.id || oldFamilyId, {
        nome: familyData.nome,
        descricao: familyData.descricao || '',
        membros_ids: familyData.membrosIds
      });

      // Atualizar a família no estado
      setFamilies(families.map(f => f.id === (familyData.id || oldFamilyId) ? updatedFamily : f));

      // Atualizar membros localmente
      const updatedMembers = members.map(member => {
        // Remove membros que não estão mais na família
        if (member.familiaId === oldFamilyId && !familyData.membrosIds.includes(member.id)) {
          return { ...member, familia: '', familiaId: '' };
        }
        // Adiciona ou atualiza membros na família
        if (familyData.membrosIds.includes(member.id)) {
          return { ...member, familia: familyData.nome, familiaId: familyData.id || oldFamilyId };
        }
        return member;
      });
      setMembers(updatedMembers);

      console.log('Família atualizada no Supabase');
    } catch (error) {
      console.error('Erro ao atualizar família:', error);
      alert('Erro ao atualizar família. Tente novamente.');
    }
  };

  const handleLogin = () => {
    localStorage.setItem('church_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('church_authenticated');
    setIsAuthenticated(false);
  };

  const handleMemberLogin = async (nomeOrEmail, senha) => {
    try {
      const member = await loginMember(nomeOrEmail, senha);
      setCurrentMember(member);
      localStorage.setItem('current_member', JSON.stringify(member));
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const handleMemberLogout = () => {
    setCurrentMember(null);
    localStorage.removeItem('current_member');
  };

  const handleMemberSignup = async (memberData) => {
    try {
      const newMember = await createMember({
        ...memberData,
        data_cadastro: new Date().toISOString()
      });
      
      setMembers([...members, newMember]);
      
      // Fazer login automático após cadastro
      setCurrentMember(newMember);
      localStorage.setItem('current_member', JSON.stringify(newMember));
      setShowSignup(false);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao fazer cadastro');
    }
  };

  console.log('Renderizando App - members:', members.length)

  return (
    <Routes>
      {/* Rota para membros */}
      <Route 
        path="/membro" 
        element={
          currentMember ? (
            <MemberApp 
              currentMember={currentMember}
              events={events}
              avisos={avisos}
              onAddMember={handleAddMember}
              onLogout={handleMemberLogout}
            />
          ) : showSignup ? (
            <MemberSignup 
              onSignup={handleMemberSignup} 
              onBack={() => setShowSignup(false)} 
            />
          ) : (
            <MemberLogin 
              members={members} 
              onLogin={handleMemberLogin}
              onShowSignup={() => setShowSignup(true)}
            />
          )
        } 
      />

      {/* Rota para admin */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <ChurchAdminDashboard 
              members={members} 
              events={events}
              families={families}
              prayerRequests={prayerRequests}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onAddFamily={handleAddFamily}
              onEditFamily={handleEditFamily}
              onLogout={handleLogout}
            />
          ) : (
            <Login onLogin={handleLogin} />
          )
        } 
      />

      {/* Redirecionar qualquer outra rota para / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
