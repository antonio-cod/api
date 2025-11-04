import { readFileSync } from "fs";
import { db } from "../db.js";
import * as dotenv from "dotenv";

dotenv.config();

async function addAlunoColumns() {
  try {
    console.log("Conectando ao banco de dados...");

    // Lê o arquivo SQL
    const sqlScript = readFileSync("./scripts/add-aluno-columns.sql", "utf8");

    console.log("Executando script para adicionar colunas na tabela aluno...");

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
      console.log("\n🎉 Tabela aluno atualizada com sucesso!");
      console.log("Novas colunas adicionadas:");
      console.log("- matricula, qr_code, idade, blusa, calca, calcado");
      console.log("- sexo, identidade_genero, raca, cpf, rg, responsavel_id");
    }
  } catch (error) {
    console.error("❌ Erro ao executar script:", error.message);
  } finally {
    // Fecha a conexão
    await db.end();
    process.exit();
  }
}

addAlunoColumns();
