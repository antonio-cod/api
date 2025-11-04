import { db } from "../db.js";

// Definições dos Enums baseadas nos dados especificados
export const SimNaoOpcoes = {
  SIM: "Sim",
  NAO: "Não",
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

// Função para validar escalas de 0 a 10
const validarEscala = (valor, nomeEnum) => {
  const numero = parseInt(valor);
  if (isNaN(numero) || numero < 0 || numero > 10) {
    throw new Error(`${nomeEnum} deve ser um número entre 0 e 10`);
  }
  return true;
};

// Função para obter as opções dos enums (útil para o frontend)
export const getEnumOptions = (_, res) => {
  return res.status(200).json({
    possui_rede_apoio: Object.values(SimNaoOpcoes),
    deseja_fortalecer_vinculos: Object.values(SimNaoOpcoes),
    escalas: {
      autoestima: "Escala de 0 a 10",
      satisfacao_vida: "Escala de 0 a 10",
    },
    message:
      "Opções dos campos enum da avaliação de bem-estar obtidas com sucesso!",
  });
};

export const criarTabelaAvaliacaoBemEstar = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS avaliacao_bem_estar (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER UNIQUE NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      autoestima_atual INTEGER NOT NULL CHECK (autoestima_atual >= 0 AND autoestima_atual <= 10),
      satisfacao_vida INTEGER NOT NULL CHECK (satisfacao_vida >= 0 AND satisfacao_vida <= 10),
      possui_rede_apoio VARCHAR(10) NOT NULL,
      deseja_fortalecer_vinculos VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log("Erro ao criar tabela avaliacao_bem_estar", error.message);
      return;
    }
    console.log("Tabela avaliacao_bem_estar criada com sucesso.");
  });
};

export const get = (_, res) => {
  db.query("SELECT * FROM avaliacao_bem_estar", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      avaliacoes_bem_estar: data?.rows || data,
      message: "Consulta de avaliações de bem-estar realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  db.query(
    `SELECT * FROM avaliacao_bem_estar WHERE id = ${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        avaliacao_bem_estar: data?.rows?.[0] || data[0],
        message: "Consulta de avaliação de bem-estar realizada com sucesso!",
      });
    }
  );
};

export const getByAlunoId = (req, res) => {
  db.query(
    `SELECT * FROM avaliacao_bem_estar WHERE aluno_id = ${req.params.alunoId}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        avaliacao_bem_estar: data?.rows?.[0] || data[0],
        message:
          "Consulta de avaliação de bem-estar do aluno realizada com sucesso!",
      });
    }
  );
};

export const add = (req, res) => {
  const {
    aluno_id,
    autoestima_atual,
    satisfacao_vida,
    possui_rede_apoio,
    deseja_fortalecer_vinculos,
  } = req.body;

  // Validações dos campos obrigatórios
  try {
    validarEscala(autoestima_atual, "autoestima_atual");
    validarEscala(satisfacao_vida, "satisfacao_vida");
    validarEnum(possui_rede_apoio, SimNaoOpcoes, "possui_rede_apoio");
    validarEnum(
      deseja_fortalecer_vinculos,
      SimNaoOpcoes,
      "deseja_fortalecer_vinculos"
    );
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `INSERT INTO avaliacao_bem_estar (
    aluno_id,
    autoestima_atual,
    satisfacao_vida,
    possui_rede_apoio,
    deseja_fortalecer_vinculos
  ) VALUES (
    ${aluno_id},
    ${autoestima_atual},
    ${satisfacao_vida},
    '${possui_rede_apoio}',
    '${deseja_fortalecer_vinculos}'
  );`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      avaliacao_bem_estar: null,
      message: "Avaliação de bem-estar criada com sucesso!",
    });
  });
};

export const update = (req, res) => {
  const {
    autoestima_atual,
    satisfacao_vida,
    possui_rede_apoio,
    deseja_fortalecer_vinculos,
  } = req.body;

  // Validações dos campos obrigatórios
  try {
    validarEscala(autoestima_atual, "autoestima_atual");
    validarEscala(satisfacao_vida, "satisfacao_vida");
    validarEnum(possui_rede_apoio, SimNaoOpcoes, "possui_rede_apoio");
    validarEnum(
      deseja_fortalecer_vinculos,
      SimNaoOpcoes,
      "deseja_fortalecer_vinculos"
    );
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `UPDATE avaliacao_bem_estar SET
    autoestima_atual=${autoestima_atual},
    satisfacao_vida=${satisfacao_vida},
    possui_rede_apoio='${possui_rede_apoio}',
    deseja_fortalecer_vinculos='${deseja_fortalecer_vinculos}',
    updated_at=CURRENT_TIMESTAMP
  WHERE id = ${req.params.id}`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      avaliacao_bem_estar: null,
      message: "Avaliação de bem-estar atualizada com sucesso!",
    });
  });
};

export const delet = (req, res) => {
  db.query(
    `DELETE FROM avaliacao_bem_estar WHERE id = ${req.params.id}`,
    (err) => {
      if (err) return res.json(err);
      return res.status(200).json({
        avaliacao_bem_estar: null,
        message: "Avaliação de bem-estar deletada com sucesso!",
      });
    }
  );
};

// Função para criar avaliação de bem-estar junto com o cadastro do aluno
export const createWithAluno = (alunoId, avaliacaoBemEstarData, callback) => {
  const {
    autoestima_atual,
    satisfacao_vida,
    possui_rede_apoio,
    deseja_fortalecer_vinculos,
  } = avaliacaoBemEstarData;

  // Validações dos campos obrigatórios
  try {
    validarEscala(autoestima_atual, "autoestima_atual");
    validarEscala(satisfacao_vida, "satisfacao_vida");
    validarEnum(possui_rede_apoio, SimNaoOpcoes, "possui_rede_apoio");
    validarEnum(
      deseja_fortalecer_vinculos,
      SimNaoOpcoes,
      "deseja_fortalecer_vinculos"
    );
  } catch (error) {
    return callback(error);
  }

  const q = `INSERT INTO avaliacao_bem_estar (
    aluno_id,
    autoestima_atual,
    satisfacao_vida,
    possui_rede_apoio,
    deseja_fortalecer_vinculos
  ) VALUES (
    ${alunoId},
    ${autoestima_atual},
    ${satisfacao_vida},
    '${possui_rede_apoio}',
    '${deseja_fortalecer_vinculos}'
  );`;

  db.query(q, callback);
};
