import { readFileSync } from "fs";
import { db } from "../db.js";
import * as dotenv from "dotenv";

dotenv.config();

async function initDatabase() {
  try {
    console.log("Conectando ao banco de dados...");

    // Lê o arquivo SQL
    let sqlScript = readFileSync("./init-db/01-create-tables.sql", "utf8");

    console.log("Executando script de criação das tabelas...");

    // Remove comentários de linha única
    sqlScript = sqlScript
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    // Divide o script em comandos individuais
    const commands = sqlScript
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const command of commands) {
      try {
        // Pula comandos INSERT que referenciam tabelas que podem não existir
        if (command.toUpperCase().includes("INSERT INTO usuario")) {
          console.log(
            "⚠️  Pulando INSERT na tabela usuario (tabela não existe)"
          );
          continue;
        }

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
  } catch (error) {
    console.error("❌ Erro ao executar script:", error.message);
  } finally {
    // Fecha a conexão
    await db.end();
    process.exit();
  }
}

initDatabase();
