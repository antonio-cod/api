import { db } from "../db.js";

// Definições dos Enums baseadas nos dados especificados
export const MeioTransporteOpcoes = {
  A_PE: "A pé",
  BICICLETA: "Bicicleta",
  TRANSPORTE_PUBLICO: "Transporte público",
  CARONA: "Carona",
  OUTRO: "Outro",
};

export const DificuldadesOpcoes = {
  FALTA_TRANSPORTE: "Falta de transporte",
  CUIDADO_FILHOS: "Cuidado com filhos",
  TRABALHO: "Trabalho",
  SAUDE: "Saúde",
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
    meio_transporte: Object.values(MeioTransporteOpcoes),
    principais_dificuldades: Object.values(DificuldadesOpcoes),
    message:
      "Opções dos campos enum das barreiras de acesso obtidas com sucesso!",
  });
};

export const criarTabelaBarreirasAcesso = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS barreiras_acesso (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER UNIQUE NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      meio_transporte VARCHAR(50) NOT NULL,
      tempo_deslocamento INTEGER NOT NULL,
      principais_dificuldades TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log("Erro ao criar tabela barreiras_acesso", error.message);
      return;
    }
    console.log("Tabela barreiras_acesso criada com sucesso.");
  });
};

export const get = (_, res) => {
  db.query("SELECT * FROM barreiras_acesso", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      barreiras_acesso: data?.rows || data,
      message: "Consulta de barreiras de acesso realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  db.query(
    `SELECT * FROM barreiras_acesso WHERE id = ${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        barreira_acesso: data?.rows?.[0] || data[0],
        message: "Consulta de barreira de acesso realizada com sucesso!",
      });
    }
  );
};

export const getByAlunoId = (req, res) => {
  db.query(
    `SELECT * FROM barreiras_acesso WHERE aluno_id = ${req.params.alunoId}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        barreira_acesso: data?.rows?.[0] || data[0],
        message:
          "Consulta de barreira de acesso do aluno realizada com sucesso!",
      });
    }
  );
};

export const add = (req, res) => {
  const {
    aluno_id,
    meio_transporte,
    tempo_deslocamento,
    principais_dificuldades,
  } = req.body;

  // Validações dos campos obrigatórios
  try {
    validarEnum(meio_transporte, MeioTransporteOpcoes, "meio_transporte");

    if (!tempo_deslocamento || tempo_deslocamento <= 0) {
      throw new Error("Tempo de deslocamento deve ser um número positivo");
    }

    if (principais_dificuldades && principais_dificuldades.length > 0) {
      validarArrayEnum(
        principais_dificuldades,
        DificuldadesOpcoes,
        "principais_dificuldades"
      );
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `INSERT INTO barreiras_acesso (
    aluno_id,
    meio_transporte,
    tempo_deslocamento,
    principais_dificuldades
  ) VALUES (
    ${aluno_id},
    '${meio_transporte}',
    ${tempo_deslocamento},
    '{${
      Array.isArray(principais_dificuldades)
        ? principais_dificuldades.join(",")
        : ""
    }}'
  );`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      barreira_acesso: null,
      message: "Barreira de acesso criada com sucesso!",
    });
  });
};

export const update = (req, res) => {
  const { meio_transporte, tempo_deslocamento, principais_dificuldades } =
    req.body;

  // Validações dos campos obrigatórios
  try {
    validarEnum(meio_transporte, MeioTransporteOpcoes, "meio_transporte");

    if (!tempo_deslocamento || tempo_deslocamento <= 0) {
      throw new Error("Tempo de deslocamento deve ser um número positivo");
    }

    if (principais_dificuldades && principais_dificuldades.length > 0) {
      validarArrayEnum(
        principais_dificuldades,
        DificuldadesOpcoes,
        "principais_dificuldades"
      );
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `UPDATE barreiras_acesso SET
    meio_transporte='${meio_transporte}',
    tempo_deslocamento=${tempo_deslocamento},
    principais_dificuldades='{${
      Array.isArray(principais_dificuldades)
        ? principais_dificuldades.join(",")
        : ""
    }}',
    updated_at=CURRENT_TIMESTAMP
  WHERE id = ${req.params.id}`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      barreira_acesso: null,
      message: "Barreira de acesso atualizada com sucesso!",
    });
  });
};

export const delet = (req, res) => {
  db.query(
    `DELETE FROM barreiras_acesso WHERE id = ${req.params.id}`,
    (err) => {
      if (err) return res.json(err);
      return res.status(200).json({
        barreira_acesso: null,
        message: "Barreira de acesso deletada com sucesso!",
      });
    }
  );
};

// Função para criar barreira de acesso junto com o cadastro do aluno
export const createWithAluno = (alunoId, barreirasAcessoData, callback) => {
  const { meio_transporte, tempo_deslocamento, principais_dificuldades } =
    barreirasAcessoData;

  // Validações dos campos obrigatórios
  try {
    validarEnum(meio_transporte, MeioTransporteOpcoes, "meio_transporte");

    if (!tempo_deslocamento || tempo_deslocamento <= 0) {
      throw new Error("Tempo de deslocamento deve ser um número positivo");
    }

    if (principais_dificuldades && principais_dificuldades.length > 0) {
      validarArrayEnum(
        principais_dificuldades,
        DificuldadesOpcoes,
        "principais_dificuldades"
      );
    }
  } catch (error) {
    return callback(error);
  }

  const q = `INSERT INTO barreiras_acesso (
    aluno_id,
    meio_transporte,
    tempo_deslocamento,
    principais_dificuldades
  ) VALUES (
    ${alunoId},
    '${meio_transporte}',
    ${tempo_deslocamento},
    '{${
      Array.isArray(principais_dificuldades)
        ? principais_dificuldades.join(",")
        : ""
    }}'
  );`;

  db.query(q, callback);
};
