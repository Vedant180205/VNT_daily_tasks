const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const validatePlayer = require("../middleware/validatePlayer");

router.post("/", validatePlayer, playerController.createPlayer);
router.get("/", playerController.getPlayers);
router.get("/:id", playerController.getPlayer);
router.put("/:id", validatePlayer, playerController.updatePlayer);
router.delete("/:id", playerController.deletePlayer);

module.exports = router;
