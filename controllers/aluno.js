import { db } from "../db.js";
import JsBarcode from "jsbarcode"; // Para gerar o código de barras 1D
import { createCanvas } from "canvas"; // Dependência do JsBarcode no Node.js

// --- HELPER 1: String para Array (Mantido) ---
/**
 * Converte uma string separada por vírgulas em um array de strings.
 */
const stringParaArrayPg = (str) => {
  if (!str || typeof str !== "string") {
    return [];
  }
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);
};

// --- HELPER 2: Gerador de Código de Barras 1D ---
const gerarBarcode1D = async (text) => {
  try {
    const canvas = createCanvas();
    JsBarcode(canvas, text, {
      format: "CODE128",
      displayValue: true,
      text: text,
      fontSize: 18,
      margin: 10,
    });
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Falha ao gerar código de barras 1D:", err);
    return null;
  }
};
// --- FIM DOS HELPERS ---

export const criarTabelaAluno = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS aluno (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      telefone VARCHAR(20),
      matricula VARCHAR(50) UNIQUE,
      qr_code TEXT, -- Este campo armazena o CÓDIGO DE BARRAS 1D (como Data URL)
      idade VARCHAR(10) DEFAULT '0',
      blusa VARCHAR(50),
      calca VARCHAR(50),
      calcado VARCHAR(50),
      sexo VARCHAR(20),
      identidade_genero TEXT[],
      raca VARCHAR(50),
      cpf VARCHAR(20),
      rg VARCHAR(20),
      data_nascimento DATE,
      responsavel_id INTEGER REFERENCES responsaveis(id) ON DELETE SET NULL
    );
  `;
  db.query(q, (error) => {
    if (error) {
      console.log("Erro ao criar tabela aluno", error.message);
      return;
    }
    console.log("Tabela aluno criada com sucesso.");
  });
};

export const get = (_, res) => {
  // ... (função mantida)
  db.query("SELECT * FROM aluno", (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      aluno: data?.rows || data,
      message: "Consulta de aluno realizada com sucesso!",
    });
  });
};

export const getById = (req, res) => {
  // ... (função mantida)
  db.query(`SELECT * FROM aluno WHERE id = ${req.params.id}`, (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json({
      aluno: data?.rows?.[0] || data[0],
      message: "Consulta de aluno realizada com sucesso!",
    });
  });
};

export const add = (req, res) => {
  // ... (função 'add' original mantida)
  const {
    nome,
    email,
    telefone,
    matricula,
    qr_code,
    idade,
    blusa,
    calca,
    calcado,
    sexo,
    identidade_genero,
    responsavel_id,
  } = req.body;

  const q = `INSERT INTO aluno (nome, email, telefone, matricula, qr_code, idade, blusa, calca, calcado, sexo, identidade_genero, responsavel_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

  const values = [
    nome,
    email,
    telefone,
    matricula,
    qr_code,
    idade || "0",
    blusa,
    calca,
    calcado,
    sexo,
    identidade_genero,
    responsavel_id || null,
  ];

  db.query(q, values, (err) => {
    if (err) return res.json(err);
    return res
      .status(200)
      .json({ aluno: null, message: "Aluno criado com sucesso!" });
  });
};

// Função para criar aluno completo (Corrigida)
export const addCompleto = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      aluno = {},
      situacao_familiar,
      perfil_educacional,
      barreiras_acesso,
      expectativas_e_objetivos,
      avaliacao_bem_estar,
      historico_no_projeto,
      responsavel,
      termos_condicoes,
    } = req.body;

    let {
      nome,
      email,
      telefone,
      idade,
      blusa,
      calca,
      calcado,
      sexo,
      identidade_genero,
      raca,
      cpf,
      rg,
      data_nascimento,
      aulas,
    } = aluno;

    if (!Array.isArray(identidade_genero)) {
      identidade_genero = identidade_genero ? [identidade_genero] : [];
    }

    // --- ETAPA 1: Inserir Responsável (se fornecido) ---
    let novoResponsavelId = null;
    if (responsavel) {
      const insertResponsavelQuery = `
        INSERT INTO responsavel (nome, cpf, rg, parentesco, telefone, email, endereco, profissao, observacoes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      const responsavelValues = [
        responsavel.nome,
        responsavel.cpf,
        responsavel.rg,
        responsavel.parentesco,
        responsavel.telefone,
        responsavel.email,
        responsavel.endereco,
        responsavel.profissao,
        responsavel.observacoes,
      ];

      const responsavelResult = await client.query(
        insertResponsavelQuery,
        responsavelValues
      );
      novoResponsavelId = responsavelResult.rows[0].id;
    }

    // --- ETAPA 2: Inserir Aluno (SEM matrícula e SEM barcode) ---
    const insertAlunoQuery = `
      INSERT INTO aluno (
        nome, email, telefone, idade, blusa, calca, calcado, sexo, identidade_genero,
        raca, cpf, rg, data_nascimento, responsavel_id, matricula, qr_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `;

    const alunoValues = [
      nome,
      email,
      telefone,
      idade || "0",
      blusa,
      calca,
      calcado,
      sexo,
      identidade_genero,
      raca,
      cpf,
      rg,
      data_nascimento || null,
      novoResponsavelId || null,
      aluno.matricula || null,
      aluno.qr_code || null,
    ];

    let alunoId;
    try {
      const alunoResult = await client.query(insertAlunoQuery, alunoValues);
      alunoId = alunoResult.rows[0].id;
    } catch (err) {
      return res.status(500).json({
        error: true,
        message: "Erro ao criar aluno.",
        details: err.message,
      });
    }

    if (!alunoId) {
      throw new Error("Falha ao criar aluno, ID não retornado.");
    }

    // --- ETAPA 3: Inserir Inscrições (se fornecidas) ---
    if (aulas && Array.isArray(aulas) && aulas.length > 0) {
      const insertInscricaoQuery = `
        INSERT INTO inscricao (aluno_id, aula_id, data_inscricao, status)
        VALUES ($1, $2, NOW(), $3)
      `;
      for (const aulaId of aulas) {
        await client.query(insertInscricaoQuery, [alunoId, aulaId, "Pendente"]);
      }
    }

    // --- ETAPA 4: Inserir Tabelas Relacionadas ---
    // 4.1 Inserir situação familiar (se fornecida)
    if (situacao_familiar) {
      const insertSituacaoFamiliarQuery = `
        INSERT INTO situacao_familiar
        (aluno_id, situacao_trabalho, renda_familiar, beneficio_social, programas_assistencia, tem_filhos, quantidade_filhos, outras_pessoas_casa, tipo_moradia, observacoes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      const situacaoValues = [
        alunoId,
        situacao_familiar.situacao_trabalho,
        situacao_familiar.renda_familiar,
        situacao_familiar.beneficio_social,
        stringParaArrayPg(situacao_familiar.programas_assistencia),
        situacao_familiar.tem_filhos,
        situacao_familiar.quantidade_filhos || 0,
        situacao_familiar.outras_pessoas_casa || 0,
        situacao_familiar.tipo_moradia,
        situacao_familiar.observacoes,
      ];
      await client.query(insertSituacaoFamiliarQuery, situacaoValues);
    }

    // 4.2 Inserir perfil educacional (se fornecido)
    if (perfil_educacional) {
      const insertPerfilEducacionalQuery = `
        INSERT INTO perfil_educacional
        (aluno_id, escolaridade, instituicao_ensino, ano_conclusao, cursos_complementares, habilidades_especiais, idiomas, nivel_tecnologia, tem_computador, tem_internet, qualidade_internet,
        curso_atual, area_interesse_profissional)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
      const perfilValues = [
        alunoId,
        perfil_educacional.escolaridade,
        perfil_educacional.instituicao_ensino,
        perfil_educacional.ano_conclusao || null,
        stringParaArrayPg(perfil_educacional.cursos_complementares),
        stringParaArrayPg(perfil_educacional.habilidades_especiais),
        stringParaArrayPg(perfil_educacional.idiomas),
        perfil_educacional.nivel_tecnologia,
        perfil_educacional.tem_computador,
        perfil_educacional.tem_internet,
        perfil_educacional.qualidade_internet,
        perfil_educacional.curso_atual,
        // --- CORREÇÃO AQUI ---
        stringParaArrayPg(perfil_educacional.area_formacao), // Estava faltando o helper
        // --- FIM DA CORREÇÃO ---
      ];
      await client.query(insertPerfilEducacionalQuery, perfilValues);
    }

    // 4.3 Inserir barreiras de acesso (se fornecidas)
    if (barreiras_acesso) {
      const insertBarreirasAcessoQuery = `
        INSERT INTO barreiras_acesso
        (aluno_id, barreira_transporte, barreira_tempo, barreira_familiar, barreira_saude, barreira_tecnologica, outras_barreiras, data_atualizacao,
        meio_transporte, tempo_deslocamento, principais_dificuldades)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10)
      `;
      const barreirasValues = [
        alunoId,
        barreiras_acesso.barreira_transporte,
        barreiras_acesso.barreira_tempo,
        barreiras_acesso.barreira_familiar,
        barreiras_acesso.barreira_saude,
        barreiras_acesso.barreira_tecnologica,
        barreiras_acesso.outras_barreiras,
        barreiras_acesso.barreira_financeira,
        barreiras_acesso.descricao_barreiras,
        [],
      ];
      await client.query(insertBarreirasAcessoQuery, barreirasValues);
    }

    // 4.4 Inserir expectativas e objetivos (se fornecidas)
    if (expectativas_e_objetivos) {
      const insertExpectativasObjetivosQuery = `
        INSERT INTO expectativas_e_objetivos
        (aluno_id, objetivo_principal, expectativa_curso, meta_curto_prazo, meta_longo_prazo, areas_interesse, motivacao_participacao, resultado_esperado, compromisso_tempo,
        meta_medio_prazo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      const expectativasValues = [
        alunoId,
        expectativas_e_objetivos.objetivo_principal,
        expectativas_e_objetivos.expectativa_curso,
        expectativas_e_objetivos.meta_curto_prazo,
        expectativas_e_objetivos.meta_longo_prazo,
        stringParaArrayPg(expectativas_e_objetivos.areas_interesse),
        expectativas_e_objetivos.motivacao_participacao,
        expectativas_e_objetivos.resultado_esperado,
        expectativas_e_objetivos.compromisso_tempo,
        expectativas_e_objetivos.meta_medio_prazo,
      ];
      await client.query(insertExpectativasObjetivosQuery, expectativasValues);
    }

    // 4.5 Inserir avaliação de bem-estar (se fornecida)
    if (avaliacao_bem_estar) {
      const insertAvaliacaoBemEstarQuery = `
        INSERT INTO avaliacao_bem_estar
        (aluno_id, autoestima, relacionamento_familiar, relacionamento_social, nivel_estresse, motivacao, sentimento_pertencimento, seguranca_emocional, perspectiva_futuro, observacoes,
        satisfacao_vida)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      const avaliacaoValues = [
        alunoId,
        avaliacao_bem_estar.autoestima || 0,
        avaliacao_bem_estar.relacionamento_familiar || 0,
        avaliacao_bem_estar.relacionamento_social || 0,
        avaliacao_bem_estar.nivel_estresse || 0,
        avaliacao_bem_estar.motivacao || 0,
        avaliacao_bem_estar.sentimento_pertencimento || 0,
        avaliacao_bem_estar.seguranca_emocional || 0,
        avaliacao_bem_estar.perspectiva_futuro || 0,
        avaliacao_bem_estar.observacoes,
        avaliacao_bem_estar.satisfacao_vida || 0,
      ];
      await client.query(insertAvaliacaoBemEstarQuery, avaliacaoValues);
    }

    // 4.6 Inserir histórico no projeto (se fornecido)
    if (historico_no_projeto) {
      const insertHistoricoProjetoQuery = `
        INSERT INTO historico_no_projeto
        (aluno_id, ja_participou, cursos_anteriores, periodo_participacao, avaliacao_experiencia, principais_ganhos, dificuldades_enfrentadas, sugestoes_melhoria, recomendaria_projeto,
        gostaria_continuar)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      const historicoValues = [
        alunoId,
        historico_no_projeto.ja_participou,
        stringParaArrayPg(historico_no_projeto.cursos_anteriores),
        historico_no_projeto.periodo_participacao,
        historico_no_projeto.avaliacao_experiencia || 0,
        historico_no_projeto.principais_ganhos,
        historico_no_projeto.dificuldades_enfrentadas,
        historico_no_projeto.sugestoes_melhoria,
        historico_no_projeto.recomendaria_projeto,
        historico_no_projeto.gostaria_continuar,
      ];
      await client.query(insertHistoricoProjetoQuery, historicoValues);
    }

    // --- ETAPA 5: Aceitar Termo (Lógica original mantida) ---
    try {
      const buscarTermoQuery = `
        SELECT * FROM termos
        WHERE status = 'Ativo'
        ORDER BY data_ativacao DESC, versao DESC
        LIMIT 1
      `;
      const termoResult = await client.query(buscarTermoQuery);
      const termoAtivo = termoResult.rows?.[0] || termoResult[0];

      if (!termoAtivo) {
        await client.query("ROLLBACK");
        return res.status(500).json({
          error: "Erro ao aceitar termo",
          message: "Nenhum termo ativo encontrado",
          details: "Não é possível criar aluno sem aceite de termo",
        });
      }

      const insertAceiteTermoQuery = `
        INSERT INTO termos_condicoes (aluno_id, termo_id, aceito, data_aceitacao, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (aluno_id, termo_id)
        DO UPDATE SET
          aceito = $3,
          data_aceitacao = $4,
          ip_address = $5,
          user_agent = $6
      `;
      const aceiteValues = [
        alunoId,
        termoAtivo.id,
        true,
        new Date(),
        req.ip || null,
        req.get("User-Agent") || null,
      ];
      await client.query(insertAceiteTermoQuery, aceiteValues);
    } catch (termoError) {
      await client.query("ROLLBACK");
      console.error(
        `Erro ao aceitar termo para aluno ${alunoId}:`,
        termoError.message
      );
      return res.status(500).json({
        error: "Erro ao aceitar termo",
        message: "Falha ao criar aluno completo: aceite de termo obrigatório",
        details: termoError.message,
      });
    }

    // --- ETAPA 6: Confirmar Transação ---
    await client.query("COMMIT");

    return res.status(200).json({
      aluno: { id: alunoId },
      message: "Aluno completo criado com sucesso!",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao criar aluno completo:", error);
    // Melhorando a resposta de erro para o frontend
    if (error.code === "22P02") {
      // Erro de 'matriz mal formada'
      return res.status(400).json({
        error: "Formato de Array Inválido",
        message: "Falha ao criar aluno completo",
        details: error.message,
      });
    }
    if (error.details && error.details.includes("_check")) {
      return res.status(400).json({
        error: "Violação de Restrição",
        message:
          "Um dos valores enviados (como 'Sim/Não' ou 'Renda') não é permitido.",
        details: error.details,
      });
    }

    return res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao criar aluno completo",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

// --- Funções Restantes ---
export const update = (req, res) => {
  // ... (Sua função 'update' original)
  const {
    nome,
    email,
    telefone,
    matricula,
    qr_code,
    idade,
    blusa,
    calca,
    calcado,
    sexo,
    identidade_genero,
    responsavel_id,
    raca,
    cpf,
    rg,
    data_nascimento,
  } = req.body;

  const q = `
    UPDATE aluno SET
    nome='${nome}',
    email='${email}',
    telefone='${telefone}',
    matricula='${matricula}',
    qr_code='${qr_code}',
    idade='${idade}',
    blusa='${blusa}',
    calca='${calca}',
    calcado='${calcado}',
    sexo='${sexo}',
    identidade_genero='{${identidade_genero.join(",")}}',
    raca='${raca}',
    cpf='${cpf}',
    rg='${rg}',
    data_nascimento='${data_nascimento}',
    responsavel_id=${responsavel_id || "NULL"}
    WHERE id = ${req.params.id}
  `;
  db.query(q, (err) => {
    if (err) return res.json(err);
    return res
      .status(200)
      .json({ aluno: null, message: "Aluno atualizado com sucesso!" });
  });
};

export const delet = (req, res) => {
  // ... (Sua função 'delet' original)
  db.query(`DELETE FROM aluno WHERE id = ${req.params.id}`, (err) => {
    if (err) return res.json(err);
    return res
      .status(200)
      .json({ aluno: null, message: "Aluno deletado com sucesso!" });
  });
};

export const getWithSituacaoFamiliar = (req, res) => {
  // ... (Sua função 'getWithSituacaoFamiliar' original)
  const q = `
    SELECT
      a.*,
      sf.id as situacao_familiar_id,
      sf.responsavel_criancas_0_6,
      sf.numero_filhos_dependentes,
      sf.situacao_trabalho,
      sf.renda_familiar,
      sf.programas_assistencia,
      sf.quantas_pessoas_moram,
      sf.quem_mora_com_voce,
      sf.frequenta_atividades_culturais,
      sf.quais_atividades_culturais,
      sf.created_at as situacao_familiar_created_at,
      sf.updated_at as situacao_familiar_updated_at
  FROM aluno a
    LEFT JOIN situacao_familiar sf ON a.id = sf.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      situacao_familiar: result.situacao_familiar_id
        ? {
            id: result.situacao_familiar_id,
            responsavel_criancas_0_6: result.responsavel_criancas_0_6,
            numero_filhos_dependentes: result.numero_filhos_dependentes,
            situacao_trabalho: result.situacao_trabalho,
            renda_familiar: result.renda_familiar,
            programas_assistencia: result.programas_assistencia,
            quantas_pessoas_moram: result.quantas_pessoas_moram,
            quem_mora_com_voce: result.quem_mora_com_voce,
            frequenta_atividades_culturais:
              result.frequenta_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            created_at: result.situacao_familiar_created_at,
            updated_at: result.situacao_familiar_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message: "Consulta de aluno com situação familiar realizada com sucesso!",
    });
  });
};

export const getWithPerfilEducacional = (req, res) => {
  // ... (Sua função 'getWithPerfilEducacional' original)
  const q = `
    SELECT
      a.*,
      pe.id as perfil_educacional_id,
      pe.escolaridade_atual,
      pe.situacao_escolar,
      pe.turno_escolar,
      pe.instituicao_atual,
      pe.curso_atual,
      pe.semestre_periodo_atual,
      pe.area_interesse_profissional,
      pe.certificacoes_profissionais,
      pe.experiencia_profissional,
      pe.objetivos_educacionais,
      pe.dificuldades_aprendizagem,
      pe.observacoes,
      pe.created_at as perfil_educacional_created_at,
      pe.updated_at as perfil_educacional_updated_at
    FROM aluno a
    LEFT JOIN perfil_educacional pe ON a.id = pe.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      perfil_educacional: result.perfil_educacional_id
        ? {
            id: result.perfil_educacional_id,
            escolaridade_atual: result.escolaridade_atual,
            situacao_escolar: result.situacao_escolar,
            turno_escolar: result.turno_escolar,
            instituicao_atual: result.instituicao_atual,
            curso_atual: result.curso_atual,
            semestre_periodo_atual: result.semestre_periodo_atual,
            area_interesse_profissional: result.area_interesse_profissional,
            certificacoes_profissionais: result.certificacoes_profissionais,
            experiencia_profissional: result.experiencia_profissional,
            objetivos_educacionais: result.objetivos_educacionais,
            dificuldades_aprendizagem: result.dificuldades_aprendizagem,
            observacoes: result.observacoes,
            created_at: result.perfil_educacional_created_at,
            updated_at: result.perfil_educacional_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno com perfil educacional realizada com sucesso!",
    });
  });
};

export const getCompleto = (req, res) => {
  // ... (Sua função 'getCompleto' original)
  const q = `
    SELECT
      a.*,
      sf.id as situacao_familiar_id,
      sf.responsavel_criancas_0_6,
      sf.numero_filhos_dependentes,
      sf.situacao_trabalho,
      sf.renda_familiar,
      sf.programas_assistencia,
      sf.quantas_pessoas_moram,
      sf.quem_mora_com_voce,
      sf.frequenta_atividades_culturais,
      sf.quais_atividades_culturais,
      sf.created_at as situacao_familiar_created_at,
      sf.updated_at as situacao_familiar_updated_at,
      pe.id as perfil_educacional_id,
      pe.escolaridade_atual,
      pe.situacao_escolar,
      pe.turno_escolar,
      pe.instituicao_atual,
      pe.curso_atual,
      pe.semestre_periodo_atual,
      pe.area_interesse_profissional,
      pe.certificacoes_profissionais,
      pe.experiencia_profissional,
      pe.objetivos_educacionais,
      pe.dificuldades_aprendizagem,
      pe.observacoes,
      pe.created_at as perfil_educacional_created_at,
      pe.updated_at as perfil_educacional_updated_at
    FROM aluno a
    LEFT JOIN situacao_familiar sf ON a.id = sf.aluno_id
    LEFT JOIN perfil_educacional pe ON a.id = pe.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      situacao_familiar: result.situacao_familiar_id
        ? {
            id: result.situacao_familiar_id,
            responsavel_criancas_0_6: result.responsavel_criancas_0_6,
            numero_filhos_dependentes: result.numero_filhos_dependentes,
            situacao_trabalho: result.situacao_trabalho,
            renda_familiar: result.renda_familiar,
            programas_assistencia: result.programas_assistencia,
            quantas_pessoas_moram: result.quantas_pessoas_moram,
            quem_mora_com_voce: result.quem_mora_com_voce,
            frequenta_atividades_culturais:
              result.frequenta_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            created_at: result.situacao_familiar_created_at,
            updated_at: result.situacao_familiar_updated_at,
          }
        : null,
      perfil_educacional: result.perfil_educacional_id
        ? {
            id: result.perfil_educacional_id,
            escolaridade_atual: result.escolaridade_atual,
            situacao_escolar: result.situacao_escolar,
            turno_escolar: result.turno_escolar,
            instituicao_atual: result.instituicao_atual,
            curso_atual: result.curso_atual,
            semestre_periodo_atual: result.semestre_periodo_atual,
            area_interesse_profissional: result.area_interesse_profissional,
            certificacoes_profissionais: result.certificacoes_profissionais,
            experiencia_profissional: result.experiencia_profissional,
            objetivos_educacionais: result.objetivos_educacionais,
            dificuldades_aprendizagem: result.dificuldades_aprendizagem,
            observacoes: result.observacoes,
            created_at: result.perfil_educacional_created_at,
            updated_at: result.perfil_educacional_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message: "Consulta de aluno completo realizada com sucesso!",
    });
  });
};

export const getWithBarreirasAcesso = (req, res) => {
  // ... (Sua função 'getWithBarreirasAcesso' original)
  const q = `
    SELECT
      a.*,
      ba.id as barreiras_acesso_id,
      ba.meio_transporte,
      ba.tempo_deslocamento,
      ba.principais_dificuldades,
      ba.created_at as barreiras_acesso_created_at,
      ba.updated_at as barreiras_acesso_updated_at
    FROM aluno a
    LEFT JOIN barreiras_acesso ba ON a.id = ba.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      barreiras_acesso: result.barreiras_acesso_id
        ? {
            id: result.barreiras_acesso_id,
            meio_transporte: result.meio_transporte,
            tempo_deslocamento: result.tempo_deslocamento,
            principais_dificuldades: result.principais_dificuldades,
            created_at: result.barreiras_acesso_created_at,
            updated_at: result.barreiras_acesso_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno com barreiras de acesso realizada com sucesso!",
    });
  });
};

export const getCompletoTudo = (req, res) => {
  // ... (Sua função 'getCompletoTudo' original)
  const q = `
    SELECT
      a.*,
      sf.id as situacao_familiar_id,
      sf.responsavel_criancas_0_6,
      sf.numero_filhos_dependentes,
      sf.situacao_trabalho,
      sf.renda_familiar,
      sf.programas_assistencia,
      sf.quantas_pessoas_moram,
      sf.quem_mora_com_voce,
      sf.frequenta_atividades_culturais,
      sf.quais_atividades_culturais,
      sf.created_at as situacao_familiar_created_at,
      sf.updated_at as situacao_familiar_updated_at,
      pe.id as perfil_educacional_id,
      pe.escolaridade_atual,
      pe.situacao_escolar,
      pe.turno_escolar,
      pe.instituicao_atual,
      pe.curso_atual,
      pe.semestre_periodo_atual,
      pe.area_interesse_profissional,
      pe.certificacoes_profissionais,
      pe.experiencia_profissional,
      pe.objetivos_educacionais,
      pe.dificuldades_aprendizagem,
      pe.observacoes,
      pe.created_at as perfil_educacional_created_at,
      pe.updated_at as perfil_educacional_updated_at,
      ba.id as barreiras_acesso_id,
      ba.meio_transporte,
      ba.tempo_deslocamento,
      ba.principais_dificuldades,
      ba.created_at as barreiras_acesso_created_at,
      ba.updated_at as barreiras_acesso_updated_at
    FROM aluno a
    LEFT JOIN situacao_familiar sf ON a.id = sf.aluno_id
    LEFT JOIN perfil_educacional pe ON a.id = pe.aluno_id
    LEFT JOIN barreiras_acesso ba ON a.id = ba.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      situacao_familiar: result.situacao_familiar_id
        ? {
            id: result.situacao_familiar_id,
            responsavel_criancas_0_6: result.responsavel_criancas_0_6,
            numero_filhos_dependentes: result.numero_filhos_dependentes,
            situacao_trabalho: result.situacao_trabalho,
            renda_familiar: result.renda_familiar,
            programas_assistencia: result.programas_assistencia,
            quantas_pessoas_moram: result.quantas_pessoas_moram,
            quem_mora_com_voce: result.quem_mora_com_voce,
            frequenta_atividades_culturais:
              result.frequenta_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            created_at: result.situacao_familiar_created_at,
            updated_at: result.situacao_familiar_updated_at,
          }
        : null,
      perfil_educacional: result.perfil_educacional_id
        ? {
            id: result.perfil_educacional_id,
            escolaridade_atual: result.escolaridade_atual,
            situacao_escolar: result.situacao_escolar,
            turno_escolar: result.turno_escolar,
            instituicao_atual: result.instituicao_atual,
            curso_atual: result.curso_atual,
            semestre_periodo_atual: result.semestre_periodo_atual,
            area_interesse_profissional: result.area_interesse_profissional,
            certificacoes_profissionais: result.certificacoes_profissionais,
            experiencia_profissional: result.experiencia_profissional,
            objetivos_educacionais: result.objetivos_educacionais,
            dificuldades_aprendizagem: result.dificuldades_aprendizagem,
            observacoes: result.observacoes,
            created_at: result.perfil_educacional_created_at,
            updated_at: result.perfil_educacional_updated_at,
          }
        : null,
      barreiras_acesso: result.barreiras_acesso_id
        ? {
            id: result.barreiras_acesso_id,
            meio_transporte: result.meio_transporte,
            tempo_deslocamento: result.tempo_deslocamento,
            principais_dificuldades: result.principais_dificuldades,
            created_at: result.barreiras_acesso_created_at,
            updated_at: result.barreiras_acesso_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno completo com todas as informações realizada com sucesso!",
    });
  });
};

export const getWithExpectativasObjetivos = (req, res) => {
  // ... (Sua função 'getWithExpectativasObjetivos' original)
  const q = `
    SELECT
      a.*,
      eo.id as expectativas_objetivos_id,
      eo.expectativas_projeto,
      eo.ja_participou_atividades_culturais,
      eo.quais_atividades_culturais,
      eo.motivo_participacao,
      eo.created_at as expectativas_objetivos_created_at,
      eo.updated_at as expectativas_objetivos_updated_at
    FROM aluno a
    LEFT JOIN expectativas_e_objetivos eo ON a.id = eo.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      expectativas_e_objetivos: result.expectativas_objetivos_id
        ? {
            id: result.expectativas_objetivos_id,
            expectativas_projeto: result.expectativas_projeto,
            ja_participou_atividades_culturais:
              result.ja_participou_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            motivo_participacao: result.motivo_participacao,
            created_at: result.expectativas_objetivos_created_at,
            updated_at: result.expectativas_objetivos_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno com expectativas e objetivos realizada com sucesso!",
    });
  });
};

export const getCompletoAbsoluto = (req, res) => {
  // ... (Sua função 'getCompletoAbsoluto' original)
  const q = `
    SELECT
      a.*,
      sf.id as situacao_familiar_id,
      sf.responsavel_criancas_0_6,
      sf.numero_filhos_dependentes,
      sf.situacao_trabalho,
      sf.renda_familiar,
      sf.programas_assistencia,
      sf.quantas_pessoas_moram,
      sf.quem_mora_com_voce,
      sf.frequenta_atividades_culturais,
      sf.quais_atividades_culturais,
      sf.created_at as situacao_familiar_created_at,
      sf.updated_at as situacao_familiar_updated_at,
      pe.id as perfil_educacional_id,
      pe.escolaridade_atual,
      pe.situacao_escolar,
      pe.turno_escolar,
      pe.instituicao_atual,
      pe.curso_atual,
      pe.semestre_periodo_atual,
      pe.area_interesse_profissional,
      pe.certificacoes_profissionais,
      pe.experiencia_profissional,
      pe.objetivos_educacionais,
      pe.dificuldades_aprendizagem,
      pe.observacoes,
      pe.created_at as perfil_educacional_created_at,
      pe.updated_at as perfil_educacional_updated_at,
      ba.id as barreiras_acesso_id,
      ba.meio_transporte,
      ba.tempo_deslocamento,
      ba.principais_dificuldades,
      ba.created_at as barreiras_acesso_created_at,
      ba.updated_at as barreiras_acesso_updated_at,
      eo.id as expectativas_objetivos_id,
      eo.expectativas_projeto,
      eo.ja_participou_atividades_culturais,
      eo.quais_atividades_culturais,
      eo.motivo_participacao,
      eo.created_at as expectativas_objetivos_created_at,
      eo.updated_at as expectativas_objetivos_updated_at
    FROM aluno a
    LEFT JOIN situacao_familiar sf ON a.id = sf.aluno_id
    LEFT JOIN perfil_educacional pe ON a.id = pe.aluno_id
    LEFT JOIN barreiras_acesso ba ON a.id = ba.aluno_id
    LEFT JOIN expectativas_e_objetivos eo ON a.id = eo.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      situacao_familiar: result.situacao_familiar_id
        ? {
            id: result.situacao_familiar_id,
            responsavel_criancas_0_6: result.responsavel_criancas_0_6,
            numero_filhos_dependentes: result.numero_filhos_dependentes,
            situacao_trabalho: result.situacao_trabalho,
            renda_familiar: result.renda_familiar,
            programas_assistencia: result.programas_assistencia,
            quantas_pessoas_moram: result.quantas_pessoas_moram,
            quem_mora_com_voce: result.quem_mora_com_voce,
            frequenta_atividades_culturais:
              result.frequenta_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            created_at: result.situacao_familiar_created_at,
            updated_at: result.situacao_familiar_updated_at,
          }
        : null,
      perfil_educacional: result.perfil_educacional_id
        ? {
            id: result.perfil_educacional_id,
            escolaridade_atual: result.escolaridade_atual,
            situacao_escolar: result.situacao_escolar,
            turno_escolar: result.turno_escolar,
            instituicao_atual: result.instituicao_atual,
            curso_atual: result.curso_atual,
            semestre_periodo_atual: result.semestre_periodo_atual,
            area_interesse_profissional: result.area_interesse_profissional,
            certificacoes_profissionais: result.certificacoes_profissionais,
            experiencia_profissional: result.experiencia_profissional,
            objetivos_educacionais: result.objetivos_educacionais,
            dificuldades_aprendizagem: result.dificuldades_aprendizagem,
            observacoes: result.observacoes,
            created_at: result.perfil_educacional_created_at,
            updated_at: result.perfil_educacional_updated_at,
          }
        : null,
      barreiras_acesso: result.barreiras_acesso_id
        ? {
            id: result.barreiras_acesso_id,
            meio_transporte: result.meio_transporte,
            tempo_deslocamento: result.tempo_deslocamento,
            principais_dificuldades: result.principais_dificuldades,
            created_at: result.barreiras_acesso_created_at,
            updated_at: result.barreiras_acesso_updated_at,
          }
        : null,
      expectativas_e_objetivos: result.expectativas_objetivos_id
        ? {
            id: result.expectativas_objetivos_id,
            expectativas_projeto: result.expectativas_projeto,
            ja_participou_atividades_culturais:
              result.ja_participou_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            motivo_participacao: result.motivo_participacao,
            created_at: result.expectativas_objetivos_created_at,
            updated_at: result.expectativas_objetivos_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno completo absoluto com todas as informações realizada com sucesso!",
    });
  });
};

export const getWithAvaliacaoBemEstar = (req, res) => {
  // ... (Sua função 'getWithAvaliacaoBemEstar' original)
  const q = `
    SELECT
      a.*,
      abe.id as avaliacao_bem_estar_id,
      abe.autoestima_atual,
      abe.satisfacao_vida,
      abe.possui_rede_apoio,
      abe.deseja_fortalecer_vinculos,
      abe.created_at as avaliacao_bem_estar_created_at,
      abe.updated_at as avaliacao_bem_estar_updated_at
    FROM aluno a
    LEFT JOIN avaliacao_bem_estar abe ON a.id = abe.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      avaliacao_bem_estar: result.avaliacao_bem_estar_id
        ? {
            id: result.avaliacao_bem_estar_id,
            autoestima_atual: result.autoestima_atual,
            satisfacao_vida: result.satisfacao_vida,
            possui_rede_apoio: result.possui_rede_apoio,
            deseja_fortalecer_vinculos: result.deseja_fortalecer_vinculos,
            created_at: result.avaliacao_bem_estar_created_at,
            updated_at: result.avaliacao_bem_estar_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno com avaliação de bem-estar realizada com sucesso!",
    });
  });
};

export const getWithTermosCondicoes = (req, res) => {
  // ... (Sua função 'getWithTermosCondicoes' original)
  const q = `
    SELECT
      a.*,
      tc.id as termos_id,
      tc.status_aceite,
      tc.versao_termos,
      tc.data_aceite,
      tc.ip_aceite,
      tc.observacoes as termos_observacoes,
      tc.created_at as termos_created_at,
      tc.updated_at as termos_updated_at
    FROM aluno a
    LEFT JOIN termos_condicoes tc ON a.id = tc.aluno_id
    WHERE a.id = ${req.params.id}
    ORDER BY tc.versao_termos DESC, tc.data_aceite DESC
    LIMIT 1
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      termos_condicoes: result.termos_id
        ? {
            id: result.termos_id,
            status_aceite: result.status_aceite,
            versao_termos: result.versao_termos,
            data_aceite: result.data_aceite,
            ip_aceite: result.ip_aceite,
            observacoes: result.termos_observacoes,
            created_at: result.termos_created_at,
            updated_at: result.termos_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno com termos e condições realizada com sucesso!",
    });
  });
};

export const getWithHistoricoNoProjeto = (req, res) => {
  // ... (Sua função 'getWithHistoricoNoProjeto' original)
  const q = `
    SELECT
      a.*,
      hnp.id as historico_projeto_id,
      hnp.ja_fez_aulas_antes,
      hnp.atualmente_faz_aulas,
      hnp.tempo_participacao,
      hnp.participou_outras_acoes,
      hnp.created_at as historico_projeto_created_at,
      hnp.updated_at as historico_projeto_updated_at
    FROM aluno a
    LEFT JOIN historico_no_projeto hnp ON a.id = hnp.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      historico_no_projeto: result.historico_projeto_id
        ? {
            id: result.historico_projeto_id,
            ja_fez_aulas_antes: result.ja_fez_aulas_antes,
            atualmente_faz_aulas: result.atualmente_faz_aulas,
            tempo_participacao: result.tempo_participacao,
            participou_outras_acoes: result.participou_outras_acoes,
            created_at: result.historico_projeto_created_at,
            updated_at: result.historico_projeto_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno com histórico no projeto realizada com sucesso!",
    });
  });
};

export const getSupremoDefinitivo = (req, res) => {
  // ... (Sua função 'getSupremoDefinitivo' original)
  const q = `
    SELECT
      a.*,
      sf.id as situacao_familiar_id,
      sf.responsavel_criancas_0_6,
      sf.numero_filhos_dependentes,
      sf.situacao_trabalho,
      sf.renda_familiar,
      sf.programas_assistencia,
      sf.quantas_pessoas_moram,
      sf.quem_mora_com_voce,
      sf.frequenta_atividades_culturais,
      sf.quais_atividades_culturais,
      sf.created_at as situacao_familiar_created_at,
      sf.updated_at as situacao_familiar_updated_at,
      pe.id as perfil_educacional_id,
      pe.escolaridade_atual,
      pe.situacao_escolar,
      pe.turno_escolar,
      pe.instituicao_atual,
      pe.curso_atual,
      pe.semestre_periodo_atual,
      pe.area_interesse_profissional,
      pe.certificacoes_profissionais,
      pe.experiencia_profissional,
      pe.objetivos_educacionais,
      pe.dificuldades_aprendizagem,
      pe.observacoes,
      pe.created_at as perfil_educacional_created_at,
      pe.updated_at as perfil_educacional_updated_at,
      ba.id as barreiras_acesso_id,
      ba.meio_transporte,
      ba.tempo_deslocamento,
      ba.principais_dificuldades,
      ba.created_at as barreiras_acesso_created_at,
      ba.updated_at as barreiras_acesso_updated_at,
      eo.id as expectativas_objetivos_id,
      eo.expectativas_projeto,
      eo.ja_participou_atividades_culturais,
      eo.quais_atividades_culturais,
      eo.motivo_participacao,
      eo.created_at as expectativas_objetivos_created_at,
      eo.updated_at as expectativas_objetivos_updated_at,
      abe.id as avaliacao_bem_estar_id,
      abe.autoestima_atual,
      abe.satisfacao_vida,
      abe.possui_rede_apoio,
      abe.deseja_fortalecer_vinculos,
      abe.created_at as avaliacao_bem_estar_created_at,
      abe.updated_at as avaliacao_bem_estar_updated_at,
      hnp.id as historico_projeto_id,
      hnp.ja_fez_aulas_antes,
      hnp.atualmente_faz_aulas,
      hnp.tempo_participacao,
      hnp.participou_outras_acoes,
      hnp.created_at as historico_projeto_created_at,
      hnp.updated_at as historico_projeto_updated_at,
      tc.id as termos_id,
      tc.status_aceite,
      tc.versao_termos,
      tc.data_aceite,
      tc.ip_aceite,
      tc.observacoes as termos_observacoes,
      tc.created_at as termos_created_at,
      tc.updated_at as termos_updated_at
    FROM aluno a
    LEFT JOIN situacao_familiar sf ON a.id = sf.aluno_id
    LEFT JOIN perfil_educacional pe ON a.id = pe.aluno_id
    LEFT JOIN barreiras_acesso ba ON a.id = ba.aluno_id
    LEFT JOIN expectativas_e_objetivos eo ON a.id = eo.aluno_id
    LEFT JOIN avaliacao_bem_estar abe ON a.id = abe.aluno_id
    LEFT JOIN historico_no_projeto hnp ON a.id = hnp.aluno_id
    LEFT JOIN (
      SELECT DISTINCT ON (aluno_id)
        aluno_id, id, status_aceite, versao_termos, data_aceite,
        ip_aceite, observacoes, created_at, updated_at
      FROM termos_condicoes
      ORDER BY aluno_id, versao_termos DESC, data_aceite DESC
    ) tc ON a.id = tc.aluno_id
    WHERE a.id = ${req.params.id}
  `;
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    const result = data?.rows?.[0] || data[0];
    if (!result) {
      return res.status(404).json({ message: "Aluno não encontrado!" });
    }
    const aluno = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      telefone: result.telefone,
      matricula: result.matricula,
      qr_code: result.qr_code,
      idade: result.idade,
      blusa: result.blusa,
      calca: result.calca,
      calcado: result.calcado,
      sexo: result.sexo,
      identidade_genero: result.identidade_genero,
      responsavel_id: result.responsavel_id,
      situacao_familiar: result.situacao_familiar_id
        ? {
            id: result.situacao_familiar_id,
            responsavel_criancas_0_6: result.responsavel_criancas_0_6,
            numero_filhos_dependentes: result.numero_filhos_dependentes,
            situacao_trabalho: result.situacao_trabalho,
            renda_familiar: result.renda_familiar,
            programas_assistencia: result.programas_assistencia,
            quantas_pessoas_moram: result.quantas_pessoas_moram,
            quem_mora_com_voce: result.quem_mora_com_voce,
            frequenta_atividades_culturais:
              result.frequenta_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            created_at: result.situacao_familiar_created_at,
            updated_at: result.situacao_familiar_updated_at,
          }
        : null,
      perfil_educacional: result.perfil_educacional_id
        ? {
            id: result.perfil_educacional_id,
            escolaridade_atual: result.escolaridade_atual,
            situacao_escolar: result.situacao_escolar,
            turno_escolar: result.turno_escolar,
            instituicao_atual: result.instituicao_atual,
            curso_atual: result.curso_atual,
            semestre_periodo_atual: result.semestre_periodo_atual,
            area_interesse_profissional: result.area_interesse_profissional,
            certificacoes_profissionais: result.certificacoes_profissionais,
            experiencia_profissional: result.experiencia_profissional,
            objetivos_educacionais: result.objetivos_educacionais,
            dificuldades_aprendizagem: result.dificuldades_aprendizagem,
            observacoes: result.observacoes,
            created_at: result.perfil_educacional_created_at,
            updated_at: result.perfil_educacional_updated_at,
          }
        : null,
      barreiras_acesso: result.barreiras_acesso_id
        ? {
            id: result.barreiras_acesso_id,
            meio_transporte: result.meio_transporte,
            tempo_deslocamento: result.tempo_deslocamento,
            principais_dificuldades: result.principais_dificuldades,
            created_at: result.barreiras_acesso_created_at,
            updated_at: result.barreiras_acesso_updated_at,
          }
        : null,
      expectativas_e_objetivos: result.expectativas_objetivos_id
        ? {
            id: result.expectativas_objetivos_id,
            expectativas_projeto: result.expectativas_projeto,
            ja_participou_atividades_culturais:
              result.ja_participou_atividades_culturais,
            quais_atividades_culturais: result.quais_atividades_culturais,
            motivo_participacao: result.motivo_participacao,
            created_at: result.expectativas_objetivos_created_at,
            updated_at: result.expectativas_objetivos_updated_at,
          }
        : null,
      avaliacao_bem_estar: result.avaliacao_bem_estar_id
        ? {
            id: result.avaliacao_bem_estar_id,
            autoestima_atual: result.autoestima_atual,
            satisfacao_vida: result.satisfacao_vida,
            possui_rede_apoio: result.possui_rede_apoio,
            deseja_fortalecer_vinculos: result.deseja_fortalecer_vinculos,
            created_at: result.avaliacao_bem_estar_created_at,
            updated_at: result.avaliacao_bem_estar_updated_at,
          }
        : null,
      historico_no_projeto: result.historico_projeto_id
        ? {
            id: result.historico_projeto_id,
            ja_fez_aulas_antes: result.ja_fez_aulas_antes,
            atualmente_faz_aulas: result.atualmente_faz_aulas,
            tempo_participacao: result.tempo_participacao,
            participou_outras_acoes: result.participou_outras_acoes,
            created_at: result.historico_projeto_created_at,
            updated_at: result.historico_projeto_updated_at,
          }
        : null,
      termos_condicoes: result.termos_id
        ? {
            id: result.termos_id,
            status_aceite: result.status_aceite,
            versao_termos: result.versao_termos,
            data_aceite: result.data_aceite,
            ip_aceite: result.ip_aceite,
            observacoes: result.termos_observacoes,
            created_at: result.termos_created_at,
            updated_at: result.termos_updated_at,
          }
        : null,
    };
    return res.status(200).json({
      aluno,
      message:
        "Consulta de aluno supremo definitivo com TODAS as 8 informações realizada com sucesso!",
    });
  });
};

// --- NOVA ROTA DE APROVAÇÃO ---
export const aprovarAlunoEGerarMatricula = async (req, res) => {
  const { id } = req.params;
  const alunoId = parseInt(id, 10);

  if (!alunoId) {
    return res.status(400).json({ message: "ID do aluno é inválido." });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Verificar se o aluno existe e se já não tem matrícula
    const alunoQuery = "SELECT matricula FROM aluno WHERE id = $1";
    const alunoResult = await client.query(alunoQuery, [alunoId]);
    const aluno = alunoResult.rows?.[0];

    if (!aluno) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Aluno não encontrado." });
    }

    if (aluno.matricula) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Este aluno já possui uma matrícula.",
        matricula: aluno.matricula,
      });
    }

    // 2. Gerar a Matrícula de 5 caracteres
    // Usa Base36 (0-9, A-Z) e preenche com zeros à esquerda
    const novaMatricula = alunoId.toString(36).toUpperCase().padStart(5, "0");

    // 3. Gerar o Código de Barras 1D usando a Matrícula
    const barcodeDataURL = await gerarBarcode1D(novaMatricula);
    if (!barcodeDataURL) {
      throw new Error("Falha ao gerar a imagem do código de barras.");
    }

    // 4. Salvar a Matrícula e o Código de Barras no aluno
    const updateAlunoQuery = `
      UPDATE aluno SET matricula = $1, qr_code = $2 WHERE id = $3
    `;
    await client.query(updateAlunoQuery, [
      novaMatricula,
      barcodeDataURL,
      alunoId,
    ]);

    // 5. Commit e sucesso
    await client.query("COMMIT");

    return res.status(200).json({
      message: "Aluno aprovado com sucesso!",
      alunoId: alunoId,
      matricula: novaMatricula,
      barcode: barcodeDataURL,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao aprovar aluno:", error);
    return res.status(500).json({
      message: "Erro interno do servidor ao aprovar aluno.",
      details: error.message,
    });
  } finally {
    client.release();
  }
};
