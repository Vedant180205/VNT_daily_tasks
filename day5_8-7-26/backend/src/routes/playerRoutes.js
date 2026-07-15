const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const validatePlayer = require("../middleware/validatePlayer");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { playerUploads } = require("../middleware/uploadMiddleware");

router.post("/", authMiddleware, requirePermission('create_players'), playerUploads, validatePlayer, playerController.createPlayer);
router.get("/", authMiddleware, requirePermission('view_players'), playerController.getPlayers);
router.get("/:id", authMiddleware, requirePermission('view_players'), playerController.getPlayer);
router.put("/:id", authMiddleware, requirePermission('edit_players'), playerUploads, validatePlayer, playerController.updatePlayer);
router.delete("/:id", authMiddleware, requirePermission('delete_players'), playerController.deletePlayer);

module.exports = router;
