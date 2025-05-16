
CREATE OR REPLACE FUNCTION public.get_intragroup_exchange_matrix()
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
        
        -- Para cada empresa destino, conta oportunidades
        FOR target IN SELECT id, nome FROM empresas_grupo WHERE id != empresa_record.id
        LOOP
            -- Conta oportunidades de intragrupo desta origem para este destino
            matriz = jsonb_set(
                matriz,
                ARRAY[target.nome],
                (SELECT COUNT(*)::text::jsonb
                 FROM oportunidades
                 WHERE tipo_oportunidade = 'intragrupo'
                 AND empresa_origem_id = empresa_record.id
                 AND empresa_destino_id = target.id)
            );
        END LOOP;
        
        -- Adiciona esta empresa e suas contagens ao resultado
        result = jsonb_set(result, ARRAY[empresa_record.nome], matriz);
    END LOOP;
    
    RETURN result;
END;
$$;
