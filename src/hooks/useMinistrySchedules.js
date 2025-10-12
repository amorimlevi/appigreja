import { useState, useEffect } from 'react'
import { getMinistrySchedules, subscribeToTable } from '../lib/supabaseService'

export const useMinistrySchedules = (ministerio) => {
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadSchedules = async () => {
            try {
                setLoading(true)
                const data = await getMinistrySchedules(ministerio)
                setSchedules(data || [])
            } catch (err) {
                console.error(`Erro ao carregar escalas de ${ministerio}:`, err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadSchedules()

        // Setup realtime subscription
        const subscription = subscribeToTable(
            'ministry_schedules',
            (newSchedule) => {
                // Adicionar apenas se for do ministério correto
                if (newSchedule.ministerio === ministerio) {
                    setSchedules(prev => [...prev, newSchedule])
                }
            },
            (updatedSchedule) => {
                // Atualizar apenas se for do ministério correto
                if (updatedSchedule.ministerio === ministerio) {
                    setSchedules(prev => prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s))
                } else {
                    // Se mudou de ministério, remover da lista atual
                    setSchedules(prev => prev.filter(s => s.id !== updatedSchedule.id))
                }
            },
            (deletedSchedule) => {
                setSchedules(prev => prev.filter(s => s.id !== deletedSchedule.id))
            }
        )

        return () => {
            if (subscription) {
                subscription.unsubscribe().catch(err => console.error('Erro ao desinscrever ministry_schedules:', err))
            }
        }
    }, [ministerio])

    return {
        schedules,
        setSchedules,
        loading,
        error
    }
}
