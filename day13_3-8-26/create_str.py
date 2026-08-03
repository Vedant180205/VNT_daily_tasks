from pathlib import Path

ROOT = Path(r"C:\Users\vedant\Desktop\VNT_tasks\VNT_daily_tasks\day2_3-7-26")

folders = [
    "backend/src/config",
    "backend/src/controllers",
    "backend/src/middleware",
    "backend/src/models",
    "backend/src/routes",
    "backend/src/services",
    "backend/src/utils",
    "backend/migrations",
    "backend/postman",
    "frontend",
]

files = [
    # Backend
    "backend/src/app.js",
    "backend/src/server.js",

    "backend/src/config/db.js",

    "backend/src/controllers/playerController.js",

    "backend/src/middleware/logger.js",
    "backend/src/middleware/validatePlayer.js",
    "backend/src/middleware/errorHandler.js",
    "backend/src/middleware/notFound.js",

    "backend/src/models/playerModel.js",

    "backend/src/routes/playerRoutes.js",

    "backend/src/services/playerService.js",

    "backend/src/utils/response.js",

    "backend/migrations/001_create_players.sql",

    "backend/.env",
    "backend/.env.example",
    "backend/.gitignore",
    "backend/package.json",
    "backend/README.md",

    # Root
    "README.md",
]

for folder in folders:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)

for file in files:
    path = ROOT / file
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.touch()

print("Project structure created successfully!")