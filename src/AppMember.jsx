import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MemberApp from './components/MemberApp'
import MemberLogin from './components/MemberLogin'
import MemberSignup from './components/MemberSignup'
import { useSupabaseData } from './hooks/useSupabaseData'
import { createMember, loginMember } from './lib/supabaseService'

function AppMember() {
  const {
    members,
    setMembers,
    events,
    avisos,
    loading
  } = useSupabaseData();
  
  const [currentMember, setCurrentMember] = useState(() => {
    const saved = localStorage.getItem('current_member');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSignup, setShowSignup] = useState(false);

  const handleAddMember = async (memberData) => {
    try {
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
      console.error('Erro ao criar membro:', error);
      alert(`Erro ao criar membro: ${error.message || error}`);
    }
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
      
      setCurrentMember(newMember);
      localStorage.setItem('current_member', JSON.stringify(newMember));
      setShowSignup(false);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      // Re-throw para o componente tratar
      throw new Error(error.message || 'Erro ao fazer cadastro');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppMember;
