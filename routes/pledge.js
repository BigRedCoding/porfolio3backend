const router = require("express").Router();

const {
  createPledge,
  getPledges,
  deletePledges,
} = require("../controllers/pledge.js");

router.post("/", createPledge);
router.get("/", getPledges);
router.delete("/", deletePledges);

module.exports = router;
