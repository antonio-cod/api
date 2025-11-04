-- Script para adicionar colunas faltantes na tabela aluno
-- Baseado nos campos utilizados no controller aluno.js

-- Adicionar colunas que estão faltando na tabela aluno
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS matricula VARCHAR(50) UNIQUE;
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS qr_code VARCHAR(100);
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS idade VARCHAR(10) DEFAULT '0';
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS blusa VARCHAR(50);
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS calca VARCHAR(50);
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS calcado VARCHAR(50);
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS sexo VARCHAR(20);
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS identidade_genero TEXT[];
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS raca VARCHAR(50);
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE;
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS responsavel_id INTEGER;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_aluno_matricula ON aluno(matricula);
CREATE INDEX IF NOT EXISTS idx_aluno_cpf ON aluno(cpf);
CREATE INDEX IF NOT EXISTS idx_aluno_rg ON aluno(rg);
CREATE INDEX IF NOT EXISTS idx_aluno_responsavel_id ON aluno(responsavel_id);

-- Comentários explicativos
COMMENT ON COLUMN aluno.matricula IS 'Matrícula única do aluno';
COMMENT ON COLUMN aluno.qr_code IS 'Código QR para identificação rápida';
COMMENT ON COLUMN aluno.idade IS 'Idade do aluno (armazenada como string)';
COMMENT ON COLUMN aluno.blusa IS 'Tamanho da blusa';
COMMENT ON COLUMN aluno.calca IS 'Tamanho da calça';
COMMENT ON COLUMN aluno.calcado IS 'Tamanho do calçado';
COMMENT ON COLUMN aluno.sexo IS 'Sexo do aluno';
COMMENT ON COLUMN aluno.identidade_genero IS 'Identidade de gênero (array)';
COMMENT ON COLUMN aluno.raca IS 'Raça/etnia do aluno';
COMMENT ON COLUMN aluno.cpf IS 'CPF único do aluno';
COMMENT ON COLUMN aluno.rg IS 'RG do aluno';
COMMENT ON COLUMN aluno.responsavel_id IS 'ID do responsável (referência externa)';
