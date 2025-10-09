import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Moon, Sun, X } from 'lucide-react';

const MemberSignup = ({ onSignup, onBack }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true' || false;
    });
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        nascimento: '',
        idade: null,
        genero: 'masculino',
        funcoes: [],
        senha: '',
        confirmarSenha: ''
    });

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
    
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validações
        if (!formData.nome || !formData.telefone || !formData.nascimento) {
            setError('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.senha.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres');
            return;
        }

        // Validar se pelo menos uma função foi selecionada
        if (formData.funcoes.length === 0) {
            setError('Selecione pelo menos uma função');
            return;
        }

        // Criar novo membro
        const newMember = {
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            nascimento: formData.nascimento,
            idade: formData.idade,
            genero: formData.genero,
            funcoes: formData.funcoes,
            status: 'ativo',
            senha: formData.senha
        };

        onSignup(newMember);
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
            <div className="min-h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
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
                            <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cadastro de Membro</h1>
                        <p className="text-gray-600 dark:text-gray-400">Preencha seus dados para se cadastrar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Telefone *
                            </label>
                            <input
                                type="tel"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                placeholder="(11) 98765-4321"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Data de Nascimento *
                            </label>
                            <input
                                type="date"
                                value={formData.nascimento}
                                onChange={(e) => {
                                    const newBirthDate = e.target.value;
                                    const calculatedAge = calculateAge(newBirthDate);
                                    setFormData({ 
                                        ...formData, 
                                        nascimento: newBirthDate,
                                        idade: calculatedAge
                                    });
                                }}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gênero *
                            </label>
                            <select
                                value={formData.genero}
                                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Funções * (Selecione uma ou mais)
                            </label>
                            <div className="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 max-h-48 overflow-y-auto">
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
                                    const isChecked = formData.funcoes.includes(funcao);
                                    const label = funcao.charAt(0).toUpperCase() + funcao.slice(1);
                                    return (
                                        <label key={funcao} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                funcoes: [...formData.funcoes, funcao]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                funcoes: formData.funcoes.filter(f => f !== funcao)
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
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                                                {label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {formData.funcoes.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">Selecione pelo menos uma função</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Senha *
                            </label>
                            <input
                                type="password"
                                value={formData.senha}
                                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                placeholder="Mínimo 4 caracteres"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                                minLength={4}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirmar Senha *
                            </label>
                            <input
                                type="password"
                                value={formData.confirmarSenha}
                                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                placeholder="Digite a senha novamente"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                                minLength={4}
                            />
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
                            <UserPlus className="h-5 w-5" />
                            <span>Cadastrar</span>
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Já tem cadastro?{' '}
                            <button onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Fazer login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberSignup;
