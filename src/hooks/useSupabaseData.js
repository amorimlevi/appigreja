import { useState, useEffect } from 'react'
import { 
    getMembers, 
    getEvents, 
    getFamilies, 
    getAvisos, 
    getPrayerRequests,
    cleanupPastEventFoods,
    getWorkshops,
    subscribeToTable
} from '../lib/supabaseService'

export const useSupabaseData = () => {
    const [members, setMembers] = useState([])
    const [events, setEvents] = useState([])
    const [families, setFamilies] = useState([])
    const [avisos, setAvisos] = useState([])
    const [prayerRequests, setPrayerRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Limpar alimentações de eventos passados
            try {
                await cleanupPastEventFoods()
                console.log('Alimentações de eventos passados limpas com sucesso')
            } catch (cleanupErr) {
                console.error('Erro ao limpar alimentações de eventos passados:', cleanupErr)
                // Não interrompe o carregamento se a limpeza falhar
            }

            const [
                membersData, 
                eventsData, 
                familiesData, 
                avisosData, 
                prayerData,
                workshopsData
            ] = await Promise.all([
                getMembers(),
                getEvents(),
                getFamilies(),
                getAvisos(),
                getPrayerRequests(),
                getWorkshops()
            ])

            // Converter workshops para formato de eventos para exibição no calendário
            const workshopEvents = (workshopsData || []).map(workshop => {
                // Se data já é timestamp, usar direto; senão combinar com horário
                let dataEvento;
                if (workshop.data.includes('T')) {
                    dataEvento = workshop.data;
                } else {
                    dataEvento = `${workshop.data}T${workshop.horario || '00:00'}`;
                }
                
                return {
                    id: `workshop-${workshop.id}`,
                    nome: `Oficina: ${workshop.nome}`,
                    data: dataEvento,
                    local: workshop.local,
                    descricao: workshop.descricao,
                    tipo: 'oficina',
                    vagas: workshop.vagas,
                    inscritos: workshop.inscritos,
                    workshopId: workshop.id
                };
            })

            // Combinar eventos regulares com workshops
            const allEvents = [...(eventsData || []), ...workshopEvents]

            setMembers(membersData || [])
            setEvents(allEvents)
            setFamilies(familiesData || [])
            setAvisos(avisosData || [])
            setPrayerRequests(prayerData || [])
        } catch (err) {
            console.error('Erro ao carregar dados:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()

        // Setup realtime subscriptions
        console.log('[Realtime] Configurando subscriptions...')

        // Subscription para avisos
        const avisosSubscription = subscribeToTable(
            'avisos',
            (newAviso) => {
                setAvisos(prev => [newAviso, ...prev])
            },
            (updatedAviso) => {
                setAvisos(prev => prev.map(a => a.id === updatedAviso.id ? updatedAviso : a))
            },
            (deletedAviso) => {
                setAvisos(prev => prev.filter(a => a.id !== deletedAviso.id))
            }
        )

        // Subscription para eventos
        const eventsSubscription = subscribeToTable(
            'events',
            (newEvent) => {
                setEvents(prev => [...prev, newEvent])
            },
            (updatedEvent) => {
                setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e))
            },
            (deletedEvent) => {
                setEvents(prev => prev.filter(e => e.id !== deletedEvent.id))
            }
        )

        // Subscription para members
        const membersSubscription = subscribeToTable(
            'members',
            (newMember) => {
                setMembers(prev => [...prev, newMember].sort((a, b) => a.nome.localeCompare(b.nome)))
            },
            (updatedMember) => {
                setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m).sort((a, b) => a.nome.localeCompare(b.nome)))
            },
            (deletedMember) => {
                setMembers(prev => prev.filter(m => m.id !== deletedMember.id))
            }
        )

        // Subscription para families
        const familiesSubscription = subscribeToTable(
            'families',
            (newFamily) => {
                setFamilies(prev => [...prev, newFamily])
            },
            (updatedFamily) => {
                setFamilies(prev => prev.map(f => f.id === updatedFamily.id ? updatedFamily : f))
            },
            (deletedFamily) => {
                setFamilies(prev => prev.filter(f => f.id !== deletedFamily.id))
            }
        )

        // Subscription para workshops - recarregar eventos quando workshops mudam
        const workshopsSubscription = subscribeToTable(
            'workshops',
            async () => {
                // Recarregar workshops e atualizar eventos
                const workshopsData = await getWorkshops()
                const workshopEvents = (workshopsData || []).map(workshop => {
                    let dataEvento;
                    if (workshop.data.includes('T')) {
                        dataEvento = workshop.data;
                    } else {
                        dataEvento = `${workshop.data}T${workshop.horario || '00:00'}`;
                    }
                    
                    return {
                        id: `workshop-${workshop.id}`,
                        nome: `Oficina: ${workshop.nome}`,
                        data: dataEvento,
                        local: workshop.local,
                        descricao: workshop.descricao,
                        tipo: 'oficina',
                        vagas: workshop.vagas,
                        inscritos: workshop.inscritos,
                        workshopId: workshop.id
                    };
                })
                
                // Atualizar eventos removendo workshops antigos e adicionando novos
                setEvents(prev => {
                    const regularEvents = prev.filter(e => !String(e.id).startsWith('workshop-'))
                    return [...regularEvents, ...workshopEvents]
                })
            },
            async () => {
                // Mesmo handler para UPDATE
                const workshopsData = await getWorkshops()
                const workshopEvents = (workshopsData || []).map(workshop => {
                    let dataEvento;
                    if (workshop.data.includes('T')) {
                        dataEvento = workshop.data;
                    } else {
                        dataEvento = `${workshop.data}T${workshop.horario || '00:00'}`;
                    }
                    
                    return {
                        id: `workshop-${workshop.id}`,
                        nome: `Oficina: ${workshop.nome}`,
                        data: dataEvento,
                        local: workshop.local,
                        descricao: workshop.descricao,
                        tipo: 'oficina',
                        vagas: workshop.vagas,
                        inscritos: workshop.inscritos,
                        workshopId: workshop.id
                    };
                })
                
                setEvents(prev => {
                    const regularEvents = prev.filter(e => !String(e.id).startsWith('workshop-'))
                    return [...regularEvents, ...workshopEvents]
                })
            },
            (deletedWorkshop) => {
                setEvents(prev => prev.filter(e => e.workshopId !== deletedWorkshop.id))
            }
        )

        // Subscription para prayer requests
        const prayerSubscription = subscribeToTable(
            'prayer_requests',
            (newRequest) => {
                setPrayerRequests(prev => [newRequest, ...prev])
            },
            (updatedRequest) => {
                setPrayerRequests(prev => prev.map(p => p.id === updatedRequest.id ? updatedRequest : p))
            },
            (deletedRequest) => {
                setPrayerRequests(prev => prev.filter(p => p.id !== deletedRequest.id))
            }
        )

        console.log('[Realtime] Subscriptions configuradas')

        // Cleanup subscriptions on unmount
        return () => {
            console.log('[Realtime] Limpando subscriptions...')
            if (avisosSubscription) avisosSubscription.unsubscribe().catch(err => console.error('Erro ao desinscrever avisos:', err))
            if (eventsSubscription) eventsSubscription.unsubscribe().catch(err => console.error('Erro ao desinscrever events:', err))
            if (membersSubscription) membersSubscription.unsubscribe().catch(err => console.error('Erro ao desinscrever members:', err))
            if (familiesSubscription) familiesSubscription.unsubscribe().catch(err => console.error('Erro ao desinscrever families:', err))
            if (workshopsSubscription) workshopsSubscription.unsubscribe().catch(err => console.error('Erro ao desinscrever workshops:', err))
            if (prayerSubscription) prayerSubscription.unsubscribe().catch(err => console.error('Erro ao desinscrever prayer:', err))
        }
    }, [])

    return {
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
        reload: loadData
    }
}
