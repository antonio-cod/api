import { db } from "../db.js";

// Definições dos Enums baseadas no código TypeORM
export const GeneroOpcoes = {
  FEMININO: "Feminino",
  MASCULINO: "Masculino",
  NAO_BINARIO: "Não-binário",
  PREFIRO_NAO_INFORMAR: "Prefiro não informar",
  OUTRO: "Outro",
};

export const SexoOpcoes = {
  FEMININO: "Feminino",
  MASCULINO: "Masculino",
  NAO_BINARIO: "Não-binário",
};

export const RacaCorOpcoes = {
  BRANCA: "Branca",
  PRETA: "Preta",
  PARDA: "Parda",
  AMARELA: "Amarela",
  INDIGENA: "Indígena",
  PREFIRO_NAO_INFORMAR: "Prefiro não informar",
};

export const OrientacaoSexualOpcoes = {
  HETEROSSEXUAL: "Heterossexual",
  HOMOSSEXUAL: "Homossexual",
  BISSEXUAL: "Bissexual",
  PANSEXUAL: "Pansexual",
  ASSEXUAL: "Assexual",
  PREFIRO_NAO_INFORMAR: "Prefiro não informar",
  OUTRO: "Outro",
};

export const SimNaoPrefiroOpcoes = {
  SIM: "Sim",
  NAO: "Não",
  PREFIRO_NAO_INFORMAR: "Prefiro não informar",
};

export const SituacaoAtualOpcoes = {
  ESTUDANDO: "Estudando",
  TRABALHANDO: "Trabalhando",
  ESTUDANDO_E_TRABALHANDO: "Estudando e trabalhando",
  DESEMPREGADO: "Desempregado",
  APOSENTADO: "Aposentado",
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
    genero: Object.values(GeneroOpcoes),
    sexo: Object.values(SexoOpcoes),
    raca_cor: Object.values(RacaCorOpcoes),
    orientacao_sexual: Object.values(OrientacaoSexualOpcoes),
    possui_deficiencia_neurodivergencia: Object.values(SimNaoPrefiroOpcoes),
    situacao_atual: Object.values(SituacaoAtualOpcoes),
    message: "Opções dos campos enum obtidas com sucesso!",
  });
};

export const criarTabelaResponsavel = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS responsaveis (
      id SERIAL PRIMARY KEY,
      nome_completo VARCHAR(255) NOT NULL,
      nome_social VARCHAR(255),
      data_nascimento DATE NOT NULL,
      idade INTEGER NOT NULL,
      genero VARCHAR(50) NOT NULL,
      sexo VARCHAR(50) NOT NULL,
      raca_cor VARCHAR(50) NOT NULL,
      orientacao_sexual VARCHAR(50) NOT NULL,
      possui_deficiencia_neurodivergencia VARCHAR(50) NOT NULL,
      qual_deficiencia VARCHAR(255),
      condicao_medica VARCHAR(255) NOT NULL,
      cpf VARCHAR(14) UNIQUE NOT NULL,
      rg VARCHAR(20) UNIQUE NOT NULL,
      endereco_completo VARCHAR(255) NOT NULL,
      bairro VARCHAR(100) NOT NULL,
      cidade VARCHAR(100) NOT NULL,
      cep VARCHAR(10) NOT NULL,
      telefone VARCHAR(15) NOT NULL,
      email VARCHAR(255),
      situacao_atual VARCHAR(50) NOT NULL
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log("Erro ao criar tabela responsaveis", error.message);
      return;
    }
    console.log("Tabela responsaveis criada com sucesso.");
  });
};

export const get = (_, res) => {
  db.query("SELECT * FROM responsaveis", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      responsaveis: data?.rows || data,
      message: "Consulta de responsáveis realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  db.query(
    `SELECT * FROM responsaveis WHERE id = ${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        responsavel: data?.rows?.[0] || data[0],
        message: "Consulta de responsável realizada com sucesso!",
      });
    }
  );
};

export const add = (req, res) => {
  const {
    nome_completo,
    nome_social,
    data_nascimento,
    idade,
    genero,
    sexo,
    raca_cor,
    orientacao_sexual,
    possui_deficiencia_neurodivergencia,
    qual_deficiencia,
    condicao_medica,
    cpf,
    rg,
    endereco_completo,
    bairro,
    cidade,
    cep,
    telefone,
    email,
    situacao_atual,
  } = req.body;

  // Validações dos campos enum
  try {
    validarEnum(genero, GeneroOpcoes, "genero");
    validarEnum(sexo, SexoOpcoes, "sexo");
    validarEnum(raca_cor, RacaCorOpcoes, "raca_cor");
    validarEnum(orientacao_sexual, OrientacaoSexualOpcoes, "orientacao_sexual");
    validarEnum(
      possui_deficiencia_neurodivergencia,
      SimNaoPrefiroOpcoes,
      "possui_deficiencia_neurodivergencia"
    );
    validarEnum(situacao_atual, SituacaoAtualOpcoes, "situacao_atual");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `INSERT INTO responsaveis (
    nome_completo,
    nome_social,
    data_nascimento,
    idade,
    genero,
    sexo,
    raca_cor,
    orientacao_sexual,
    possui_deficiencia_neurodivergencia,
    qual_deficiencia,
    condicao_medica,
    cpf,
    rg,
    endereco_completo,
    bairro,
    cidade,
    cep,
    telefone,
    email,
    situacao_atual
  ) VALUES (
    '${nome_completo}',
    ${nome_social ? `'${nome_social}'` : "NULL"},
    '${data_nascimento}',
    ${idade},
    '${genero}',
    '${sexo}',
    '${raca_cor}',
    '${orientacao_sexual}',
    '${possui_deficiencia_neurodivergencia}',
    ${qual_deficiencia ? `'${qual_deficiencia}'` : "NULL"},
    '${condicao_medica}',
    '${cpf}',
    '${rg}',
    '${endereco_completo}',
    '${bairro}',
    '${cidade}',
    '${cep}',
    '${telefone}',
    ${email ? `'${email}'` : "NULL"},
    '${situacao_atual}'
  );`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res
      .status(200)
      .json({ responsavel: null, message: "Responsável criado com sucesso!" });
  });
};

export const update = (req, res) => {
  const {
    nome_completo,
    nome_social,
    data_nascimento,
    idade,
    genero,
    sexo,
    raca_cor,
    orientacao_sexual,
    possui_deficiencia_neurodivergencia,
    qual_deficiencia,
    condicao_medica,
    cpf,
    rg,
    endereco_completo,
    bairro,
    cidade,
    cep,
    telefone,
    email,
    situacao_atual,
  } = req.body;

  // Validações dos campos enum
  try {
    validarEnum(genero, GeneroOpcoes, "genero");
    validarEnum(sexo, SexoOpcoes, "sexo");
    validarEnum(raca_cor, RacaCorOpcoes, "raca_cor");
    validarEnum(orientacao_sexual, OrientacaoSexualOpcoes, "orientacao_sexual");
    validarEnum(
      possui_deficiencia_neurodivergencia,
      SimNaoPrefiroOpcoes,
      "possui_deficiencia_neurodivergencia"
    );
    validarEnum(situacao_atual, SituacaoAtualOpcoes, "situacao_atual");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const q = `UPDATE responsaveis SET
    nome_completo='${nome_completo}',
    nome_social=${nome_social ? `'${nome_social}'` : "NULL"},
    data_nascimento='${data_nascimento}',
    idade=${idade},
    genero='${genero}',
    sexo='${sexo}',
    raca_cor='${raca_cor}',
    orientacao_sexual='${orientacao_sexual}',
    possui_deficiencia_neurodivergencia='${possui_deficiencia_neurodivergencia}',
    qual_deficiencia=${qual_deficiencia ? `'${qual_deficiencia}'` : "NULL"},
    condicao_medica='${condicao_medica}',
    cpf='${cpf}',
    rg='${rg}',
    endereco_completo='${endereco_completo}',
    bairro='${bairro}',
    cidade='${cidade}',
    cep='${cep}',
    telefone='${telefone}',
    email=${email ? `'${email}'` : "NULL"},
    situacao_atual='${situacao_atual}'
  WHERE id = ${req.params.id}`;

  db.query(q, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      responsavel: null,
      message: "Responsável atualizado com sucesso!",
    });
  });
};

export const delet = (req, res) => {
  db.query(`DELETE FROM responsaveis WHERE id = ${req.params.id}`, (err) => {
    if (err) return res.json(err);
    return res.status(200).json({
      responsavel: null,
      message: "Responsável deletado com sucesso!",
    });
  });
};

export const getAlunosByResponsavel = (req, res) => {
  db.query(
    `SELECT * FROM alunos WHERE responsavel_id = ${req.params.id}`,
    (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({
        alunos: data?.rows || data,
        message: "Consulta de alunos do responsável realizada com sucesso!",
      });
    }
  );
};
