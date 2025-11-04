import { db } from "../db.js";

// Enums para status do termo
export const StatusTermoOpcoes = ["Ativo", "Inativo", "Rascunho"];

// Função para validar enums
function validarEnum(valor, opcoes, campo) {
  if (!opcoes.includes(valor)) {
    throw new Error(
      `${campo} deve ser uma das seguintes opções: ${opcoes.join(", ")}`
    );
  }
}

// Função para criar a tabela de termos
export const criarTabelaTermos = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS termos (
      id SERIAL PRIMARY KEY,
      versao VARCHAR(20) UNIQUE NOT NULL,
      titulo VARCHAR(500) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('Ativo', 'Inativo', 'Rascunho')),
      conteudo JSONB NOT NULL,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_ativacao TIMESTAMP,
      criado_por VARCHAR(100),
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    db.query(sql);
    console.log("Tabela termos criada com sucesso!");
  } catch (err) {
    console.error("Erro ao criar tabela termos:", err);
    throw err;
  }
};

// Função para buscar todas as opções de enum
export const getOpcoes = (req, res) => {
  try {
    const opcoes = {
      status: StatusTermoOpcoes,
    };

    res.status(200).json(opcoes);
  } catch (err) {
    console.error("Erro ao buscar opções:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar todos os termos
export const get = (req, res) => {
  const sql = `
    SELECT * FROM termos
    ORDER BY data_criacao DESC;
  `;

  try {
    const result = db.query(sql);
    res.status(200).json(result.rows || result);
  } catch (err) {
    console.error("Erro ao buscar termos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar apenas termos ativos
export const getAtivos = (req, res) => {
  const sql = `
    SELECT * FROM termos
    WHERE status = 'Ativo'
    ORDER BY data_ativacao DESC;
  `;

  try {
    const result = db.query(sql);
    res.status(200).json(result.rows || result);
  } catch (err) {
    console.error("Erro ao buscar termos ativos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar o termo ativo atual (mais recente)
export const getTermoAtivoAtual = async () => {
  const sql = `
    SELECT * FROM termos
    WHERE status = 'Ativo'
    ORDER BY data_ativacao DESC, versao DESC
    LIMIT 1;
  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    return result.rows?.[0] || result[0] || null;
  } catch (err) {
    console.error("Erro ao buscar termo ativo atual:", err);
    throw err;
  }
};

// Endpoint para buscar o termo ativo atual
export const getAtivoAtual = async (req, res) => {
  try {
    const termo = await getTermoAtivoAtual();

    if (!termo) {
      return res.status(404).json({
        message: "Nenhum termo ativo encontrado",
      });
    }

    res.status(200).json({
      termo,
      message: "Termo ativo atual obtido com sucesso",
    });
  } catch (err) {
    console.error("Erro ao buscar termo ativo atual:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar termo por ID
export const getById = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID deve ser um número válido" });
  }

  const sql = "SELECT * FROM termos WHERE id = $1;";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Erro ao buscar termo:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
    const termo = result.rows ? result.rows[0] : result[0];
    if (!termo) {
      return res.status(404).json({ error: "Termo não encontrado" });
    }
    res.status(200).json(termo);
  });
};

// Função para buscar termo por versão
export const getByVersao = (req, res) => {
  const { versao } = req.params;

  if (!versao) {
    return res.status(400).json({ error: "Versão é obrigatória" });
  }

  const sql = "SELECT * FROM termos WHERE versao = $1;";

  try {
    const result = db.query(sql, [versao]);
    const termo = result.rows ? result.rows[0] : result[0];

    if (!termo) {
      return res.status(404).json({ error: "Termo não encontrado" });
    }

    res.status(200).json(termo);
  } catch (err) {
    console.error("Erro ao buscar termo por versão:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para buscar termo ativo atual
export const getAtual = (req, res) => {
  const sql = `
    SELECT * FROM termos
    WHERE status = 'Ativo'
    ORDER BY data_ativacao DESC
    LIMIT 1;
  `;

  try {
    const result = db.query(sql);
    const termo = result.rows ? result.rows[0] : result[0];

    if (!termo) {
      return res.status(404).json({ error: "Nenhum termo ativo encontrado" });
    }

    res.status(200).json(termo);
  } catch (err) {
    console.error("Erro ao buscar termo atual:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para criar novo termo
export const add = (req, res) => {
  const {
    versao,
    titulo,
    status = "Rascunho",
    conteudo,
    criado_por,
    observacoes,
  } = req.body;

  // Aceitar conteudo como string ou objeto
  let conteudoJson;
  if (!conteudo) {
    return res.status(400).json({ error: "conteudo é obrigatório" });
  }
  try {
    conteudoJson =
      typeof conteudo === "string" ? JSON.parse(conteudo) : conteudo;
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Conteúdo do termo não é um JSON válido." });
  }

  // Validações obrigatórias
  if (!versao) {
    return res.status(400).json({ error: "versao é obrigatória" });
  }

  if (!titulo) {
    return res.status(400).json({ error: "titulo é obrigatório" });
  }

  if (!conteudo) {
    return res.status(400).json({ error: "conteudo é obrigatório" });
  }

  try {
    // Validar enum
    validarEnum(status, StatusTermoOpcoes, "status");

    // Verificar se versão já existe
    const versaoExiste = db.query("SELECT id FROM termos WHERE versao = $1", [
      versao,
    ]);
    if (
      versaoExiste.rows ? versaoExiste.rows.length > 0 : versaoExiste.length > 0
    ) {
      return res
        .status(400)
        .json({ error: "Já existe um termo com esta versão" });
    }

    // Se for ativo, definir data de ativação
    const dataAtivacao = status === "Ativo" ? "CURRENT_TIMESTAMP" : null;

    const sql = `
      INSERT INTO termos (
        versao, titulo, status, conteudo,
        data_ativacao, criado_por, observacoes
      )
      VALUES ($1, $2, $3, $4, ${dataAtivacao ? dataAtivacao : "NULL"}, $5, $6)
      RETURNING *;
    `;

    const values = [
      versao,
      titulo,
      status,
      JSON.stringify(conteudoJson),
      criado_por,
      observacoes,
    ];

    const result = db.query(sql, values);
    const novoTermo = result.rows ? result.rows[0] : result;

    res.status(201).json({
      ...novoTermo,
      conteudo: conteudoJson,
    });
  } catch (err) {
    console.error("Erro ao criar termo:", err);
    if (err.message.includes("deve ser uma das seguintes opções")) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

// Função para atualizar termo
export const update = (req, res) => {
  const { id } = req.params;
  const { titulo, status, conteudo, observacoes } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID deve ser um número válido" });
  }

  try {
    // Validar enum se fornecido
    if (status) {
      validarEnum(status, StatusTermoOpcoes, "status");
    }

    // Verificar se o termo existe
    const termoExiste = db.query(
      "SELECT id, status FROM termos WHERE id = $1",
      [id]
    );
    const termo = termoExiste.rows ? termoExiste.rows[0] : termoExiste[0];

    if (!termo) {
      return res.status(404).json({ error: "Termo não encontrado" });
    }

    // Construir query de atualização dinamicamente
    const camposParaAtualizar = [];
    const valores = [];
    let contador = 1;

    if (titulo !== undefined) {
      camposParaAtualizar.push(`titulo = $${contador++}`);
      valores.push(titulo);
    }
    if (status !== undefined) {
      camposParaAtualizar.push(`status = $${contador++}`);
      valores.push(status);

      // Se mudou para Ativo e antes não era, definir data de ativação
      if (status === "Ativo" && termo.status !== "Ativo") {
        camposParaAtualizar.push(`data_ativacao = CURRENT_TIMESTAMP`);
      }
    }
    if (conteudo !== undefined) {
      camposParaAtualizar.push(`conteudo = $${contador++}`);
      valores.push(JSON.stringify(conteudo));
    }
    if (observacoes !== undefined) {
      camposParaAtualizar.push(`observacoes = $${contador++}`);
      valores.push(observacoes);
    }

    if (camposParaAtualizar.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum campo para atualizar fornecido" });
    }

    camposParaAtualizar.push(`updated_at = CURRENT_TIMESTAMP`);
    valores.push(id);

    const sql = `
      UPDATE termos
      SET ${camposParaAtualizar.join(", ")}
      WHERE id = $${contador}
      RETURNING *;
    `;

    const result = db.query(sql, valores);
    const termoAtualizado = result.rows ? result.rows[0] : result;

    res.status(200).json({
      ...termoAtualizado,
      conteudo: JSON.parse(termoAtualizado.conteudo),
    });
  } catch (err) {
    console.error("Erro ao atualizar termo:", err);
    if (err.message.includes("deve ser uma das seguintes opções")) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

// Função para ativar termo (apenas um ativo por vez)
export const ativar = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID deve ser um número válido" });
  }

  try {
    // Verificar se o termo existe
    const termoExiste = db.query("SELECT id FROM termos WHERE id = $1", [id]);
    if (
      !(termoExiste.rows ? termoExiste.rows.length > 0 : termoExiste.length > 0)
    ) {
      return res.status(404).json({ error: "Termo não encontrado" });
    }

    // Transação: desativar todos e ativar apenas este
    const sqlDesativar =
      "UPDATE termos SET status = 'Inativo' WHERE status = 'Ativo';";
    const sqlAtivar = `
      UPDATE termos
      SET status = 'Ativo', data_ativacao = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    db.query(sqlDesativar);
    const result = db.query(sqlAtivar, [id]);
    const termoAtivado = result.rows ? result.rows[0] : result;

    res.status(200).json({
      ...termoAtivado,
      conteudo: JSON.parse(termoAtivado.conteudo),
      message: "Termo ativado com sucesso! Outros termos foram desativados.",
    });
  } catch (err) {
    console.error("Erro ao ativar termo:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função para deletar termo
export const delet = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID deve ser um número válido" });
  }

  try {
    // Verificar se o termo existe
    const termoExiste = db.query("SELECT id FROM termos WHERE id = $1", [id]);
    if (
      !(termoExiste.rows ? termoExiste.rows.length > 0 : termoExiste.length > 0)
    ) {
      return res.status(404).json({ error: "Termo não encontrado" });
    }

    // Verificar se há aceites relacionados
    const aceitesExistem = db.query(
      "SELECT COUNT(*) as total FROM termos_condicoes WHERE termo_id = $1",
      [id]
    );
    const count = aceitesExistem.rows
      ? aceitesExistem.rows[0].total
      : aceitesExistem[0].total;

    if (parseInt(count) > 0) {
      return res.status(400).json({
        error: "Não é possível deletar termo que possui aceites relacionados",
      });
    }

    const sql = "DELETE FROM termos WHERE id = $1 RETURNING *;";
    const result = db.query(sql, [id]);
    const termoRemovido = result.rows ? result.rows[0] : result;

    res.status(200).json({
      message: "Termo removido com sucesso",
      termo: {
        ...termoRemovido,
        conteudo: JSON.parse(termoRemovido.conteudo),
      },
    });
  } catch (err) {
    console.error("Erro ao remover termo:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Função auxiliar para criar termo padrão do Casarão das Artes
export const criarTermoPadrao = async () => {
  try {
    const conteudoPadrao = {
      1: {
        titulo: "Regras Gerais de Participação e Conduta",
        subsecoes: {
          1.1: {
            titulo: "Sobre as Aulas e Atendimento",
            conteudo: [
              "As aulas e o atendimento psicológico oferecidos pelo Casarão das Artes são gratuitos.",
              "As atividades ocorrem no ESPAÇO CULTURAL CASARÃO DAS ARTES – PEDRA 90.",
              "O Casarão oferece atividades para crianças (a partir de 5 anos), adolescentes, adultos e idosos.",
              "Caso seja necessário, a aula pode ser remarcada para outro dia e horário, mediante combinação com os alunos.",
              "Para alunos menores de idade, o responsável deve ir até o Casarão para conversar com a coordenação e assinar a autorização.",
            ],
          },
          1.2: {
            titulo: "Frequência e Materiais",
            conteudo: [
              "É fundamental usar o uniforme durante as aulas.",
              "É obrigatório trazer sua própria garrafa de água.",
              "Faltas sem aviso prévio não são permitidas.",
              "Se o aluno faltar mais de 3 vezes sem justificar, será considerado desistente e perderá o direito de participar de apresentações, passeios ou eventos.",
              "Em caso de desistência ou abandono definitivo das aulas, a equipe de coordenação deve ser avisada.",
              "Mantenha o celular desligado ou no silencioso durante as aulas.",
            ],
          },
          1.3: {
            titulo: "Saúde e Segurança",
            conteudo: [
              "Se estiver com sintomas de gripe, avise a equipe e permaneça em casa.",
              "É obrigatório manter a carteira de vacinas em dia.",
            ],
          },
        },
      },
      2: {
        titulo: "Programa de Bolsas e Avaliação",
        subsecoes: {
          2.1: {
            titulo: "Critérios de Avaliação",
            conteudo: [
              "A participação de todos os alunos será avaliada por três critérios: frequência, participação nas atividades e desempenho/desenvolvimento nas aulas.",
            ],
          },
          2.2: {
            titulo: "Compromissos do Bolsista",
            conteudo: [
              "Para participar do Programa de Bolsas, o aluno deve preencher e assinar o formulário de inscrição na sede do Casarão.",
              "Ao aceitar participar, o aluno se compromete a:",
              "• Não faltar às aulas sem motivo.",
              "• Se estiver na escola, continuar frequentando, tirar boas notas e participar das atividades escolares.",
              "• Ler 1 livro por mês e entregar um relatório sobre ele (escrito ou falado).",
            ],
          },
          2.3: {
            titulo: "Vagas",
            conteudo: [
              "As bolsas serão concedidas apenas para os 50 primeiros inscritos.",
              "Quem não conseguir a vaga inicial será incluído na lista de espera e poderá ser chamado conforme a ordem e as faltas dos alunos já no programa.",
            ],
          },
        },
      },
      3: {
        titulo: "Política de Privacidade e Uso de Dados (LGPD)",
        subsecoes: {
          3.1: {
            titulo: "Finalidade da Coleta de Dados",
            conteudo: [
              "Seus dados pessoais são guardados e utilizados apenas para:",
              "• Efetuar sua inscrição no projeto.",
              "• Prestar contas dos projetos do Instituto.",
              "• Divulgar as atividades do Casarão das Artes (no site, redes sociais e para parceiros).",
            ],
          },
          3.2: {
            titulo: "Acesso e Retenção",
            conteudo: [
              "O acesso aos seus dados completos é restrito somente à equipe de gestão do Casarão das Artes.",
              "Informações públicas (para parceiros e divulgação) serão apenas dados gerais, gráficos e números totais, sem identificação pessoal (seu nome ou dados privados).",
              "Os dados serão guardados pelo período de 5 a 10 anos.",
              "Após preencher o formulário, você receberá um e-mail com uma cópia das suas respostas.",
            ],
          },
          3.3: {
            titulo: "Direitos do Titular",
            conteudo: [
              "Você pode pedir para ver ou excluir seus dados a qualquer momento.",
              "O e-mail para contato sobre seus dados é: institutocasaraodasartes@gmail.com.",
            ],
          },
        },
      },
      4: {
        titulo: "Autorização de Uso de Imagem e Voz",
        subsecoes: {
          4.1: {
            titulo: "Uso de Imagem",
            conteudo: [
              "Durante as atividades do Casarão, serão tiradas fotos e gravados vídeos.",
              "Ao participar, você autoriza gratuitamente o uso da sua imagem e voz pelo Casarão das Artes.",
              "O material será utilizado para: guardar como registro, prestação de contas dos projetos e divulgação das ações em redes sociais, sites e outros meios.",
            ],
          },
        },
      },
      5: {
        titulo: "Compromisso de Divulgação e Apoio",
        subsecoes: {
          5.1: {
            titulo: "Compromissos do Participante",
            conteudo: [
              "Ao marcar 'Li e Concordo', você aceita todas as regras e se compromete a participar das aulas e ajudar a divulgar o Casarão.",
              "Você pode ajudar o projeto compartilhando postagens, convidando amigos e participando dos eventos.",
              "Sua ajuda é importante para que o Casarão possa crescer e continuar oferecendo suas atividades.",
              "Você declara estar ciente de que o Casarão é um espaço de arte e cultura, feito para você se expressar, aprender e se desenvolver.",
              "Ao marcar 'Li e Concordo', você confirma que entendeu e aceita todas as informações, regras e termos acima.",
            ],
          },
        },
      },
    };

    const sql = `
      INSERT INTO termos (
        versao, titulo, status, conteudo,
        data_ativacao, criado_por, observacoes
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6)
      RETURNING *;
    `;

    const values = [
      "2025-v1.0",
      "Termos e Condições do Projeto Casarão das Artes 2025",
      "Ativo",
      JSON.stringify(conteudoPadrao),
      "Sistema",
      "Termo padrão criado automaticamente",
    ];

    const result = db.query(sql, values);
    const novoTermo = result.rows ? result.rows[0] : result;

    console.log("Termo padrão criado com sucesso!", novoTermo.versao);
    return novoTermo;
  } catch (err) {
    console.error("Erro ao criar termo padrão:", err);
    throw err;
  }
};

// ======================== FUNÇÕES DE ACEITE DE TERMOS ========================

// Função para criar aceite de termo
export const criarAceiteTermo = async (alunoId, termoId, dadosAceite = {}) => {
  const sql = `
    INSERT INTO termos_condicoes (aluno_id, termo_id, aceito, data_aceitacao, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (aluno_id, termo_id)
    DO UPDATE SET
      aceito = $3,
      data_aceitacao = $4,
      ip_address = $5,
      user_agent = $6
    RETURNING *;
  `;

  const values = [
    alunoId,
    termoId,
    dadosAceite.aceito !== false, // Default true
    dadosAceite.dataAceitacao || new Date(),
    dadosAceite.ipAddress || null,
    dadosAceite.userAgent || null,
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, values, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    return result.rows?.[0] || result[0];
  } catch (err) {
    console.error("Erro ao criar aceite de termo:", err);
    throw err;
  }
};

// Função para aceitar o termo ativo atual
export const aceitarTermoAtual = async (alunoId, dadosAceite = {}) => {
  try {
    const termoAtivo = await getTermoAtivoAtual();

    if (!termoAtivo) {
      throw new Error("Nenhum termo ativo encontrado");
    }

    return await criarAceiteTermo(alunoId, termoAtivo.id, dadosAceite);
  } catch (err) {
    console.error("Erro ao aceitar termo atual:", err);
    throw err;
  }
};

// Endpoint para aceitar termo
export const aceitarTermo = async (req, res) => {
  try {
    const { alunoId, termoId } = req.params;
    const { ipAddress, userAgent } = req.body;

    const dadosAceite = {
      aceito: true,
      dataAceitacao: new Date(),
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get("User-Agent"),
    };

    const aceite = await criarAceiteTermo(alunoId, termoId, dadosAceite);

    res.status(200).json({
      aceite,
      message: "Termo aceito com sucesso!",
    });
  } catch (err) {
    console.error("Erro ao aceitar termo:", err);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao aceitar termo",
    });
  }
};

// Endpoint para aceitar termo ativo atual
export const aceitarTermoAtivoAtual = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const { ipAddress, userAgent } = req.body;

    const dadosAceite = {
      aceito: true,
      dataAceitacao: new Date(),
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get("User-Agent"),
    };

    const aceite = await aceitarTermoAtual(alunoId, dadosAceite);

    res.status(200).json({
      aceite,
      message: "Termo ativo atual aceito com sucesso!",
    });
  } catch (err) {
    console.error("Erro ao aceitar termo ativo atual:", err);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao aceitar termo ativo atual",
    });
  }
};
