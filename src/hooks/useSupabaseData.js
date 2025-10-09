import { useState, useEffect } from 'react'
import { 
    getMembers, 
    getEvents, 
    getFamilies, 
    getAvisos, 
    getPrayerRequests 
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

            const [
                membersData, 
                eventsData, 
                familiesData, 
                avisosData, 
                prayerData
            ] = await Promise.all([
                getMembers(),
                getEvents(),
                getFamilies(),
                getAvisos(),
                getPrayerRequests()
            ])

            setMembers(membersData || [])
            setEvents(eventsData || [])
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
