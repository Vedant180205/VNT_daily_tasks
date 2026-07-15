const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const validatePlayer = require("../middleware/validatePlayer");
const authMiddleware = require("../middleware/authMiddleware");
const { playerUploads, csvUpload } = require("../middleware/uploadMiddleware");

router.post("/upload", authMiddleware, csvUpload, playerController.uploadCSV);
router.get("/upload/:id/status", authMiddleware, playerController.getUploadStatus);

router.post("/", authMiddleware, playerUploads, validatePlayer, playerController.createPlayer);
router.get("/", playerController.getPlayers);
router.get("/:id", playerController.getPlayer);
router.put("/:id", authMiddleware, playerUploads, validatePlayer, playerController.updatePlayer);
router.delete("/:id", authMiddleware, playerController.deletePlayer);

module.exports = router;
