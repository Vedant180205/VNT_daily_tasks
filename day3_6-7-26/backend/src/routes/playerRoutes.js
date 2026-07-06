const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const validatePlayer = require("../middleware/validatePlayer");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, validatePlayer, playerController.createPlayer);
router.get("/", playerController.getPlayers);
router.get("/:id", playerController.getPlayer);
router.put("/:id", authMiddleware, validatePlayer, playerController.updatePlayer);
router.delete("/:id", authMiddleware, playerController.deletePlayer);

module.exports = router;
