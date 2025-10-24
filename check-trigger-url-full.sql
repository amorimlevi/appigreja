-- Ver apenas a parte da URL do trigger
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE proname IN ('notify_new_aviso', 'notify_new_evento', 'notify_new_escala')
ORDER BY proname;
