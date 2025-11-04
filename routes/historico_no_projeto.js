import express from "express";
import {
  criarTabelaHistoricoNoProjeto,
  get,
  getById,
  getByAlunoId,
  add,
  update,
  delet,
  getOpcoes,
} from "../controllers/historico_no_projeto.js";

const router = express.Router();

router.get(
  "/criar-tabela",
  (req, res) => criarTabelaHistoricoNoProjeto() || res.json({ ok: true })
);
router.get("/opcoes", getOpcoes);
router.get("/", get);
router.get("/:id", getById);
router.get("/aluno/:alunoId", getByAlunoId);
router.post("/", add);
router.put("/:id", update);
router.delete("/:id", delet);

export default router;
