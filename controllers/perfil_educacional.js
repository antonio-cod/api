import { db } from "../db.js";

// Definições dos Enums baseadas no código TypeORM
export const EscolaridadeOpcoes = {
  FUNDAMENTAL_INCOMPLETO: "Ensino Fundamental incompleto",
  FUNDAMENTAL_COMPLETO: "Ensino Fundamental completo",
  MEDIO_INCOMPLETO: "Ensino Médio incompleto",
  MEDIO_COMPLETO: "Ensino Médio completo",
  SUPERIOR_INCOMPLETO: "Ensino Superior incompleto",
  SUPERIOR_COMPLETO: "Ensino Superior completo",
  POS_GRADUACAO: "Pós-graduação",
  MESTRADO: "Mestrado",
  DOUTORADO: "Doutorado",
};

export const SituacaoEscolarOpcoes = {
  MATRICULADO: "Matriculado",
  FORA_DA_ESCOLA: "Fora da escola",
  EJA: "EJA",
  CONCLUIDO: "Concluído",
  TRANCADO: "Trancado",
  TRANSFERIDO: "Transferido",
};

export const TurnoEscolarOpcoes = {
  MATUTINO: "Matutino",
  VESPERTINO: "Vespertino",
  NOTURNO: "Noturno",
  INTEGRAL: "Integral",
  NAO_SE_APLICA: "Não se aplica",
};

// Função para validar se um valor está dentro das opções permitidas
const validarEnum = (valor, opcoes, nomeEnum) => {
  const valoresPermitidos = Object.values(opcoes);
  if (!valoresPermitidos.includes(valor)) {
    throw new Error(
      `Valor inválido para ${nomeEnum}. Opções permitidas: ${valoresPermitidos.join(
        ", "
      )}`
    );
  }
  return true;
};

// Função para obter as opções dos enums (útil para o frontend)
export const getEnumOptions = (_, res) => {
  return res.status(200).json({
    escolaridade_atual: Object.values(EscolaridadeOpcoes),
    situacao_escolar: Object.values(SituacaoEscolarOpcoes),
    turno_escolar: Object.values(TurnoEscolarOpcoes),
    message:
      "Opções dos campos enum do perfil educacional obtidas com sucesso!",
  });
};

export const criarTabelaPerfilEducacional = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS perfil_educacional (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER UNIQUE NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      escolaridade_atual VARCHAR(100) NOT NULL,
      situacao_escolar VARCHAR(50) NOT NULL,
      turno_escolar VARCHAR(50),
      instituicao_atual VARCHAR(255),
      curso_atual VARCHAR(255),
      semestre_periodo_atual VARCHAR(50),
      area_interesse_profissional TEXT,
      certificacoes_profissionais TEXT,
      experiencia_profissional TEXT,
      objetivos_educacionais TEXT,
      dificuldades_aprendizagem TEXT,
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log("Erro ao criar tabela perfil_educacional", error.message);
      return;
    }
    console.log("Tabela perfil_educacional criada com sucesso.");
  });
};

export const get = (_, res) => {
  db.query("SELECT * FROM perfil_educacional", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      perfis_educacionais: data?.rows || data,
      message: "Consulta de perfis educacionais realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  db.query(
    `SELECT * FROM perfil_educacional WHERE id = ${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        perfil_educacional: data?.rows?.[0] || data[0],
        message: "Consulta de perfil educacional realizada com sucesso!",
      });
    }
  );
};

export const getByAlunoId = (req, res) => {
  db.query(
    `SELECT * FROM perfil_educacional WHERE aluno_id = ${req.params.alunoId}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        perfil_educacional: data?.rows?.[0] || data[0],
        message:
          "Consulta de perfil educacional do aluno realizada com sucesso!",
      });
    }
  );
};

export const add = (req, res) => {
  const {
    aluno_id,
    escolaridade_atual,
    situacao_escolar,
    turno_escolar,
    instituicao_atual,
    curso_atual,
    semestre_periodo_atual,
    area_interesse_profissional,
    certificacoes_profissionais,
    experiencia_profissional,
    objetivos_educacionais,
    dificuldades_aprendizagem,
    observacoes,
  } = req.body;

  // Validações dos campos enum obrigatórios
  try {
    validarEnum(escolaridade_atual, EscolaridadeOpcoes, "escolaridade_atual");
    validarEnum(situacao_escolar, SituacaoEscolarOpcoes, "situacao_escolar");

    // turno_escolar é opcional, mas se fornecido deve ser válido
    if (turno_escolar) {
      validarEnum(turno_escolar, TurnoEscolarOpcoes, "turno_escolar");
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `INSERT INTO perfil_educacional (
    aluno_id,
    escolaridade_atual,
    situacao_escolar,
    turno_escolar,
    instituicao_atual,
    curso_atual,
    semestre_periodo_atual,
    area_interesse_profissional,
    certificacoes_profissionais,
    experiencia_profissional,
    objetivos_educacionais,
    dificuldades_aprendizagem,
    observacoes
  ) VALUES (
    ${aluno_id},
    '${escolaridade_atual}',
    '${situacao_escolar}',
    ${turno_escolar ? `'${turno_escolar}'` : "NULL"},
    ${instituicao_atual ? `'${instituicao_atual}'` : "NULL"},
    ${curso_atual ? `'${curso_atual}'` : "NULL"},
    ${semestre_periodo_atual ? `'${semestre_periodo_atual}'` : "NULL"},
    ${
      area_interesse_profissional ? `'${area_interesse_profissional}'` : "NULL"
    },
    ${
      certificacoes_profissionais ? `'${certificacoes_profissionais}'` : "NULL"
    },
    ${experiencia_profissional ? `'${experiencia_profissional}'` : "NULL"},
    ${objetivos_educacionais ? `'${objetivos_educacionais}'` : "NULL"},
    ${dificuldades_aprendizagem ? `'${dificuldades_aprendizagem}'` : "NULL"},
    ${observacoes ? `'${observacoes}'` : "NULL"}
  );`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      perfil_educacional: null,
      message: "Perfil educacional criado com sucesso!",
    });
  });
};

export const update = (req, res) => {
  const {
    escolaridade_atual,
    situacao_escolar,
    turno_escolar,
    instituicao_atual,
    curso_atual,
    semestre_periodo_atual,
    area_interesse_profissional,
    certificacoes_profissionais,
    experiencia_profissional,
    objetivos_educacionais,
    dificuldades_aprendizagem,
    observacoes,
  } = req.body;

  // Validações dos campos enum obrigatórios
  try {
    validarEnum(escolaridade_atual, EscolaridadeOpcoes, "escolaridade_atual");
    validarEnum(situacao_escolar, SituacaoEscolarOpcoes, "situacao_escolar");

    // turno_escolar é opcional, mas se fornecido deve ser válido
    if (turno_escolar) {
      validarEnum(turno_escolar, TurnoEscolarOpcoes, "turno_escolar");
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `UPDATE perfil_educacional SET
    escolaridade_atual='${escolaridade_atual}',
    situacao_escolar='${situacao_escolar}',
    turno_escolar=${turno_escolar ? `'${turno_escolar}'` : "NULL"},
    instituicao_atual=${instituicao_atual ? `'${instituicao_atual}'` : "NULL"},
    curso_atual=${curso_atual ? `'${curso_atual}'` : "NULL"},
    semestre_periodo_atual=${
      semestre_periodo_atual ? `'${semestre_periodo_atual}'` : "NULL"
    },
    area_interesse_profissional=${
      area_interesse_profissional ? `'${area_interesse_profissional}'` : "NULL"
    },
    certificacoes_profissionais=${
      certificacoes_profissionais ? `'${certificacoes_profissionais}'` : "NULL"
    },
    experiencia_profissional=${
      experiencia_profissional ? `'${experiencia_profissional}'` : "NULL"
    },
    objetivos_educacionais=${
      objetivos_educacionais ? `'${objetivos_educacionais}'` : "NULL"
    },
    dificuldades_aprendizagem=${
      dificuldades_aprendizagem ? `'${dificuldades_aprendizagem}'` : "NULL"
    },
    observacoes=${observacoes ? `'${observacoes}'` : "NULL"},
    updated_at=CURRENT_TIMESTAMP
  WHERE id = ${req.params.id}`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      perfil_educacional: null,
      message: "Perfil educacional atualizado com sucesso!",
    });
  });
};

export const delet = (req, res) => {
  db.query(
    `DELETE FROM perfil_educacional WHERE id = ${req.params.id}`,
    (err) => {
      if (err) return res.json(err);
      return res.status(200).json({
        perfil_educacional: null,
        message: "Perfil educacional deletado com sucesso!",
      });
    }
  );
};

// Função para criar perfil educacional junto com o cadastro do aluno
export const createWithAluno = (alunoId, perfilEducacionalData, callback) => {
  const {
    escolaridade_atual,
    situacao_escolar,
    turno_escolar,
    instituicao_atual,
    curso_atual,
    semestre_periodo_atual,
    area_interesse_profissional,
    certificacoes_profissionais,
    experiencia_profissional,
    objetivos_educacionais,
    dificuldades_aprendizagem,
    observacoes,
  } = perfilEducacionalData;

  // Validações dos campos enum obrigatórios
  try {
    validarEnum(escolaridade_atual, EscolaridadeOpcoes, "escolaridade_atual");
    validarEnum(situacao_escolar, SituacaoEscolarOpcoes, "situacao_escolar");

    // turno_escolar é opcional, mas se fornecido deve ser válido
    if (turno_escolar) {
      validarEnum(turno_escolar, TurnoEscolarOpcoes, "turno_escolar");
    }
  } catch (error) {
    return callback(error);
  }

  const q = `INSERT INTO perfil_educacional (
    aluno_id,
    escolaridade_atual,
    situacao_escolar,
    turno_escolar,
    instituicao_atual,
    curso_atual,
    semestre_periodo_atual,
    area_interesse_profissional,
    certificacoes_profissionais,
    experiencia_profissional,
    objetivos_educacionais,
    dificuldades_aprendizagem,
    observacoes
  ) VALUES (
    ${alunoId},
    '${escolaridade_atual}',
    '${situacao_escolar}',
    ${turno_escolar ? `'${turno_escolar}'` : "NULL"},
    ${instituicao_atual ? `'${instituicao_atual}'` : "NULL"},
    ${curso_atual ? `'${curso_atual}'` : "NULL"},
    ${semestre_periodo_atual ? `'${semestre_periodo_atual}'` : "NULL"},
    ${
      area_interesse_profissional ? `'${area_interesse_profissional}'` : "NULL"
    },
    ${
      certificacoes_profissionais ? `'${certificacoes_profissionais}'` : "NULL"
    },
    ${experiencia_profissional ? `'${experiencia_profissional}'` : "NULL"},
    ${objetivos_educacionais ? `'${objetivos_educacionais}'` : "NULL"},
    ${dificuldades_aprendizagem ? `'${dificuldades_aprendizagem}'` : "NULL"},
    ${observacoes ? `'${observacoes}'` : "NULL"}
  );`;

  db.query(q, callback);
};
