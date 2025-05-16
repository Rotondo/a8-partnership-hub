
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
    WITH enviadas AS (
        SELECT 
            e.nome as empresa,
            COUNT(o.id) as total
        FROM empresas_grupo e
        LEFT JOIN oportunidades o ON e.id = o.empresa_origem_id
        WHERE o.tipo_oportunidade IN ('intragrupo', 'externa_saida') OR o.id IS NULL
        GROUP BY e.nome
    ),
    recebidas AS (
        SELECT 
            e.nome as empresa,
            COUNT(o.id) as total
        FROM empresas_grupo e
        LEFT JOIN oportunidades o ON e.id = o.empresa_destino_id
        WHERE o.tipo_oportunidade = 'intragrupo' OR o.id IS NULL
        GROUP BY e.nome
    )
    SELECT 
        e.empresa,
        COALESCE(e.total, 0) as enviadas,
        COALESCE(r.total, 0) as recebidas
    FROM enviadas e
    LEFT JOIN recebidas r ON e.empresa = r.empresa
    ORDER BY e.empresa;
END;
$$;
