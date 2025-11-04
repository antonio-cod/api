import express from "express";
import cors from "cors";
import alunoRoutes from "./routes/aluno.js";
import aulaRoutes from "./routes/aula.js";
import inscricaoRoutes from "./routes/inscricao.js";
import presencaRoutes from "./routes/presenca.js";
import authRoutes from "./routes/auth.js";
import responsavelRoutes from "./routes/responsavel.js";
import situacaoFamiliarRoutes from "./routes/situacao_familiar.js";
import perfilEducacionalRoutes from "./routes/perfil_educacional.js";
import barreirasAcessoRoutes from "./routes/barreiras_acesso.js";
import expectativasObjetivosRoutes from "./routes/expectativas_e_objetivos.js";
import avaliacaoBemEstarRoutes from "./routes/avaliacao_bem_estar.js";
import historicoNoProjetoRoutes from "./routes/historico_no_projeto.js";
import termosRoutes from "./routes/termos.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/aluno", alunoRoutes);
app.use("/aula", aulaRoutes);
app.use("/inscricao", inscricaoRoutes);
app.use("/presenca", presencaRoutes);
app.use("/auth", authRoutes);
app.use("/responsavel", responsavelRoutes);
app.use("/situacao-familiar", situacaoFamiliarRoutes);
app.use("/perfil-educacional", perfilEducacionalRoutes);
app.use("/barreiras-acesso", barreirasAcessoRoutes);
app.use("/expectativas-objetivos", expectativasObjetivosRoutes);
app.use("/avaliacao-bem-estar", avaliacaoBemEstarRoutes);
app.use("/historico-no-projeto", historicoNoProjetoRoutes);
app.use("/termos", termosRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
