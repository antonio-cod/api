import { readFileSync } from "fs";
import { db } from "../db.js";
import * as dotenv from "dotenv";

dotenv.config();

async function addPerfilEducacionalColumns() {
  try {
    console.log("Conectando ao banco de dados...");

    // Lê o arquivo SQL
    const sqlScript = readFileSync(
      "./scripts/add-perfil-educacional-columns.sql",
      "utf8"
    );

    console.log(
      "Executando script para adicionar colunas na tabela perfil_educacional..."
    );

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

    for (const command of commands) {
      try {
        // Debug: mostra qual comando está sendo executado
        const cmdPreview = command.substring(0, 80).replace(/\s+/g, " ");
        console.log(`Executando: ${cmdPreview}...`);

        await db.query(command);
        successCount++;
        console.log("✅ Sucesso");
      } catch (error) {
        const cmdPreview = command.substring(0, 50).replace(/\s+/g, " ");
        console.log(`⚠️  Erro no comando: ${cmdPreview}...`);
        console.log(`   ${error.message}`);
        errorCount++;
      }
    }

    console.log(
      `\n📊 Resumo: ${successCount} comandos executados com sucesso, ${errorCount} erros.`
    );

    if (successCount > 0) {
      console.log("\n🎉 Tabela perfil_educacional atualizada com sucesso!");
      console.log("Novas colunas adicionadas:");
      console.log("- escolaridade_atual, situacao_escolar, turno_escolar");
      console.log("- instituicao_atual, semestre_periodo_atual");
      console.log("- area_interesse_profissional, certificacoes_profissionais");
      console.log("- experiencia_profissional, objetivos_educacionais");
      console.log("- dificuldades_aprendizagem, observacoes");
    }
  } catch (error) {
    console.error("❌ Erro ao executar script:", error.message);
  } finally {
    // Fecha a conexão
    await db.end();
    process.exit();
  }
}

addPerfilEducacionalColumns();
