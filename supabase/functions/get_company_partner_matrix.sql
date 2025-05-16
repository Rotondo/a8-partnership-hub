
CREATE OR REPLACE FUNCTION public.get_company_partner_matrix()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb = '{}'::jsonb;
    empresa_record record;
    matriz jsonb;
BEGIN
    -- Para cada empresa do grupo
    FOR empresa_record IN SELECT id, nome FROM empresas_grupo
    LOOP
        matriz = '{}'::jsonb;
        
        -- Para cada parceiro externo, conta oportunidades enviadas
        FOR parceiro IN SELECT id, nome FROM parceiros_externos
        LOOP
            -- Conta oportunidades enviadas para este parceiro
            matriz = jsonb_set(
                matriz,
                ARRAY[parceiro.nome],
                (SELECT COUNT(*)::text::jsonb
                 FROM oportunidades o
                 JOIN oportunidade_parceiro_saida ops ON o.id = ops.oportunidade_id
                 WHERE o.tipo_oportunidade = 'externa_saida'
                 AND o.empresa_origem_id = empresa_record.id
                 AND ops.parceiro_externo_id = parceiro.id)
            );
        END LOOP;
        
        -- Adiciona esta empresa e suas contagens ao resultado
        result = jsonb_set(result, ARRAY[empresa_record.nome], matriz);
    END LOOP;
    
    RETURN result;
END;
$$;
