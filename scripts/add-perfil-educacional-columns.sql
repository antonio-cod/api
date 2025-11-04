-- Script para adicionar colunas faltantes na tabela perfil_educacional
-- Baseado nos campos utilizados no controller aluno.js

-- Adicionar colunas que estão faltantes na tabela perfil_educacional
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS escolaridade_atual VARCHAR(100);
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS situacao_escolar VARCHAR(100);
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS turno_escolar VARCHAR(50);
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS instituicao_atual VARCHAR(255);
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS semestre_periodo_atual VARCHAR(50);
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS area_interesse_profissional TEXT[];
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS certificacoes_profissionais TEXT[];
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS experiencia_profissional TEXT;
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS objetivos_educacionais TEXT;
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS dificuldades_aprendizagem TEXT[];
ALTER TABLE perfil_educacional ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_perfil_educacional_escolaridade_atual ON perfil_educacional(escolaridade_atual);
CREATE INDEX IF NOT EXISTS idx_perfil_educacional_situacao_escolar ON perfil_educacional(situacao_escolar);
CREATE INDEX IF NOT EXISTS idx_perfil_educacional_turno_escolar ON perfil_educacional(turno_escolar);

-- Comentários explicativos
COMMENT ON COLUMN perfil_educacional.escolaridade_atual IS 'Nível de escolaridade atual do aluno';
COMMENT ON COLUMN perfil_educacional.situacao_escolar IS 'Situação escolar atual (estudando, formado, etc.)';
COMMENT ON COLUMN perfil_educacional.turno_escolar IS 'Turno de estudo (manhã, tarde, noite, integral)';
COMMENT ON COLUMN perfil_educacional.instituicao_atual IS 'Instituição de ensino atual';
COMMENT ON COLUMN perfil_educacional.semestre_periodo_atual IS 'Semestre ou período atual';
COMMENT ON COLUMN perfil_educacional.area_interesse_profissional IS 'Áreas de interesse profissional (array)';
COMMENT ON COLUMN perfil_educacional.certificacoes_profissionais IS 'Certificações profissionais (array)';
COMMENT ON COLUMN perfil_educacional.experiencia_profissional IS 'Experiência profissional do aluno';
COMMENT ON COLUMN perfil_educacional.objetivos_educacionais IS 'Objetivos educacionais do aluno';
COMMENT ON COLUMN perfil_educacional.dificuldades_aprendizagem IS 'Dificuldades de aprendizagem (array)';
COMMENT ON COLUMN perfil_educacional.observacoes IS 'Observações gerais sobre o perfil educacional';
