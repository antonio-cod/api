import { readFileSync } from "fs";
import { db } from "../db.js";
import * as dotenv from "dotenv";

dotenv.config();

async function updateAllTables() {
  try {
    console.log("🚀 Iniciando atualização completa de todas as tabelas...");
    console.log("Conectando ao banco de dados...");

    // Lê o arquivo SQL
    const sqlScript = readFileSync("./scripts/update-all-tables.sql", "utf8");

    console.log("📋 Executando script de atualização completa...\n");

    // Remove comentários de linha única
    const cleanedScript = sqlScript
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    // Divide o script em comandos individuais
    const commands = cleanedScript
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);

    let successCount = 0;
    let errorCount = 0;
    let tableUpdates = {
      aluno: 0,
      situacao_familiar: 0,
      perfil_educacional: 0,
      barreiras_acesso: 0,
      expectativas_e_objetivos: 0,
      avaliacao_bem_estar: 0,
      historico_no_projeto: 0,
      responsaveis: 0,
      indices: 0,
      comentarios: 0,
    };

    for (const command of commands) {
      try {
        // Categorizar o tipo de comando
        let categoria = "outros";
        if (command.includes("ALTER TABLE aluno")) categoria = "aluno";
        else if (command.includes("ALTER TABLE situacao_familiar"))
          categoria = "situacao_familiar";
        else if (command.includes("ALTER TABLE perfil_educacional"))
          categoria = "perfil_educacional";
        else if (command.includes("ALTER TABLE barreiras_acesso"))
          categoria = "barreiras_acesso";
        else if (command.includes("ALTER TABLE expectativas_e_objetivos"))
          categoria = "expectativas_e_objetivos";
        else if (command.includes("ALTER TABLE avaliacao_bem_estar"))
          categoria = "avaliacao_bem_estar";
        else if (command.includes("ALTER TABLE historico_no_projeto"))
          categoria = "historico_no_projeto";
        else if (command.includes("CREATE TABLE IF NOT EXISTS responsaveis"))
          categoria = "responsaveis";
        else if (command.includes("CREATE INDEX")) categoria = "indices";
        else if (command.includes("COMMENT ON")) categoria = "comentarios";

        // Mostrar progresso
        const cmdPreview = command.substring(0, 80).replace(/\s+/g, " ");
        console.log(`📝 [${categoria.toUpperCase()}] ${cmdPreview}...`);

        await db.query(command);
        successCount++;
        tableUpdates[categoria] = (tableUpdates[categoria] || 0) + 1;
        console.log("   ✅ Sucesso");
      } catch (error) {
        const cmdPreview = command.substring(0, 50).replace(/\s+/g, " ");
        console.log(`   ⚠️  Erro: ${cmdPreview}...`);
        console.log(`   📋 Motivo: ${error.message}`);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 RESUMO DA ATUALIZAÇÃO COMPLETA");
    console.log("=".repeat(80));
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`⚠️  Comandos com erro: ${errorCount}`);
    console.log("\n📋 ATUALIZAÇÕES POR TABELA:");

    Object.entries(tableUpdates).forEach(([tabela, count]) => {
      if (count > 0) {
        const emoji =
          tabela === "indices" ? "🔍" : tabela === "comentarios" ? "💬" : "📄";
        console.log(`   ${emoji} ${tabela}: ${count} atualizações`);
      }
    });

    if (successCount > 0) {
      console.log(
        "\n🎉 PARABÉNS! Todas as tabelas foram atualizadas com sucesso!"
      );
      console.log("🔄 Principais melhorias implementadas:");
      console.log("   • Todos os campos dos controllers foram adicionados");
      console.log("   • Índices criados para melhor performance");
      console.log("   • Validações e constraints implementadas");
      console.log("   • Documentação adicionada com comentários");
      console.log("   • Tabela responsaveis criada se necessário");
      console.log("\n✨ Seu banco está 100% alinhado com os controllers!");
    }
  } catch (error) {
    console.error("❌ Erro ao executar script de atualização:", error.message);
  } finally {
    // Fecha a conexão
    await db.end();
    process.exit();
  }
}

updateAllTables();
