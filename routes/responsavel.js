import express from "express";
import {
  criarTabelaResponsavel,
  get,
  getById,
  add,
  update,
  delet,
  getAlunosByResponsavel,
  getEnumOptions,
} from "../controllers/responsavel.js";
const router = express.Router();

router.get(
  "/criar-tabela",
  (req, res) => criarTabelaResponsavel() || res.json({ ok: true })
);
router.get("/opcoes", getEnumOptions);
router.get("/", get);
router.get("/:id", getById);
router.get("/:id/alunos", getAlunosByResponsavel);
router.post("/", add);
router.put("/:id", update);
router.delete("/:id", delet);

export default router;
