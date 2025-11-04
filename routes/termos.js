import express from "express";
import {
  criarTabelaTermos,
  get,
  getAtivos,
  getAtivoAtual,
  getById,
  getByVersao,
  getAtual,
  add,
  update,
  ativar,
  delet,
  getOpcoes,
  criarTermoPadrao,
  aceitarTermo,
  aceitarTermoAtivoAtual,
} from "../controllers/termos.js";

const router = express.Router();

router.get(
  "/criar-tabela",
  (req, res) => criarTabelaTermos() || res.json({ ok: true })
);
router.get("/criar-padrao", (req, res) => {
  try {
    const termo = criarTermoPadrao();
    res.json({ message: "Termo padrão criado!", termo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/opcoes", getOpcoes);
router.get("/ativos", getAtivos);
router.get("/ativo-atual", getAtivoAtual);
router.get("/atual", getAtual);
router.get("/", get);
router.get("/:id", getById);
router.get("/versao/:versao", getByVersao);
router.post("/", add);
router.post("/aceitar/:alunoId/:termoId", aceitarTermo);
router.post("/aceitar-atual/:alunoId", aceitarTermoAtivoAtual);
router.put("/:id", update);
router.put("/:id/ativar", ativar);
router.delete("/:id", delet);

export default router;
