import { db } from "../db.js";

// Definições dos Enums baseadas nos dados especificados
export const SimNaoOpcoes = {
  SIM: "Sim",
  NAO: "Não",
};

export const MotivoParticipacaoOpcoes = {
  INDICACAO: "Indicação",
  REDES_SOCIAIS: "Redes sociais",
  INTERESSE_PESSOAL: "Interesse pessoal",
  OUTRO: "Outro",
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
    ja_participou_atividades_culturais: Object.values(SimNaoOpcoes),
    motivo_participacao: Object.values(MotivoParticipacaoOpcoes),
    message:
      "Opções dos campos enum das expectativas e objetivos obtidas com sucesso!",
  });
};

export const criarTabelaExpectativasObjetivos = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS expectativas_e_objetivos (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER UNIQUE NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      expectativas_projeto TEXT,
      ja_participou_atividades_culturais VARCHAR(10),
      quais_atividades_culturais TEXT,
      motivo_participacao VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log(
        "Erro ao criar tabela expectativas_e_objetivos",
        error.message
      );
      return;
    }
    console.log("Tabela expectativas_e_objetivos criada com sucesso.");
  });
};

export const get = (_, res) => {
  db.query("SELECT * FROM expectativas_e_objetivos", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      expectativas_e_objetivos: data?.rows || data,
      message: "Consulta de expectativas e objetivos realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  db.query(
    `SELECT * FROM expectativas_e_objetivos WHERE id = ${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        expectativa_objetivo: data?.rows?.[0] || data[0],
        message: "Consulta de expectativa e objetivo realizada com sucesso!",
      });
    }
  );
};

export const getByAlunoId = (req, res) => {
  db.query(
    `SELECT * FROM expectativas_e_objetivos WHERE aluno_id = ${req.params.alunoId}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        expectativa_objetivo: data?.rows?.[0] || data[0],
        message:
          "Consulta de expectativa e objetivo do aluno realizada com sucesso!",
      });
    }
  );
};

export const add = (req, res) => {
  const {
    aluno_id,
    expectativas_projeto,
    ja_participou_atividades_culturais,
    quais_atividades_culturais,
    motivo_participacao,
  } = req.body;

  // Validações dos campos enum (quando fornecidos)
  try {
    if (ja_participou_atividades_culturais) {
      validarEnum(
        ja_participou_atividades_culturais,
        SimNaoOpcoes,
        "ja_participou_atividades_culturais"
      );
    }

    if (motivo_participacao) {
      validarEnum(
        motivo_participacao,
        MotivoParticipacaoOpcoes,
        "motivo_participacao"
      );
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `INSERT INTO expectativas_e_objetivos (
    aluno_id,
    expectativas_projeto,
    ja_participou_atividades_culturais,
    quais_atividades_culturais,
    motivo_participacao
  ) VALUES (
    ${aluno_id},
    ${expectativas_projeto ? `'${expectativas_projeto}'` : "NULL"},
    ${
      ja_participou_atividades_culturais
        ? `'${ja_participou_atividades_culturais}'`
        : "NULL"
    },
    ${quais_atividades_culturais ? `'${quais_atividades_culturais}'` : "NULL"},
    ${motivo_participacao ? `'${motivo_participacao}'` : "NULL"}
  );`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      expectativa_objetivo: null,
      message: "Expectativa e objetivo criados com sucesso!",
    });
  });
};

export const update = (req, res) => {
  const {
    expectativas_projeto,
    ja_participou_atividades_culturais,
    quais_atividades_culturais,
    motivo_participacao,
  } = req.body;

  // Validações dos campos enum (quando fornecidos)
  try {
    if (ja_participou_atividades_culturais) {
      validarEnum(
        ja_participou_atividades_culturais,
        SimNaoOpcoes,
        "ja_participou_atividades_culturais"
      );
    }

    if (motivo_participacao) {
      validarEnum(
        motivo_participacao,
        MotivoParticipacaoOpcoes,
        "motivo_participacao"
      );
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `UPDATE expectativas_e_objetivos SET
    expectativas_projeto=${
      expectativas_projeto ? `'${expectativas_projeto}'` : "NULL"
    },
    ja_participou_atividades_culturais=${
      ja_participou_atividades_culturais
        ? `'${ja_participou_atividades_culturais}'`
        : "NULL"
    },
    quais_atividades_culturais=${
      quais_atividades_culturais ? `'${quais_atividades_culturais}'` : "NULL"
    },
    motivo_participacao=${
      motivo_participacao ? `'${motivo_participacao}'` : "NULL"
    },
    updated_at=CURRENT_TIMESTAMP
  WHERE id = ${req.params.id}`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      expectativa_objetivo: null,
      message: "Expectativa e objetivo atualizados com sucesso!",
    });
  });
};

export const delet = (req, res) => {
  db.query(
    `DELETE FROM expectativas_e_objetivos WHERE id = ${req.params.id}`,
    (err) => {
      if (err) return res.json(err);
      return res.status(200).json({
        expectativa_objetivo: null,
        message: "Expectativa e objetivo deletados com sucesso!",
      });
    }
  );
};

// Função para criar expectativas e objetivos junto com o cadastro do aluno (opcional)
export const createWithAluno = (
  alunoId,
  expectativasObjetivosData,
  callback
) => {
  const {
    expectativas_projeto,
    ja_participou_atividades_culturais,
    quais_atividades_culturais,
    motivo_participacao,
  } = expectativasObjetivosData;

  // Validações dos campos enum (quando fornecidos)
  try {
    if (ja_participou_atividades_culturais) {
      validarEnum(
        ja_participou_atividades_culturais,
        SimNaoOpcoes,
        "ja_participou_atividades_culturais"
      );
    }

    if (motivo_participacao) {
      validarEnum(
        motivo_participacao,
        MotivoParticipacaoOpcoes,
        "motivo_participacao"
      );
    }
  } catch (error) {
    return callback(error);
  }

  const q = `INSERT INTO expectativas_e_objetivos (
    aluno_id,
    expectativas_projeto,
    ja_participou_atividades_culturais,
    quais_atividades_culturais,
    motivo_participacao
  ) VALUES (
    ${alunoId},
    ${expectativas_projeto ? `'${expectativas_projeto}'` : "NULL"},
    ${
      ja_participou_atividades_culturais
        ? `'${ja_participou_atividades_culturais}'`
        : "NULL"
    },
    ${quais_atividades_culturais ? `'${quais_atividades_culturais}'` : "NULL"},
    ${motivo_participacao ? `'${motivo_participacao}'` : "NULL"}
  );`;

  db.query(q, callback);
};
