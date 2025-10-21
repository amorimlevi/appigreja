import { useState, useEffect } from 'react';
import { getChurchSettings, getChurchSetting } from '../lib/supabaseService';

// Hook para buscar todas as configurações
export const useChurchSettings = () => {
    const [settings, setSettings] = useState({
        church_logo_url: '',
        church_logo_url_dark: '',
        church_name: 'Igreja'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const data = await getChurchSettings();
                setSettings(prev => ({ ...prev, ...data }));
            } catch (err) {
                console.error('Erro ao carregar configurações:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
};

// Hook para buscar uma configuração específica
export const useChurchSetting = (key, defaultValue = null) => {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                setLoading(true);
                const data = await getChurchSetting(key);
                setValue(data || defaultValue);
            } catch (err) {
                console.error(`Erro ao carregar configuração ${key}:`, err);
                setError(err);
                setValue(defaultValue);
            } finally {
                setLoading(false);
            }
        };

        if (key) {
            fetchSetting();
        }
    }, [key, defaultValue]);

    return { value, loading, error };
};

// Hook específico para a logo da igreja (com suporte a tema claro/escuro)
export const useChurchLogo = (isDark = false) => {
    const key = isDark ? 'church_logo_url_dark' : 'church_logo_url';
    return useChurchSetting(key, '');
};
