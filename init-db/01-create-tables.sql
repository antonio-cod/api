-- init-db/01-create-tables.sql
-- Script de inicialização do banco de dados para desenvolvimento local

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários


-- Tabela de alunos
CREATE TABLE IF NOT EXISTS aluno (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE,
    endereco TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de aulas
CREATE TABLE IF NOT EXISTS aula (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_aula TIMESTAMP NOT NULL,
    duracao INTEGER, -- em minutos
    vagas INTEGER DEFAULT 20,
    instrutor VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricao (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    aula_id INTEGER REFERENCES aula(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ativa',
    UNIQUE(aluno_id, aula_id)
);

-- Tabela de presença
CREATE TABLE IF NOT EXISTS presenca (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    aula_id INTEGER REFERENCES aula(id) ON DELETE CASCADE,
    presente BOOLEAN DEFAULT FALSE,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    UNIQUE(aluno_id, aula_id)
);

-- Tabela de termos e condições (conteúdo)
CREATE TABLE IF NOT EXISTS termos (
    id SERIAL PRIMARY KEY,
    versao VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Rascunho' CHECK (status IN ('Ativo', 'Inativo', 'Rascunho')),
    conteudo JSONB NOT NULL,
    ativo BOOLEAN DEFAULT FALSE,
    criado_por VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ativacao TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de aceitação de termos
CREATE TABLE IF NOT EXISTS termos_condicoes (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    termo_id INTEGER REFERENCES termos(id) ON DELETE CASCADE,
    aceito BOOLEAN NOT NULL DEFAULT TRUE,
    data_aceitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    UNIQUE(aluno_id, termo_id)
);

-- Tabela de situação familiar
CREATE TABLE IF NOT EXISTS situacao_familiar (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    responsavel_criancas_0_6 VARCHAR(100),
    numero_filhos_dependentes INTEGER,
    situacao_trabalho VARCHAR(100),
    renda_familiar VARCHAR(100),
    programas_assistencia TEXT[],
    quantas_pessoas_moram INTEGER,
    quem_mora_com_voce TEXT[],
    frequenta_atividades_culturais VARCHAR(10),
    quais_atividades_culturais TEXT,
    beneficio_social VARCHAR(100),
    tem_filhos VARCHAR(10) CHECK (tem_filhos IN ('Sim', 'Não')),
    quantidade_filhos INTEGER,
    outras_pessoas_casa INTEGER,
    tipo_moradia VARCHAR(100),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aluno_id)
);

-- Tabela de avaliação de bem-estar
CREATE TABLE IF NOT EXISTS avaliacao_bem_estar (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    autoestima INTEGER CHECK (autoestima BETWEEN 1 AND 10),
    relacionamento_familiar INTEGER CHECK (relacionamento_familiar BETWEEN 1 AND 10),
    relacionamento_social INTEGER CHECK (relacionamento_social BETWEEN 1 AND 10),
    satisfacao_vida INTEGER CHECK (satisfacao_vida BETWEEN 1 AND 10),
    nivel_estresse INTEGER CHECK (nivel_estresse BETWEEN 1 AND 10),
    motivacao INTEGER CHECK (motivacao BETWEEN 1 AND 10),
    sentimento_pertencimento INTEGER CHECK (sentimento_pertencimento BETWEEN 1 AND 10),
    seguranca_emocional INTEGER CHECK (seguranca_emocional BETWEEN 1 AND 10),
    perspectiva_futuro INTEGER CHECK (perspectiva_futuro BETWEEN 1 AND 10),
    observacoes TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de barreiras de acesso
CREATE TABLE IF NOT EXISTS barreiras_acesso (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    barreira_transporte VARCHAR(10) CHECK (barreira_transporte IN ('Sim', 'Não')),
    barreira_financeira VARCHAR(10) CHECK (barreira_financeira IN ('Sim', 'Não')),
    barreira_tempo VARCHAR(10) CHECK (barreira_tempo IN ('Sim', 'Não')),
    barreira_familiar VARCHAR(10) CHECK (barreira_familiar IN ('Sim', 'Não')),
    barreira_saude VARCHAR(10) CHECK (barreira_saude IN ('Sim', 'Não')),
    barreira_tecnologica VARCHAR(10) CHECK (barreira_tecnologica IN ('Sim', 'Não')),
    outras_barreiras TEXT,
    descricao_barreiras TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aluno_id)
);

-- Tabela de expectativas e objetivos
CREATE TABLE IF NOT EXISTS expectativas_e_objetivos (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    objetivo_principal TEXT,
    expectativa_curso TEXT,
    meta_curto_prazo TEXT,
    meta_medio_prazo TEXT,
    meta_longo_prazo TEXT,
    areas_interesse TEXT[], -- Array para múltiplas áreas
    motivacao_participacao TEXT,
    resultado_esperado TEXT,
    compromisso_tempo VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aluno_id)
);

-- Tabela de histórico no projeto
CREATE TABLE IF NOT EXISTS historico_no_projeto (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    ja_participou VARCHAR(10) CHECK (ja_participou IN ('Sim', 'Não')),
    cursos_anteriores TEXT[],
    periodo_participacao VARCHAR(100),
    avaliacao_experiencia INTEGER CHECK (avaliacao_experiencia BETWEEN 1 AND 10),
    principais_ganhos TEXT,
    dificuldades_enfrentadas TEXT,
    sugestoes_melhoria TEXT,
    gostaria_continuar VARCHAR(10) CHECK (gostaria_continuar IN ('Sim', 'Não')),
    recomendaria_projeto VARCHAR(10) CHECK (recomendaria_projeto IN ('Sim', 'Não')),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aluno_id)
);

-- Tabela de perfil educacional
CREATE TABLE IF NOT EXISTS perfil_educacional (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    escolaridade VARCHAR(100),
    curso_atual VARCHAR(255),
    instituicao_ensino VARCHAR(255),
    ano_conclusao INTEGER,
    area_formacao VARCHAR(255),
    cursos_complementares TEXT[],
    habilidades_especiais TEXT[],
    idiomas TEXT[],
    nivel_tecnologia VARCHAR(50), -- Básico, Intermediário, Avançado
    tem_computador VARCHAR(10) CHECK (tem_computador IN ('Sim', 'Não')),
    tem_internet VARCHAR(10) CHECK (tem_internet IN ('Sim', 'Não')),
    qualidade_internet VARCHAR(50), -- Boa, Regular, Ruim
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aluno_id)
);

-- Tabela de responsável (para menores de idade)
CREATE TABLE IF NOT EXISTS responsavel (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    parentesco VARCHAR(50),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    profissao VARCHAR(255),
    autorizacao_imagem VARCHAR(10) CHECK (autorizacao_imagem IN ('Sim', 'Não')),
    autorizacao_participacao VARCHAR(10) CHECK (autorizacao_participacao IN ('Sim', 'Não')),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aluno_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_inscricao_aluno_id ON inscricao(aluno_id);
CREATE INDEX IF NOT EXISTS idx_inscricao_aula_id ON inscricao(aula_id);
CREATE INDEX IF NOT EXISTS idx_presenca_aluno_id ON presenca(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presenca_aula_id ON presenca(aula_id);
CREATE INDEX IF NOT EXISTS idx_termos_ativo ON termos(ativo);
CREATE INDEX IF NOT EXISTS idx_termos_condicoes_aluno_id ON termos_condicoes(aluno_id);

-- Índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_situacao_familiar_aluno_id ON situacao_familiar(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_bem_estar_aluno_id ON avaliacao_bem_estar(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_bem_estar_data ON avaliacao_bem_estar(data_avaliacao);
CREATE INDEX IF NOT EXISTS idx_barreiras_acesso_aluno_id ON barreiras_acesso(aluno_id);
CREATE INDEX IF NOT EXISTS idx_expectativas_objetivos_aluno_id ON expectativas_e_objetivos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_historico_projeto_aluno_id ON historico_no_projeto(aluno_id);
CREATE INDEX IF NOT EXISTS idx_perfil_educacional_aluno_id ON perfil_educacional(aluno_id);
CREATE INDEX IF NOT EXISTS idx_responsavel_aluno_id ON responsavel(aluno_id);

-- Inserir dados de exemplo para desenvolvimento
INSERT INTO usuario (nome, email, senha) VALUES
('Administrador', 'admin@casarao.com', '$2b$10$exemplo_hash_senha')
ON CONFLICT (email) DO NOTHING;

INSERT INTO aluno (nome, email, telefone) VALUES
('João Silva', 'joao@exemplo.com', '(11) 99999-9999'),
('Maria Santos', 'maria@exemplo.com', '(11) 88888-8888')
ON CONFLICT (email) DO NOTHING;

INSERT INTO aula (titulo, descricao, data_aula, duracao, instrutor) VALUES
('Dança Contemporânea', 'Aula de dança contemporânea para iniciantes', '2024-10-01 19:00:00', 90, 'Ana Paula'),
('Teatro Infantil', 'Oficina de teatro para crianças de 6 a 12 anos', '2024-10-02 15:00:00', 120, 'Carlos Roberto')
ON CONFLICT DO NOTHING;

-- Inserir dados de exemplo para as novas tabelas
INSERT INTO situacao_familiar (aluno_id, situacao_trabalho, renda_familiar, tem_filhos, quantidade_filhos, outras_pessoas_casa, tipo_moradia) VALUES
(1, 'Trabalho informal', 'De 1 a 2 salários mínimos', 'Sim', 2, 4, 'Casa própria'),
(2, 'Estudante', 'Até 1 salário mínimo', 'Não', 0, 3, 'Casa alugada')
ON CONFLICT (aluno_id) DO NOTHING;

INSERT INTO perfil_educacional (aluno_id, escolaridade, nivel_tecnologia, tem_computador, tem_internet, qualidade_internet) VALUES
(1, 'Ensino médio completo', 'Básico', 'Sim', 'Sim', 'Regular'),
(2, 'Superior incompleto', 'Intermediário', 'Sim', 'Sim', 'Boa')
ON CONFLICT (aluno_id) DO NOTHING;
