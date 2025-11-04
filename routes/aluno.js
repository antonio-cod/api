import express from "express";
import {
  criarTabelaAluno,
  get,
  getById,
  add,
  addCompleto,
  update,
  delet,
  getWithSituacaoFamiliar,
  getWithPerfilEducacional,
  getWithBarreirasAcesso,
  getWithExpectativasObjetivos,
  getWithAvaliacaoBemEstar,
  getWithHistoricoNoProjeto,
  getWithTermosCondicoes,
  getCompleto,
  getCompletoTudo,
  getCompletoAbsoluto,
  getSupremoDefinitivo,
} from "../controllers/aluno.js";
const router = express.Router();

router.get(
  "/criar-tabela",
  (req, res) => criarTabelaAluno() || res.json({ ok: true })
);
router.get("/", get);
router.get("/:id", getById);
router.get("/:id/situacao-familiar", getWithSituacaoFamiliar);
router.get("/:id/perfil-educacional", getWithPerfilEducacional);
router.get("/:id/barreiras-acesso", getWithBarreirasAcesso);
router.get("/:id/expectativas-objetivos", getWithExpectativasObjetivos);
router.get("/:id/avaliacao-bem-estar", getWithAvaliacaoBemEstar);
router.get("/:id/historico-no-projeto", getWithHistoricoNoProjeto);
router.get("/:id/termos-condicoes", getWithTermosCondicoes);
router.get("/:id/completo", getCompleto);
router.get("/:id/completo-tudo", getCompletoTudo);
router.get("/:id/completo-absoluto", getCompletoAbsoluto);
router.get("/:id/supremo-definitivo", getSupremoDefinitivo);
router.post("/", add);
router.post("/completo", addCompleto);
router.put("/:id", update);
router.delete("/:id", delet);

export default router;
