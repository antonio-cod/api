-- Script para adicionar colunas faltantes na tabela barreiras_acesso
-- Baseado nos campos utilizados no controller aluno.js

-- Adicionar colunas que estão faltantes na tabela barreiras_acesso
ALTER TABLE barreiras_acesso ADD COLUMN IF NOT EXISTS meio_transporte VARCHAR(100);
ALTER TABLE barreiras_acesso ADD COLUMN IF NOT EXISTS tempo_deslocamento VARCHAR(50);
ALTER TABLE barreiras_acesso ADD COLUMN IF NOT EXISTS principais_dificuldades TEXT[];

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_barreiras_acesso_meio_transporte ON barreiras_acesso(meio_transporte);
CREATE INDEX IF NOT EXISTS idx_barreiras_acesso_tempo_deslocamento ON barreiras_acesso(tempo_deslocamento);

-- Comentários explicativos
COMMENT ON COLUMN barreiras_acesso.meio_transporte IS 'Meio de transporte utilizado pelo aluno';
COMMENT ON COLUMN barreiras_acesso.tempo_deslocamento IS 'Tempo de deslocamento até o local das atividades';
COMMENT ON COLUMN barreiras_acesso.principais_dificuldades IS 'Principais dificuldades de acesso (array)';
