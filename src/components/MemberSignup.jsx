import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Moon, Sun, X } from 'lucide-react';
import CustomCalendar from './CustomCalendar';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Previne múltiplos submits
        
        setError('');
        setIsSubmitting(true);

        // Validações
        if (!formData.nome || !formData.telefone || !formData.nascimento) {
            setError('Por favor, preencha todos os campos obrigatórios');
            setIsSubmitting(false);
            return;
        }

        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem');
            setIsSubmitting(false);
            return;
        }

        if (formData.senha.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres');
            setIsSubmitting(false);
            return;
        }

        // Validar se pelo menos uma função foi selecionada
        if (formData.funcoes.length === 0) {
            setError('Selecione pelo menos uma função');
            setIsSubmitting(false);
            return;
        }

        try {
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

            await onSignup(newMember);
        } catch (err) {
            setError('Erro ao cadastrar. Tente novamente.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-black overflow-y-scroll" style={{
            paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 80px)',
            paddingLeft: '16px',
            paddingRight: '16px',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
        }}>
            <div className="max-w-md w-full mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
                    <div className="flex justify-start items-center mb-6">
                        <button
                            onClick={onBack}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                            <UserPlus className="h-8 w-8 text-gray-900 dark:text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Cadastro de Membro</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Preencha seus dados para se cadastrar</p>
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                required
                            />
                        </div>

                        <CustomCalendar
                            label="Data de Nascimento *"
                            value={formData.nascimento}
                            onChange={(newBirthDate) => {
                                const calculatedAge = calculateAge(newBirthDate);
                                setFormData({ 
                                    ...formData, 
                                    nascimento: newBirthDate,
                                    idade: calculatedAge
                                });
                            }}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gênero *
                            </label>
                            <select
                                value={formData.genero}
                                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                    'jovem',
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
                                                ? 'bg-gray-900 border-gray-900 dark:bg-white dark:border-white' 
                                                : 'bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-500'
                                                }`}>
                                                    {isChecked && (
                                                        <X className="w-4 h-4 text-white dark:text-gray-900" strokeWidth={3} />
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                required
                                minLength={4}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {isSubmitting && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                                    ⏳ Conectando com o servidor...
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Já tem cadastro?{' '}
                            <button onClick={onBack} className="text-gray-900 dark:text-white hover:underline font-semibold">
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
