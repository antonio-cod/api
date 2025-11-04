import express from "express";
import {
  criarTabelaBarreirasAcesso,
  get,
  getById,
  getByAlunoId,
  add,
  update,
  delet,
  getEnumOptions,
} from "../controllers/barreiras_acesso.js";
const router = express.Router();

router.get(
  "/criar-tabela",
  (req, res) => criarTabelaBarreirasAcesso() || res.json({ ok: true })
);
router.get("/opcoes", getEnumOptions);
router.get("/", get);
router.get("/:id", getById);
router.get("/aluno/:alunoId", getByAlunoId);
router.post("/", add);
router.put("/:id", update);
router.delete("/:id", delet);

export default router;
