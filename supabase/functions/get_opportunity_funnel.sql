
CREATE OR REPLACE FUNCTION public.get_opportunity_funnel()
RETURNS TABLE (
    etapa text,
    total bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        etapa_nome.etapa,
        COUNT(o.id) as total
    FROM (
        SELECT 'Indicação' as etapa, 1 as ordem
        UNION ALL SELECT 'Contato Realizado', 2
        UNION ALL SELECT 'Proposta Enviada', 3
        UNION ALL SELECT 'Negócio Fechado', 4
    ) etapa_nome
    LEFT JOIN (
        SELECT 
            id, 
            status_id,
            CASE 
                WHEN s.nome = 'Nova' THEN 1
                WHEN s.nome = 'Em Andamento' THEN 2
                WHEN s.nome = 'Em Espera' THEN 2
                WHEN s.nome = 'Ganha' THEN 4
                WHEN s.nome = 'Perdida' THEN 3
                ELSE 1
            END as etapa_ordem
        FROM oportunidades o
        JOIN status_oportunidade s ON o.status_id = s.id
    ) o ON o.etapa_ordem = etapa_nome.ordem
    GROUP BY etapa_nome.etapa, etapa_nome.ordem
    ORDER BY etapa_nome.ordem;
END;
$$;
