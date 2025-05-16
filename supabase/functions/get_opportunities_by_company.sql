
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
        p.name as empresa,
        COUNT(CASE WHEN o.type = 'sent' THEN 1 ELSE NULL END) as enviadas,
        COUNT(CASE WHEN o.type = 'received' THEN 1 ELSE NULL END) as recebidas
    FROM public.partners p
    LEFT JOIN (
        SELECT 
            partner_id,
            type
        FROM public.partners_opportunities
    ) o ON p.id = o.partner_id
    GROUP BY p.name
    ORDER BY p.name;
    
    -- If no results, return at least some mock data for development
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            'No Data'::text as empresa,
            0::bigint as enviadas,
            0::bigint as recebidas;
    END IF;
END;
$$;
