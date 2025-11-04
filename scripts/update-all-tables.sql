-- Script completo para atualizar TODAS as tabelas com os campos utilizados nos controllers
-- Gerado automaticamente baseado na análise de todos os controllers

-- ============================================================================
-- TABELA: aluno
-- ============================================================================
-- Campos utilizados no controller: nome, email, telefone, matricula, qr_code,
-- idade, blusa, calca, calcado, sexo, identidade_genero, raca, cpf, rg,
-- data_nascimento, endereco, responsavel_id

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

-- ============================================================================
-- TABELA: situacao_familiar
-- ============================================================================
-- Campos utilizados no controller: aluno_id, responsavel_criancas_0_6,
-- numero_filhos_dependentes, situacao_trabalho, renda_familiar,
-- programas_assistencia, quantas_pessoas_moram, quem_mora_com_voce,
-- frequenta_atividades_culturais, quais_atividades_culturais

-- Estas colunas já foram adicionadas anteriormente, mantendo para completude:
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS responsavel_criancas_0_6 VARCHAR(10) CHECK (responsavel_criancas_0_6 IN ('Sim', 'Não'));
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS numero_filhos_dependentes INTEGER DEFAULT 0;
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS situacao_trabalho VARCHAR(100);
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS renda_familiar VARCHAR(100);
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS programas_assistencia TEXT[];
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS quantas_pessoas_moram INTEGER DEFAULT 1;
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS quem_mora_com_voce TEXT[];
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS frequenta_atividades_culturais VARCHAR(10) CHECK (frequenta_atividades_culturais IN ('Sim', 'Não'));
ALTER TABLE situacao_familiar ADD COLUMN IF NOT EXISTS quais_atividades_culturais TEXT;

-- ============================================================================
-- TABELA: perfil_educacional
-- ============================================================================
-- Campos utilizados no controller: aluno_id, escolaridade_atual, situacao_escolar,
-- turno_escolar, instituicao_atual, curso_atual, semestre_periodo_atual,
-- area_interesse_profissional, certificacoes_profissionais,
-- experiencia_profissional, objetivos_educacionais, dificuldades_aprendizagem, observacoes

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

-- ============================================================================
-- TABELA: barreiras_acesso
-- ============================================================================
-- Campos utilizados no controller: aluno_id, meio_transporte, tempo_deslocamento, principais_dificuldades

ALTER TABLE barreiras_acesso ADD COLUMN IF NOT EXISTS meio_transporte VARCHAR(100);
ALTER TABLE barreiras_acesso ADD COLUMN IF NOT EXISTS tempo_deslocamento VARCHAR(50);
ALTER TABLE barreiras_acesso ADD COLUMN IF NOT EXISTS principais_dificuldades TEXT[];

-- ============================================================================
-- TABELA: expectativas_e_objetivos
-- ============================================================================
-- Campos utilizados no controller: aluno_id, expectativas_projeto,
-- ja_participou_atividades_culturais, quais_atividades_culturais, motivo_participacao

ALTER TABLE expectativas_e_objetivos ADD COLUMN IF NOT EXISTS expectativas_projeto TEXT;
ALTER TABLE expectativas_e_objetivos ADD COLUMN IF NOT EXISTS ja_participou_atividades_culturais VARCHAR(10) CHECK (ja_participou_atividades_culturais IN ('Sim', 'Não'));
ALTER TABLE expectativas_e_objetivos ADD COLUMN IF NOT EXISTS quais_atividades_culturais TEXT;
ALTER TABLE expectativas_e_objetivos ADD COLUMN IF NOT EXISTS motivo_participacao TEXT;

-- ============================================================================
-- TABELA: avaliacao_bem_estar
-- ============================================================================
-- Campos utilizados no controller: aluno_id, autoestima_atual, satisfacao_vida,
-- possui_rede_apoio, deseja_fortalecer_vinculos

ALTER TABLE avaliacao_bem_estar ADD COLUMN IF NOT EXISTS autoestima_atual INTEGER CHECK (autoestima_atual >= 1 AND autoestima_atual <= 10);
ALTER TABLE avaliacao_bem_estar ADD COLUMN IF NOT EXISTS satisfacao_vida INTEGER CHECK (satisfacao_vida >= 1 AND satisfacao_vida <= 10);
ALTER TABLE avaliacao_bem_estar ADD COLUMN IF NOT EXISTS possui_rede_apoio VARCHAR(10) CHECK (possui_rede_apoio IN ('Sim', 'Não'));
ALTER TABLE avaliacao_bem_estar ADD COLUMN IF NOT EXISTS deseja_fortalecer_vinculos VARCHAR(10) CHECK (deseja_fortalecer_vinculos IN ('Sim', 'Não'));

-- ============================================================================
-- TABELA: historico_no_projeto
-- ============================================================================
-- Campos utilizados no controller: aluno_id, ja_fez_aulas_antes, atualmente_faz_aulas,
-- tempo_participacao, participou_outras_acoes

ALTER TABLE historico_no_projeto ADD COLUMN IF NOT EXISTS ja_fez_aulas_antes VARCHAR(10) CHECK (ja_fez_aulas_antes IN ('Sim', 'Não'));
ALTER TABLE historico_no_projeto ADD COLUMN IF NOT EXISTS atualmente_faz_aulas VARCHAR(10) CHECK (atualmente_faz_aulas IN ('Sim', 'Não'));
ALTER TABLE historico_no_projeto ADD COLUMN IF NOT EXISTS tempo_participacao VARCHAR(100);
ALTER TABLE historico_no_projeto ADD COLUMN IF NOT EXISTS participou_outras_acoes TEXT;

-- ============================================================================
-- TABELA: responsavel (referenciada como responsaveis no controller)
-- ============================================================================
-- Verificar se a tabela existe com o nome correto e criar se necessário
CREATE TABLE IF NOT EXISTS responsaveis (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    nome_social VARCHAR(255),
    data_nascimento DATE,
    idade INTEGER,
    genero VARCHAR(50),
    sexo VARCHAR(20),
    raca_cor VARCHAR(50),
    orientacao_sexual VARCHAR(50),
    possui_deficiencia_neurodivergencia VARCHAR(10) CHECK (possui_deficiencia_neurodivergencia IN ('Sim', 'Não')),
    qual_deficiencia TEXT,
    condicao_medica TEXT,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    endereco_completo TEXT,
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    situacao_atual VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================================================

-- Índices para tabela aluno
CREATE INDEX IF NOT EXISTS idx_aluno_matricula ON aluno(matricula);
CREATE INDEX IF NOT EXISTS idx_aluno_cpf ON aluno(cpf);
CREATE INDEX IF NOT EXISTS idx_aluno_rg ON aluno(rg);
CREATE INDEX IF NOT EXISTS idx_aluno_responsavel_id ON aluno(responsavel_id);

-- Índices para tabela situacao_familiar
CREATE INDEX IF NOT EXISTS idx_situacao_familiar_situacao_trabalho ON situacao_familiar(situacao_trabalho);
CREATE INDEX IF NOT EXISTS idx_situacao_familiar_renda_familiar ON situacao_familiar(renda_familiar);

-- Índices para tabela perfil_educacional
CREATE INDEX IF NOT EXISTS idx_perfil_educacional_escolaridade_atual ON perfil_educacional(escolaridade_atual);
CREATE INDEX IF NOT EXISTS idx_perfil_educacional_situacao_escolar ON perfil_educacional(situacao_escolar);
CREATE INDEX IF NOT EXISTS idx_perfil_educacional_turno_escolar ON perfil_educacional(turno_escolar);

-- Índices para tabela barreiras_acesso
CREATE INDEX IF NOT EXISTS idx_barreiras_acesso_meio_transporte ON barreiras_acesso(meio_transporte);
CREATE INDEX IF NOT EXISTS idx_barreiras_acesso_tempo_deslocamento ON barreiras_acesso(tempo_deslocamento);

-- Índices para tabela avaliacao_bem_estar
CREATE INDEX IF NOT EXISTS idx_avaliacao_bem_estar_autoestima ON avaliacao_bem_estar(autoestima_atual);
CREATE INDEX IF NOT EXISTS idx_avaliacao_bem_estar_satisfacao ON avaliacao_bem_estar(satisfacao_vida);

-- Índices para tabela responsaveis
CREATE INDEX IF NOT EXISTS idx_responsaveis_cpf ON responsaveis(cpf);
CREATE INDEX IF NOT EXISTS idx_responsaveis_email ON responsaveis(email);
CREATE INDEX IF NOT EXISTS idx_responsaveis_situacao_atual ON responsaveis(situacao_atual);

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE responsaveis IS 'Tabela de responsáveis pelos alunos menores de idade';
COMMENT ON COLUMN aluno.matricula IS 'Matrícula única do aluno';
COMMENT ON COLUMN aluno.qr_code IS 'Código QR para identificação rápida';
COMMENT ON COLUMN perfil_educacional.escolaridade_atual IS 'Nível de escolaridade atual do aluno';
COMMENT ON COLUMN barreiras_acesso.meio_transporte IS 'Meio de transporte utilizado pelo aluno';
COMMENT ON COLUMN avaliacao_bem_estar.autoestima_atual IS 'Autoestima atual do aluno (escala 1-10)';
COMMENT ON COLUMN historico_no_projeto.ja_fez_aulas_antes IS 'Se o aluno já participou de aulas antes';
