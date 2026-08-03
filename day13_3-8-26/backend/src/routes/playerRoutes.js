const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const validatePlayer = require("../middleware/validatePlayer");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");
const { playerUploads, csvUpload } = require("../middleware/uploadMiddleware");

const cacheMiddleware = require("../middleware/cacheMiddleware");
const idempotencyMiddleware = require("../middleware/idempotencyMiddleware");

router.post("/upload", authMiddleware, requirePermission('create_players'), csvUpload, playerController.uploadCSV);
router.get("/upload/:id/status", authMiddleware, requirePermission('create_players'), playerController.getUploadStatus);

router.post("/", authMiddleware, requirePermission('create_players'), playerUploads, validatePlayer, idempotencyMiddleware(5), playerController.createPlayer);
router.get("/", authMiddleware, requirePermission('view_players'), cacheMiddleware(60), playerController.getPlayers);
router.get("/:id", authMiddleware, requirePermission('view_players'), cacheMiddleware(60), playerController.getPlayer);
router.put("/:id", authMiddleware, requirePermission('edit_players'), playerUploads, validatePlayer, idempotencyMiddleware(5), playerController.updatePlayer);
router.delete("/:id", authMiddleware, requirePermission('delete_players'), playerController.deletePlayer);

module.exports = router;
