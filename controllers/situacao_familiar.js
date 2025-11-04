import { db } from "../db.js";

// Definições dos Enums baseadas no código TypeORM
export const SimNaoOpcoes = {
  SIM: "Sim",
  NAO: "Não",
};

export const SituacaoTrabalhoOpcoes = {
  DESEMPREGADO: "Desempregado(a)",
  TRABALHO_INFORMAL: "Trabalho informal",
  TRABALHO_FORMAL: "Trabalho formal",
  ESTUDANTE: "Estudante",
  OUTRO: "Outro",
};

export const RendaFamiliarOpcoes = {
  ATE_1_SALARIO: "Até 1 salário mínimo",
  DE_1_A_2_SALARIOS: "De 1 a 2 salários mínimos",
  DE_2_A_3_SALARIOS: "De 2 a 3 salários mínimos",
  DE_3_A_5_SALARIOS: "De 3 a 5 salários mínimos",
  ACIMA_5_SALARIOS: "Acima de 5 salários mínimos",
  PREFIRO_NAO_INFORMAR: "Prefiro não informar",
};

export const ProgramasAssistenciaOpcoes = {
  BOLSA_FAMILIA: "Bolsa Família",
  AUXILIO_BRASIL: "Auxílio Brasil",
  MINHA_CASA_MINHA_VIDA: "Minha Casa Minha Vida",
  NENHUM: "Nenhum",
  OUTROS: "Outros",
};

export const QuemMoraComVoceOpcoes = {
  PAI: "Pai",
  MAE: "Mãe",
  MADRASTA: "Madrasta",
  PADRASTO: "Padrasto",
  AVOS: "Avós",
  IRMAOS: "Irmãos",
  FILHOS: "Filhos",
  OUTROS: "Outros",
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

// Função para validar arrays de enum
const validarArrayEnum = (array, opcoes, nomeEnum) => {
  if (!Array.isArray(array)) {
    throw new Error(`${nomeEnum} deve ser um array`);
  }

  const valoresPermitidos = Object.values(opcoes);
  for (const valor of array) {
    if (!valoresPermitidos.includes(valor)) {
      throw new Error(
        `Valor inválido para ${nomeEnum}: ${valor}. Opções permitidas: ${valoresPermitidos.join(
          ", "
        )}`
      );
    }
  }
  return true;
};

// Função para obter as opções dos enums (útil para o frontend)
export const getEnumOptions = (_, res) => {
  return res.status(200).json({
    responsavel_criancas_0_6: Object.values(SimNaoOpcoes),
    situacao_trabalho: Object.values(SituacaoTrabalhoOpcoes),
    renda_familiar: Object.values(RendaFamiliarOpcoes),
    programas_assistencia: Object.values(ProgramasAssistenciaOpcoes),
    quem_mora_com_voce: Object.values(QuemMoraComVoceOpcoes),
    frequenta_atividades_culturais: Object.values(SimNaoOpcoes),
    message: "Opções dos campos enum da situação familiar obtidas com sucesso!",
  });
};

export const criarTabelaSituacaoFamiliar = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS situacao_familiar (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER UNIQUE NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      responsavel_criancas_0_6 VARCHAR(50) NOT NULL,
      numero_filhos_dependentes INTEGER DEFAULT 0,
      situacao_trabalho VARCHAR(50) NOT NULL,
      renda_familiar VARCHAR(50) NOT NULL,
      programas_assistencia TEXT[] DEFAULT '{}',
      quantas_pessoas_moram INTEGER DEFAULT 1,
      quem_mora_com_voce TEXT[] DEFAULT '{}',
      frequenta_atividades_culturais VARCHAR(50) NOT NULL,
      quais_atividades_culturais TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log("Erro ao criar tabela situacao_familiar", error.message);
      return;
    }
    console.log("Tabela situacao_familiar criada com sucesso.");
  });
};

export const get = (_, res) => {
  db.query("SELECT * FROM situacao_familiar", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      situacoes_familiares: data?.rows || data,
      message: "Consulta de situações familiares realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  db.query(
    `SELECT * FROM situacao_familiar WHERE id = ${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        situacao_familiar: data?.rows?.[0] || data[0],
        message: "Consulta de situação familiar realizada com sucesso!",
      });
    }
  );
};

export const getByAlunoId = (req, res) => {
  db.query(
    `SELECT * FROM situacao_familiar WHERE aluno_id = ${req.params.alunoId}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        situacao_familiar: data?.rows?.[0] || data[0],
        message:
          "Consulta de situação familiar do aluno realizada com sucesso!",
      });
    }
  );
};

export const add = (req, res) => {
  const {
    aluno_id,
    responsavel_criancas_0_6,
    numero_filhos_dependentes,
    situacao_trabalho,
    renda_familiar,
    programas_assistencia,
    quantas_pessoas_moram,
    quem_mora_com_voce,
    frequenta_atividades_culturais,
    quais_atividades_culturais,
  } = req.body;

  // Validações dos campos enum
  try {
    validarEnum(
      responsavel_criancas_0_6,
      SimNaoOpcoes,
      "responsavel_criancas_0_6"
    );
    validarEnum(situacao_trabalho, SituacaoTrabalhoOpcoes, "situacao_trabalho");
    validarEnum(renda_familiar, RendaFamiliarOpcoes, "renda_familiar");
    validarEnum(
      frequenta_atividades_culturais,
      SimNaoOpcoes,
      "frequenta_atividades_culturais"
    );

    if (programas_assistencia && programas_assistencia.length > 0) {
      validarArrayEnum(
        programas_assistencia,
        ProgramasAssistenciaOpcoes,
        "programas_assistencia"
      );
    }

    if (quem_mora_com_voce && quem_mora_com_voce.length > 0) {
      validarArrayEnum(
        quem_mora_com_voce,
        QuemMoraComVoceOpcoes,
        "quem_mora_com_voce"
      );
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `INSERT INTO situacao_familiar (
    aluno_id,
    responsavel_criancas_0_6,
    numero_filhos_dependentes,
    situacao_trabalho,
    renda_familiar,
    programas_assistencia,
    quantas_pessoas_moram,
    quem_mora_com_voce,
    frequenta_atividades_culturais,
    quais_atividades_culturais
  ) VALUES (
    ${aluno_id},
    '${responsavel_criancas_0_6}',
    ${numero_filhos_dependentes || 0},
    '${situacao_trabalho}',
    '${renda_familiar}',
    '{${
      Array.isArray(programas_assistencia)
        ? programas_assistencia.join(",")
        : ""
    }}',
    ${quantas_pessoas_moram || 1},
    '{${
      Array.isArray(quem_mora_com_voce) ? quem_mora_com_voce.join(",") : ""
    }}',
    '${frequenta_atividades_culturais}',
    ${quais_atividades_culturais ? `'${quais_atividades_culturais}'` : "NULL"}
  );`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      situacao_familiar: null,
      message: "Situação familiar criada com sucesso!",
    });
  });
};

export const update = (req, res) => {
  const {
    responsavel_criancas_0_6,
    numero_filhos_dependentes,
    situacao_trabalho,
    renda_familiar,
    programas_assistencia,
    quantas_pessoas_moram,
    quem_mora_com_voce,
    frequenta_atividades_culturais,
    quais_atividades_culturais,
  } = req.body;

  // Validações dos campos enum
  try {
    validarEnum(
      responsavel_criancas_0_6,
      SimNaoOpcoes,
      "responsavel_criancas_0_6"
    );
    validarEnum(situacao_trabalho, SituacaoTrabalhoOpcoes, "situacao_trabalho");
    validarEnum(renda_familiar, RendaFamiliarOpcoes, "renda_familiar");
    validarEnum(
      frequenta_atividades_culturais,
      SimNaoOpcoes,
      "frequenta_atividades_culturais"
    );

    if (programas_assistencia && programas_assistencia.length > 0) {
      validarArrayEnum(
        programas_assistencia,
        ProgramasAssistenciaOpcoes,
        "programas_assistencia"
      );
    }

    if (quem_mora_com_voce && quem_mora_com_voce.length > 0) {
      validarArrayEnum(
        quem_mora_com_voce,
        QuemMoraComVoceOpcoes,
        "quem_mora_com_voce"
      );
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `UPDATE situacao_familiar SET
    responsavel_criancas_0_6='${responsavel_criancas_0_6}',
    numero_filhos_dependentes=${numero_filhos_dependentes || 0},
    situacao_trabalho='${situacao_trabalho}',
    renda_familiar='${renda_familiar}',
    programas_assistencia='{${
      Array.isArray(programas_assistencia)
        ? programas_assistencia.join(",")
        : ""
    }}',
    quantas_pessoas_moram=${quantas_pessoas_moram || 1},
    quem_mora_com_voce='{${
      Array.isArray(quem_mora_com_voce) ? quem_mora_com_voce.join(",") : ""
    }}',
    frequenta_atividades_culturais='${frequenta_atividades_culturais}',
    quais_atividades_culturais=${
      quais_atividades_culturais ? `'${quais_atividades_culturais}'` : "NULL"
    },
    updated_at=CURRENT_TIMESTAMP
  WHERE id = ${req.params.id}`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      situacao_familiar: null,
      message: "Situação familiar atualizada com sucesso!",
    });
  });
};

export const delet = (req, res) => {
  db.query(
    `DELETE FROM situacao_familiar WHERE id = ${req.params.id}`,
    (err) => {
      if (err) return res.json(err);
      return res.status(200).json({
        situacao_familiar: null,
        message: "Situação familiar deletada com sucesso!",
      });
    }
  );
};

// Função para criar situação familiar junto com o cadastro do aluno
export const createWithAluno = (alunoId, situacaoFamiliarData, callback) => {
  const {
    responsavel_criancas_0_6,
    numero_filhos_dependentes,
    situacao_trabalho,
    renda_familiar,
    programas_assistencia,
    quantas_pessoas_moram,
    quem_mora_com_voce,
    frequenta_atividades_culturais,
    quais_atividades_culturais,
  } = situacaoFamiliarData;

  // Validações dos campos enum
  try {
    validarEnum(
      responsavel_criancas_0_6,
      SimNaoOpcoes,
      "responsavel_criancas_0_6"
    );
    validarEnum(situacao_trabalho, SituacaoTrabalhoOpcoes, "situacao_trabalho");
    validarEnum(renda_familiar, RendaFamiliarOpcoes, "renda_familiar");
    validarEnum(
      frequenta_atividades_culturais,
      SimNaoOpcoes,
      "frequenta_atividades_culturais"
    );

    if (programas_assistencia && programas_assistencia.length > 0) {
      validarArrayEnum(
        programas_assistencia,
        ProgramasAssistenciaOpcoes,
        "programas_assistencia"
      );
    }

    if (quem_mora_com_voce && quem_mora_com_voce.length > 0) {
      validarArrayEnum(
        quem_mora_com_voce,
        QuemMoraComVoceOpcoes,
        "quem_mora_com_voce"
      );
    }
  } catch (error) {
    return callback(error);
  }

  const q = `INSERT INTO situacao_familiar (
    aluno_id,
    responsavel_criancas_0_6,
    numero_filhos_dependentes,
    situacao_trabalho,
    renda_familiar,
    programas_assistencia,
    quantas_pessoas_moram,
    quem_mora_com_voce,
    frequenta_atividades_culturais,
    quais_atividades_culturais
  ) VALUES (
    ${alunoId},
    '${responsavel_criancas_0_6}',
    ${numero_filhos_dependentes || 0},
    '${situacao_trabalho}',
    '${renda_familiar}',
    '{${
      Array.isArray(programas_assistencia)
        ? programas_assistencia.join(",")
        : ""
    }}',
    ${quantas_pessoas_moram || 1},
    '{${
      Array.isArray(quem_mora_com_voce) ? quem_mora_com_voce.join(",") : ""
    }}',
    '${frequenta_atividades_culturais}',
    ${quais_atividades_culturais ? `'${quais_atividades_culturais}'` : "NULL"}
  );`;

  db.query(q, callback);
};
