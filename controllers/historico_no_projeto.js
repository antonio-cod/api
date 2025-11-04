import { db } from "../db.js";

// Enums para as opções de histórico no projeto
export const SimNaoOpcoes = ["Sim", "Não"];

export const SimNaoGostariaOpcoes = ["Sim", "Não", "Não, mas gostaria"];

export const TempoParticipacaoOpcoes = [
  "Nunca",
  "Menos de 1 mês",
  "1 mês",
  "6 meses",
  "1 ano",
  "2 anos",
  "3 anos",
  "Mais de 3 anos",
];

// Função para validar enums
function validarEnum(valor, opcoes, campo) {
  if (!opcoes.includes(valor)) {
    throw new Error(
      `${campo} deve ser uma das seguintes opções: ${opcoes.join(", ")}`
    );
  }
}

// Função para criar a tabela
export const criarTabelaHistoricoNoProjeto = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS historico_no_projeto (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER NOT NULL REFERENCES aluno(id) ON DELETE CASCADE,
      ja_fez_aulas_antes VARCHAR(10) NOT NULL CHECK (ja_fez_aulas_antes IN ('Sim', 'Não')),
      atualmente_faz_aulas VARCHAR(20) NOT NULL CHECK (atualmente_faz_aulas IN ('Sim', 'Não', 'Não, mas gostaria')),
      tempo_participacao VARCHAR(20) NOT NULL CHECK (tempo_participacao IN ('Nunca', 'Menos de 1 mês', '1 mês', '6 meses', '1 ano', '2 anos', '3 anos', 'Mais de 3 anos')),
      participou_outras_acoes VARCHAR(10) NOT NULL CHECK (participou_outras_acoes IN ('Sim', 'Não')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(aluno_id)
    );
  `;

  try {
    db.query(sql);
    console.log("Tabela historico_no_projeto criada com sucesso!");
  } catch (err) {
    console.error("Erro ao criar tabela historico_no_projeto:", err);
    throw err;
  }
};

// Função para buscar todas as opções de enum
export const getOpcoes = (req, res) => {
  try {
    const opcoes = {
      ja_fez_aulas_antes: SimNaoOpcoes,
      atualmente_faz_aulas: SimNaoGostariaOpcoes,
      tempo_participacao: TempoParticipacaoOpcoes,
      participou_outras_acoes: SimNaoOpcoes,
    };

    res.status(200).json(opcoes);
  } catch (err) {
    console.error("Erro ao buscar opções:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar todos os históricos no projeto
export const get = (req, res) => {
  const sql = `
    SELECT hp.*, a.nome as aluno_nome
    FROM historico_no_projeto hp
    LEFT JOIN aluno a ON hp.aluno_id = a.id
    ORDER BY hp.id;
  `;

  try {
    const result = db.query(sql);
    res.status(200).json(result.rows || result);
  } catch (err) {
    console.error("Erro ao buscar históricos no projeto:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar histórico no projeto por ID
export const getById = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID deve ser um número válido" });
  }

  const sql = `
    SELECT hp.*, a.nome as aluno_nome
    FROM historico_no_projeto hp
    LEFT JOIN aluno a ON hp.aluno_id = a.id
    WHERE hp.id = $1;
  `;

  try {
    const result = db.query(sql, [id]);
    const historico = result.rows ? result.rows[0] : result[0];

    if (!historico) {
      return res
        .status(404)
        .json({ error: "Histórico no projeto não encontrado" });
    }

    res.status(200).json(historico);
  } catch (err) {
    console.error("Erro ao buscar histórico no projeto:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar histórico no projeto por aluno_id
export const getByAlunoId = (req, res) => {
  const { alunoId } = req.params;

  if (!alunoId || isNaN(alunoId)) {
    return res
      .status(400)
      .json({ error: "ID do aluno deve ser um número válido" });
  }

  const sql = `
    SELECT hp.*, a.nome as aluno_nome
    FROM historico_no_projeto hp
    LEFT JOIN aluno a ON hp.aluno_id = a.id
    WHERE hp.aluno_id = $1;
  `;

  try {
    const result = db.query(sql, [alunoId]);
    const historico = result.rows ? result.rows[0] : result[0];

    if (!historico) {
      return res
        .status(404)
        .json({ error: "Histórico no projeto não encontrado para este aluno" });
    }

    res.status(200).json(historico);
  } catch (err) {
    console.error("Erro ao buscar histórico no projeto por aluno:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para adicionar novo histórico no projeto
export const add = (req, res) => {
  const {
    aluno_id,
    ja_fez_aulas_antes,
    atualmente_faz_aulas,
    tempo_participacao,
    participou_outras_acoes,
  } = req.body;

  // Validações obrigatórias
  if (!aluno_id) {
    return res.status(400).json({ error: "aluno_id é obrigatório" });
  }

  if (!ja_fez_aulas_antes) {
    return res.status(400).json({ error: "ja_fez_aulas_antes é obrigatório" });
  }

  if (!atualmente_faz_aulas) {
    return res
      .status(400)
      .json({ error: "atualmente_faz_aulas é obrigatório" });
  }

  if (!tempo_participacao) {
    return res.status(400).json({ error: "tempo_participacao é obrigatório" });
  }

  if (!participou_outras_acoes) {
    return res
      .status(400)
      .json({ error: "participou_outras_acoes é obrigatório" });
  }

  try {
    // Validar enums
    validarEnum(ja_fez_aulas_antes, SimNaoOpcoes, "ja_fez_aulas_antes");
    validarEnum(
      atualmente_faz_aulas,
      SimNaoGostariaOpcoes,
      "atualmente_faz_aulas"
    );
    validarEnum(
      tempo_participacao,
      TempoParticipacaoOpcoes,
      "tempo_participacao"
    );
    validarEnum(
      participou_outras_acoes,
      SimNaoOpcoes,
      "participou_outras_acoes"
    );

    // Verificar se o aluno existe
    const alunoExiste = db.query("SELECT id FROM aluno WHERE id = $1", [
      aluno_id,
    ]);
    if (
      !(alunoExiste.rows ? alunoExiste.rows.length > 0 : alunoExiste.length > 0)
    ) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Verificar se já existe histórico para este aluno
    const historicoExistente = db.query(
      "SELECT id FROM historico_no_projeto WHERE aluno_id = $1",
      [aluno_id]
    );
    if (
      historicoExistente.rows
        ? historicoExistente.rows.length > 0
        : historicoExistente.length > 0
    ) {
      return res
        .status(400)
        .json({ error: "Já existe histórico no projeto para este aluno" });
    }

    const sql = `
      INSERT INTO historico_no_projeto (
        aluno_id, ja_fez_aulas_antes, atualmente_faz_aulas,
        tempo_participacao, participou_outras_acoes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      aluno_id,
      ja_fez_aulas_antes,
      atualmente_faz_aulas,
      tempo_participacao,
      participou_outras_acoes,
    ];

    const result = db.query(sql, values);
    const novoHistorico = result.rows ? result.rows[0] : result;

    res.status(201).json(novoHistorico);
  } catch (err) {
    console.error("Erro ao adicionar histórico no projeto:", err);
    if (err.message.includes("deve ser uma das seguintes opções")) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

// Função para atualizar histórico no projeto
export const update = (req, res) => {
  const { id } = req.params;
  const {
    ja_fez_aulas_antes,
    atualmente_faz_aulas,
    tempo_participacao,
    participou_outras_acoes,
  } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID deve ser um número válido" });
  }

  try {
    // Validar enums se fornecidos
    if (ja_fez_aulas_antes) {
      validarEnum(ja_fez_aulas_antes, SimNaoOpcoes, "ja_fez_aulas_antes");
    }
    if (atualmente_faz_aulas) {
      validarEnum(
        atualmente_faz_aulas,
        SimNaoGostariaOpcoes,
        "atualmente_faz_aulas"
      );
    }
    if (tempo_participacao) {
      validarEnum(
        tempo_participacao,
        TempoParticipacaoOpcoes,
        "tempo_participacao"
      );
    }
    if (participou_outras_acoes) {
      validarEnum(
        participou_outras_acoes,
        SimNaoOpcoes,
        "participou_outras_acoes"
      );
    }

    // Verificar se o histórico existe
    const historicoExiste = db.query(
      "SELECT id FROM historico_no_projeto WHERE id = $1",
      [id]
    );
    if (
      !(historicoExiste.rows
        ? historicoExiste.rows.length > 0
        : historicoExiste.length > 0)
    ) {
      return res
        .status(404)
        .json({ error: "Histórico no projeto não encontrado" });
    }

    // Construir query de atualização dinamicamente
    const camposParaAtualizar = [];
    const valores = [];
    let contador = 1;

    if (ja_fez_aulas_antes !== undefined) {
      camposParaAtualizar.push(`ja_fez_aulas_antes = $${contador++}`);
      valores.push(ja_fez_aulas_antes);
    }
    if (atualmente_faz_aulas !== undefined) {
      camposParaAtualizar.push(`atualmente_faz_aulas = $${contador++}`);
      valores.push(atualmente_faz_aulas);
    }
    if (tempo_participacao !== undefined) {
      camposParaAtualizar.push(`tempo_participacao = $${contador++}`);
      valores.push(tempo_participacao);
    }
    if (participou_outras_acoes !== undefined) {
      camposParaAtualizar.push(`participou_outras_acoes = $${contador++}`);
      valores.push(participou_outras_acoes);
    }

    if (camposParaAtualizar.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum campo para atualizar fornecido" });
    }

    camposParaAtualizar.push(`updated_at = CURRENT_TIMESTAMP`);
    valores.push(id);

    const sql = `
      UPDATE historico_no_projeto
      SET ${camposParaAtualizar.join(", ")}
      WHERE id = $${contador}
      RETURNING *;
    `;

    const result = db.query(sql, valores);
    const historicoAtualizado = result.rows ? result.rows[0] : result;

    res.status(200).json(historicoAtualizado);
  } catch (err) {
    console.error("Erro ao atualizar histórico no projeto:", err);
    if (err.message.includes("deve ser uma das seguintes opções")) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

// Função para deletar histórico no projeto
export const delet = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID deve ser um número válido" });
  }

  try {
    // Verificar se o histórico existe
    const historicoExiste = db.query(
      "SELECT id FROM historico_no_projeto WHERE id = $1",
      [id]
    );
    if (
      !(historicoExiste.rows
        ? historicoExiste.rows.length > 0
        : historicoExiste.length > 0)
    ) {
      return res
        .status(404)
        .json({ error: "Histórico no projeto não encontrado" });
    }

    const sql = "DELETE FROM historico_no_projeto WHERE id = $1 RETURNING *;";
    const result = db.query(sql, [id]);
    const historicoRemovido = result.rows ? result.rows[0] : result;

    res.status(200).json({
      message: "Histórico no projeto removido com sucesso",
      historico: historicoRemovido,
    });
  } catch (err) {
    console.error("Erro ao remover histórico no projeto:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função auxiliar para criar histórico junto com aluno
export const createWithAluno = async (alunoId, dadosHistorico) => {
  try {
    // Validar enums
    validarEnum(
      dadosHistorico.ja_fez_aulas_antes,
      SimNaoOpcoes,
      "ja_fez_aulas_antes"
    );
    validarEnum(
      dadosHistorico.atualmente_faz_aulas,
      SimNaoGostariaOpcoes,
      "atualmente_faz_aulas"
    );
    validarEnum(
      dadosHistorico.tempo_participacao,
      TempoParticipacaoOpcoes,
      "tempo_participacao"
    );
    validarEnum(
      dadosHistorico.participou_outras_acoes,
      SimNaoOpcoes,
      "participou_outras_acoes"
    );

    const sql = `
      INSERT INTO historico_no_projeto (
        aluno_id, ja_fez_aulas_antes, atualmente_faz_aulas,
        tempo_participacao, participou_outras_acoes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      alunoId,
      dadosHistorico.ja_fez_aulas_antes,
      dadosHistorico.atualmente_faz_aulas,
      dadosHistorico.tempo_participacao,
      dadosHistorico.participou_outras_acoes,
    ];

    const result = db.query(sql, values);
    return result.rows ? result.rows[0] : result;
  } catch (err) {
    console.error("Erro ao criar histórico no projeto com aluno:", err);
    throw err;
  }
};
