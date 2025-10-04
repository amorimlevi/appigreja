import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Teste de Renderização</h1>
        <p className="text-gray-700">Se você está vendo isso, o React está funcionando!</p>
      </div>
    </div>
  )
}

export default App

// Dados de exemplo para demonstração
const sampleMembers = [
  {
    id: 'MBR0001',
    nome: 'João da Silva Santos',
    email: 'joao.santos@email.com',
    telefone: '(11) 99999-1111',
    nascimento: '1985-03-15',
    genero: 'masculino',
    status: 'ativo',
    observacoes: 'Membro ativo da banda de louvor'
  },
  {
    id: 'MBR0002',
    nome: 'Maria Oliveira Costa',
    email: 'maria.costa@email.com',
    telefone: '(11) 99999-2222',
    nascimento: '1990-07-22',
    genero: 'feminino',
    status: 'ativo',
    observacoes: 'Professora da escola dominical'
  },
  {
    id: 'MBR0003',
    nome: 'Pedro Henrique Lima',
    email: 'pedro.lima@email.com',
    telefone: '(11) 99999-3333',
    nascimento: '1978-11-08',
    genero: 'masculino',
    status: 'ativo',
    observacoes: 'Líder de célula'
  },
  {
    id: 'MBR0004',
    nome: 'Ana Carolina Ferreira',
    email: 'ana.ferreira@email.com',
    telefone: '(11) 99999-4444',
    nascimento: '1995-12-25',
    genero: 'feminino',
    status: 'ativo',
    observacoes: 'Coordenadora do ministério infantil'
  },
  {
    id: 'MBR0005',
    nome: 'Carlos Eduardo Souza',
    email: 'carlos.souza@email.com',
    telefone: '(11) 99999-5555',
    nascimento: '1965-04-10',
    genero: 'masculino',
    status: 'ativo',
    observacoes: 'Diácono e tesoureiro'
  },
  {
    id: 'MBR0006',
    nome: 'Fernanda Cristina Alves',
    email: 'fernanda.alves@email.com',
    telefone: '(11) 99999-6666',
    nascimento: '2000-09-18',
    genero: 'feminino',
    status: 'ativo',
    observacoes: 'Jovem do ministério de dança'
  },
  {
    id: 'MBR0007',
    nome: 'Roberto Silva Neto',
    email: 'roberto.neto@email.com',
    telefone: '(11) 99999-7777',
    nascimento: '1988-01-30',
    genero: 'masculino',
    status: 'inativo',
    observacoes: 'Mudou de cidade'
  },
  {
    id: 'MBR0008',
    nome: 'Juliana Pereira Mendes',
    email: 'juliana.mendes@email.com',
    telefone: '(11) 99999-8888',
    nascimento: '1992-06-12',
    genero: 'feminino',
    status: 'ativo',
    observacoes: 'Secretária da igreja'
  },
  {
    id: 'MBR0009',
    nome: 'Daniel Santos Cruz',
    email: 'daniel.cruz@email.com',
    telefone: '(11) 99999-9999',
    nascimento: '2010-05-20',
    genero: 'masculino',
    status: 'ativo',
    observacoes: 'Criança ativa no ministério infantil'
  },
  {
    id: 'MBR0010',
    nome: 'Gabriela Rosa Lima',
    email: 'gabriela.lima@email.com',
    telefone: '(11) 99999-0000',
    nascimento: '2005-10-03',
    genero: 'feminino',
    status: 'ativo',
    observacoes: 'Adolescente do grupo de jovens'
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

function App() {
  const [dataManager] = useState(new DataManager());
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [prayerRequests, setPrayerRequests] = useState([]);

  useEffect(() => {
    // Carregar dados iniciais
    setMembers(dataManager.getMembers());
    setEvents(dataManager.getEvents());
    setPrayerRequests(dataManager.getPrayerRequests());

    // Salvar dados de exemplo no localStorage se não existirem
    if (!localStorage.getItem('church_members')) {
      dataManager.saveMembers();
    }
    if (!localStorage.getItem('church_events')) {
      dataManager.saveEvents();
    }
    if (!localStorage.getItem('church_prayers')) {
      dataManager.savePrayerRequests();
    }
  }, [dataManager]);

  const handleAddEvent = (eventData) => {
    const newEvent = {
      id: `EVT${String(events.length + 1).padStart(4, '0')}`,
      ...eventData
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    dataManager.events = updatedEvents;
    dataManager.saveEvents();
  };

  const handleAddMember = (memberData) => {
    const newMember = {
      id: `MBR${String(members.length + 1).padStart(4, '0')}`,
      ...memberData
    };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    dataManager.members = updatedMembers;
    dataManager.saveMembers();
  };

  const handleEditMember = (member, updatedData) => {
    const updatedMembers = members.map(m => 
      m.id === member.id ? { ...m, ...updatedData } : m
    );
    setMembers(updatedMembers);
    dataManager.members = updatedMembers;
    dataManager.saveMembers();
  };

  const handleDeleteMember = (member) => {
    const updatedMembers = members.filter(m => m.id !== member.id);
    setMembers(updatedMembers);
    dataManager.members = updatedMembers;
    dataManager.saveMembers();
  };

  const handleAddFamily = (familyData) => {
    const updatedMembers = members.map(member => {
      if (familyData.membrosIds.includes(member.id)) {
        return { ...member, familia: familyData.nome };
      }
      return member;
    });
    setMembers(updatedMembers);
    dataManager.members = updatedMembers;
    dataManager.saveMembers();
  };

  const handleEditFamily = (oldFamilyName, familyData) => {
    const updatedMembers = members.map(member => {
      // Remove família antiga de membros que não estão mais selecionados
      if (member.familia === oldFamilyName && !familyData.membrosIds.includes(member.id)) {
        return { ...member, familia: '' };
      }
      // Adiciona/atualiza família para membros selecionados
      if (familyData.membrosIds.includes(member.id)) {
        return { ...member, familia: familyData.nome };
      }
      return member;
    });
    setMembers(updatedMembers);
    dataManager.members = updatedMembers;
    dataManager.saveMembers();
  };

  return (
    <div className="App">
      <ChurchAdminDashboard 
        members={members} 
        events={events}
        prayerRequests={prayerRequests}
        onAddEvent={handleAddEvent}
        onAddMember={handleAddMember}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
        onAddFamily={handleAddFamily}
        onEditFamily={handleEditFamily}
      />
    </div>
  );
}

export default App;
