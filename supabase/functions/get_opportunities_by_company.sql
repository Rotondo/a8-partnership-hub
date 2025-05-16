
CREATE OR REPLACE FUNCTION public.get_opportunities_by_company()
RETURNS TABLE (
    empresa text,
    enviadas bigint,
    recebidas bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.nome as empresa,
        COALESCE(env.total, 0) as enviadas,
        COALESCE(rec.total, 0) as recebidas
    FROM public.partners e
    LEFT JOIN (
        SELECT 
            e.name as empresa,
            COUNT(o.id) as total
        FROM public.partners e
        LEFT JOIN public.partners o ON e.id = o.id
        GROUP BY e.name
    ) env ON e.nome = env.empresa
    LEFT JOIN (
        SELECT 
            e.name as empresa,
            COUNT(o.id) as total
        FROM public.partners e
        LEFT JOIN public.partners o ON e.id = o.id
        GROUP BY e.name
    ) rec ON e.nome = rec.empresa
    ORDER BY e.nome;
END;
$$;
