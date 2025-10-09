import { supabase } from './supabaseClient'

// ========== MEMBROS ==========

export const getMembers = async () => {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('nome', { ascending: true })
    
    if (error) throw error
    return data
}

export const getMemberById = async (id) => {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()
    
    if (error) throw error
    return data
}

export const createMember = async (memberData) => {
    const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const updateMember = async (id, memberData) => {
    // Remover campos que não devem ser atualizados
    const { id: _, created_at, updated_at, data_cadastro, familiaId, ...cleanData } = memberData;
    
    console.log('updateMember - ID:', id);
    console.log('updateMember - Dados recebidos:', memberData);
    console.log('updateMember - Dados limpos a enviar:', cleanData);
    console.log('updateMember - Funcoes:', cleanData.funcoes);
    
    const { data, error } = await supabase
        .from('members')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()
    
    if (error) {
        console.error('Erro do Supabase ao atualizar:', error);
        throw error;
    }
    
    console.log('Membro atualizado no Supabase:', data);
    console.log('Funcoes retornadas do Supabase:', data.funcoes);
    return data;
}

export const deleteMember = async (id) => {
    const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)
    
    if (error) throw error
}

export const loginMember = async (nomeOrEmail, senha) => {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`nome.eq.${nomeOrEmail},email.eq.${nomeOrEmail}`)
        .eq('senha', senha)
        .single()
    
    if (error) throw error
    return data
}

export const searchMembers = async (searchTerm) => {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .ilike('nome', `%${searchTerm}%`)
        .order('nome', { ascending: true })
    
    if (error) throw error
    return data
}

// ========== ESCALAS DE MINISTÉRIOS ==========

export const getMinistrySchedules = async (ministerio, dataInicio = null, dataFim = null) => {
    if (ministerio === 'louvor') {
        let query = supabase
            .from('escalas_louvor')
            .select(`
                *,
                musicos:escalas_louvor_musicos(
                    id,
                    instrumento,
                    membro:members(*)
                )
            `)
            .order('data', { ascending: true })
        
        if (dataInicio) {
            query = query.gte('data', dataInicio)
        }
        
        if (dataFim) {
            query = query.lte('data', dataFim)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        return data.map(escala => ({
            ...escala,
            musicos: escala.musicos.map(m => ({
                ...m.membro,
                instrumento: m.instrumento
            }))
        }))
    }
    
    let query = supabase
        .from('ministry_schedules')
        .select('*')
        .eq('ministerio', ministerio)
        .order('data', { ascending: true })
    
    if (dataInicio) {
        query = query.gte('data', dataInicio)
    }
    
    if (dataFim) {
        query = query.lte('data', dataFim)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
}

export const getScheduleById = async (id) => {
    const { data, error } = await supabase
        .from('ministry_schedules')
        .select('*')
        .eq('id', id)
        .single()
    
    if (error) throw error
    return data
}

export const createMinistrySchedule = async (scheduleData) => {
    if (scheduleData.ministerio === 'louvor') {
        const { musicos, ...escalaData } = scheduleData
        
        const { data: escala, error: escalaError } = await supabase
            .from('escalas_louvor')
            .insert([escalaData])
            .select()
            .single()
        
        if (escalaError) throw escalaError
        
        if (musicos && musicos.length > 0) {
            const musicosData = musicos.map(m => ({
                escala_id: escala.id,
                membro_id: m.id,
                instrumento: m.instrumento
            }))
            
            const { error: musicosError } = await supabase
                .from('escalas_louvor_musicos')
                .insert(musicosData)
            
            if (musicosError) throw musicosError
        }
        
        return escala
    }
    
    const { data, error } = await supabase
        .from('ministry_schedules')
        .insert([scheduleData])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const updateMinistrySchedule = async (id, scheduleData) => {
    if (scheduleData.ministerio === 'louvor') {
        const { id: _, created_at, updated_at, musicos, ...cleanData } = scheduleData
        
        const { data: escala, error: escalaError } = await supabase
            .from('escalas_louvor')
            .update(cleanData)
            .eq('id', id)
            .select()
            .single()
        
        if (escalaError) throw escalaError
        
        const { error: deleteError } = await supabase
            .from('escalas_louvor_musicos')
            .delete()
            .eq('escala_id', id)
        
        if (deleteError) throw deleteError
        
        if (musicos && musicos.length > 0) {
            const musicosData = musicos.map(m => ({
                escala_id: id,
                membro_id: m.id,
                instrumento: m.instrumento
            }))
            
            const { error: musicosError } = await supabase
                .from('escalas_louvor_musicos')
                .insert(musicosData)
            
            if (musicosError) throw musicosError
        }
        
        return escala
    }
    
    const { id: _, created_at, updated_at, ...cleanData } = scheduleData
    
    const { data, error } = await supabase
        .from('ministry_schedules')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const deleteMinistrySchedule = async (id, ministerio = null) => {
    if (ministerio === 'louvor') {
        const { error } = await supabase
            .from('escalas_louvor')
            .delete()
            .eq('id', id)
        
        if (error) throw error
        return
    }
    
    const { error } = await supabase
        .from('ministry_schedules')
        .delete()
        .eq('id', id)
    
    if (error) throw error
}

// ========== FAMÍLIAS ==========

export const getFamilies = async () => {
    const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('nome', { ascending: true })
    
    if (error) throw error
    return data
}

export const createFamily = async (familyData) => {
    const { data, error } = await supabase
        .from('families')
        .insert([familyData])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const updateFamily = async (id, familyData) => {
    const { data, error } = await supabase
        .from('families')
        .update(familyData)
        .eq('id', id)
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const getFamilyByMemberId = async (memberId) => {
    const { data, error } = await supabase
        .from('families')
        .select('*')
        .contains('membros_ids', [memberId])
        .single()
    
    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }
    return data
}

// ========== EVENTOS ==========

export const getEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('data', { ascending: true })
    
    if (error) throw error
    return data
}

export const createEvent = async (eventData) => {
    const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const updateEvent = async (id, eventData) => {
    const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const deleteEvent = async (id) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
    
    if (error) throw error
}

// ========== COMIDAS DO EVENTO ==========

export const getEventFoods = async (eventId) => {
    const { data, error } = await supabase
        .from('event_foods')
        .select(`
            *,
            member:members!event_foods_membro_id_fkey(id, nome)
        `)
        .eq('event_id', eventId)
    
    if (error) throw error
    return data
}

export const createEventFood = async (foodData) => {
    const { data, error } = await supabase
        .from('event_foods')
        .insert([foodData])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const updateEventFood = async (id, foodData) => {
    const { data, error } = await supabase
        .from('event_foods')
        .update(foodData)
        .eq('id', id)
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const deleteEventFoods = async (eventId) => {
    const { error } = await supabase
        .from('event_foods')
        .delete()
        .eq('event_id', eventId)
    
    if (error) throw error
}

export const deleteEventFood = async (id) => {
    console.log('deleteEventFood chamada com ID:', id);
    const { data, error } = await supabase
        .from('event_foods')
        .delete()
        .eq('id', id)
        .select()
    
    console.log('Resultado da deleção:', { data, error });
    if (error) {
        console.error('Erro no deleteEventFood:', error);
        throw error;
    }
    console.log('DeleteEventFood concluído sem erro');
    return data;
}

export const cleanupPastEventFoods = async () => {
    // Buscar eventos que já passaram
    const now = new Date().toISOString()
    const { data: pastEvents, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .lt('data', now)
    
    if (eventsError) throw eventsError
    
    if (pastEvents && pastEvents.length > 0) {
        const eventIds = pastEvents.map(e => e.id)
        
        // Deletar todas as alimentações dos eventos passados
        const { error: deleteError } = await supabase
            .from('event_foods')
            .delete()
            .in('event_id', eventIds)
        
        if (deleteError) throw deleteError
        
        return { cleaned: pastEvents.length }
    }
    
    return { cleaned: 0 }
}

// ========== PARTICIPANTES DE EVENTOS ==========

export const registerEventParticipant = async (eventId, membroId) => {
    const { data, error } = await supabase
        .from('event_participants')
        .insert([{
            event_id: eventId,
            membro_id: membroId,
            confirmado: true
        }])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const unregisterEventParticipant = async (eventId, membroId) => {
    const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('membro_id', membroId)
    
    if (error) throw error
}

export const getEventParticipants = async (eventId) => {
    const { data, error } = await supabase
        .from('event_participants')
        .select(`
            *,
            member:members!event_participants_membro_id_fkey(id, nome)
        `)
        .eq('event_id', eventId)
    
    if (error) throw error
    return data
}

export const checkEventRegistration = async (eventId, membroId) => {
    const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('membro_id', membroId)
        .maybeSingle()
    
    if (error) throw error
    return data !== null
}

// ========== WORKSHOPS ==========

export const getWorkshops = async () => {
    const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('data', { ascending: true })
    
    if (error) throw error
    return data
}

export const createWorkshop = async (workshopData) => {
    const { data, error } = await supabase
        .from('workshops')
        .insert([workshopData])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const updateWorkshop = async (id, workshopData) => {
    const { data, error } = await supabase
        .from('workshops')
        .update(workshopData)
        .eq('id', id)
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const deleteWorkshop = async (id) => {
    const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', id)
    
    if (error) throw error
}

export const registerWorkshopParticipant = async (workshopId, membroId) => {
    const { data, error } = await supabase
        .from('workshops_inscricoes')
        .insert([{ workshop_id: workshopId, membro_id: Number(membroId) }])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const unregisterWorkshopParticipant = async (workshopId, membroId) => {
    const { error } = await supabase
        .from('workshops_inscricoes')
        .delete()
        .eq('workshop_id', workshopId)
        .eq('membro_id', Number(membroId))
    
    if (error) throw error
}

export const checkWorkshopRegistration = async (workshopId, membroId) => {
    const { data, error } = await supabase
        .from('workshops_inscricoes')
        .select('*')
        .eq('workshop_id', workshopId)
        .eq('membro_id', Number(membroId))
        .maybeSingle()
    
    if (error) throw error
    return data !== null
}

export const getWorkshopRegistrations = async (workshopId) => {
    const { data, error } = await supabase
        .from('workshops_inscricoes')
        .select(`
            *,
            member:members!workshops_inscricoes_membro_id_fkey(id, nome)
        `)
        .eq('workshop_id', workshopId)
    
    if (error) throw error
    return data
}

// ========== AVISOS ==========

export const getAvisos = async () => {
    const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .order('data_envio', { ascending: false })
    
    if (error) throw error
    return data
}

export const createAviso = async (avisoData) => {
    const { data, error } = await supabase
        .from('avisos')
        .insert([avisoData])
        .select()
        .single()
    
    if (error) throw error
    
    // Criar notificações para membros específicos baseado nos destinatários
    if (data) {
        const allMembers = await getMembers()
        let targetMembers = []
        
        // Verificar se é para todos ou filtrar por função/flag
        if (avisoData.destinatarios?.includes('todos')) {
            targetMembers = allMembers
        } else {
            // Filtrar membros que têm pelo menos uma das funções selecionadas
            targetMembers = allMembers.filter(member => {
                const memberFuncoes = member.funcoes || []
                return avisoData.destinatarios?.some(dest => 
                    memberFuncoes.includes(dest)
                )
            })
        }
        
        // Criar notificações apenas para membros filtrados
        if (targetMembers.length > 0) {
            const notifications = targetMembers.map(member => ({
                aviso_id: data.id,
                membro_id: member.id,
                lido: false
            }))
            
            await supabase
                .from('aviso_notifications')
                .insert(notifications)
        }
    }
    
    return data
}

export const getUnreadAvisosCount = async (membroId) => {
    const { count, error } = await supabase
        .from('aviso_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('membro_id', membroId)
        .eq('lido', false)
    
    if (error) throw error
    return count || 0
}

export const markAvisoAsRead = async (avisoId, membroId) => {
    const { data, error } = await supabase
        .from('aviso_notifications')
        .update({ 
            lido: true,
            data_leitura: new Date().toISOString()
        })
        .eq('aviso_id', avisoId)
        .eq('membro_id', membroId)
    
    if (error) throw error
    return data
}

export const getAvisosWithReadStatus = async (membroId) => {
    const { data, error } = await supabase
        .from('avisos')
        .select(`
            *,
            aviso_notifications!inner(lido, data_leitura)
        `)
        .eq('aviso_notifications.membro_id', membroId)
        .order('data_envio', { ascending: false })
    
    if (error) throw error
    return data
}

export const deleteAviso = async (avisoId) => {
    const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', avisoId)
    
    if (error) throw error
    // As notificações serão deletadas automaticamente devido ao ON DELETE CASCADE
}

// ========== PLAYLIST ZOE ==========

export const getPlaylistMusicas = async () => {
    const { data, error } = await supabase
        .from('playlist_zoe')
        .select('*')
        .eq('ativa', true)
        .order('ordem', { ascending: true })
    
    if (error) throw error
    return data
}

export const createPlaylistMusica = async (musicaData) => {
    const { data, error } = await supabase
        .from('playlist_zoe')
        .insert([musicaData])
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const updatePlaylistMusica = async (musicaId, updates) => {
    const { data, error } = await supabase
        .from('playlist_zoe')
        .update(updates)
        .eq('id', musicaId)
        .select()
        .single()
    
    if (error) throw error
    return data
}

export const deletePlaylistMusica = async (musicaId) => {
    const { error } = await supabase
        .from('playlist_zoe')
        .delete()
        .eq('id', musicaId)
    
    if (error) throw error
}

// ========== PEDIDOS DE ORAÇÃO ==========

export const getPrayerRequests = async () => {
    const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
}

export const createPrayerRequest = async (requestData) => {
    const { data, error } = await supabase
        .from('prayer_requests')
        .insert([requestData])
        .select()
        .single()
    
    if (error) throw error
    return data
}
