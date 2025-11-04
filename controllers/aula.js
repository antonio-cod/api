import { db } from "../db.js";

export const criarTabelaAula = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS aula (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT,
      data_aula TIMESTAMP NOT NULL,
      duracao INTEGER,
      vagas INTEGER DEFAULT 20,
      instrutor VARCHAR(255),
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log("Erro ao criar tabela aulas", error.message);
      return;
    }
    console.log("Tabela aulas criada com sucesso.");
  });
};

export const get = (_, res) => {
  db.query("SELECT * FROM aula", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      aulas: data?.rows || data,
      message: "Consulta de aulas realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  db.query(`SELECT * FROM aula WHERE id = ${req.params.id}`, (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      aula: data?.rows?.[0] || data[0],
      message: "Consulta de aula realizada com sucesso!",
    });
  });
};

export const add = (req, res) => {
  const { titulo, descricao, data_aula, duracao, vagas, instrutor } = req.body;
  const q = `INSERT INTO aula (titulo, descricao, data_aula, duracao, vagas, instrutor) VALUES ($1, $2, $3, $4, $5, $6)`;
  const values = [titulo, descricao, data_aula, duracao, vagas, instrutor];
  db.query(q, values, (err) => {
    if (err) {
      console.error("Erro ao criar aula:", err);
      return res.status(500).json({
        error: true,
        message: "Erro ao criar aula.",
        details: err.message,
      });
    }
    return res
      .status(200)
      .json({ aula: null, message: "Aula criada com sucesso!" });
  });
};

export const update = (req, res) => {
  const { titulo, descricao, data_aula, duracao, vagas, instrutor } = req.body;
  const q = `UPDATE aula SET titulo=$1, descricao=$2, data_aula=$3, duracao=$4, vagas=$5, instrutor=$6, data_atualizacao=NOW() WHERE id = $7`;
  const values = [
    titulo,
    descricao,
    data_aula,
    duracao,
    vagas,
    instrutor,
    req.params.id,
  ];
  db.query(q, values, (err) => {
    if (err) return res.json(err);
    return res
      .status(200)
      .json({ aula: null, message: "Aula atualizada com sucesso!" });
  });
};

export const delet = (req, res) => {
  db.query(`DELETE FROM aula WHERE id = ${req.params.id}`, (err) => {
    if (err) return res.json(err);
    return res
      .status(200)
      .json({ aulas: null, message: "Aula deletada com sucesso!" });
  });
};

export const listByAula = (req, res) => {
  try {
    const aulaId = Number(req.params.aula_id);
    if (!aulaId) {
      return res.status(400).json({
        error: "aula_id é obrigatório",
        message: "Informe o id da aula.",
      });
    }
    const q = `SELECT al.id, al.nome, al.matricula FROM inscricoes i LEFT JOIN alunos al ON i.aluno_id = al.id WHERE i.aula_id = ${aulaId}`;
    db.query(q, (err, data) => {
      if (err)
        return res.status(500).json({
          error: err.message,
          message: "Erro ao consultar alunos inscritos.",
        });
      return res.json({
        alunos: data.rows || data,
        message: "Consulta de alunos inscritos realizada com sucesso!",
      });
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: "Erro ao consultar alunos inscritos.",
    });
  }
};
