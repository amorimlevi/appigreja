import React, { useState } from 'react';
import { LogIn, User, Lock, Moon, Sun, UserPlus } from 'lucide-react';

const MemberLogin = ({ members, onLogin, onShowSignup }) => {
    const [emailOrName, setEmailOrName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true' || false;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!emailOrName || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        // Encontrar o membro por nome ou email
        const member = members.find(m => 
            m.nome?.toLowerCase() === emailOrName.toLowerCase() || 
            m.email?.toLowerCase() === emailOrName.toLowerCase()
        );
        
        if (!member) {
            setError('Usuário não encontrado');
            return;
        }

        // Verificar senha (se o membro tiver senha cadastrada)
        if (member.senha && member.senha !== password) {
            setError('Senha incorreta');
            return;
        }

        // Login bem-sucedido
        onLogin(member);
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
                                Nome ou Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={emailOrName}
                                    onChange={(e) => setEmailOrName(e.target.value)}
                                    placeholder="Digite seu nome ou email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Digite sua senha"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
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
                            Primeira vez aqui?{' '}
                            <button 
                                onClick={onShowSignup}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center"
                            >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Cadastre-se
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberLogin;
