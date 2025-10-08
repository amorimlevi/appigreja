import React, { useState } from 'react';
import { LogIn, User, Lock, Moon, Sun } from 'lucide-react';

const MemberLogin = ({ members, onLogin }) => {
    const [selectedMember, setSelectedMember] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true' || false;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!selectedMember) {
            setError('Por favor, selecione um membro');
            return;
        }

        // Encontrar o membro selecionado
        const member = members.find(m => m.id === selectedMember);
        
        if (member) {
            // Por enquanto, qualquer senha é aceita (você pode adicionar validação real depois)
            onLogin(member);
        } else {
            setError('Membro não encontrado');
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
            <div className="min-h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => {
                                setDarkMode(!darkMode);
                                localStorage.setItem('darkMode', !darkMode);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            {darkMode ? <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <Moon className="h-5 w-5 text-gray-600" />}
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Área do Membro</h1>
                        <p className="text-gray-600 dark:text-gray-400">Entre com suas credenciais</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Selecione seu nome
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="">Escolha seu nome...</option>
                                    {members
                                        .sort((a, b) => a.nome.localeCompare(b.nome))
                                        .map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.nome}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Senha (opcional por enquanto)
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Digite sua senha"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Sistema em desenvolvimento - qualquer senha é aceita
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <LogIn className="h-5 w-5" />
                            <span>Entrar</span>
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Primeira vez aqui? Entre em contato com a administração da igreja.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberLogin;
