import os
from pathlib import Path

# ===== CONFIGURATION =====
BASE_PATH = Path(r"C:\Users\vedant\Desktop\VNT_tasks\day1_2-7-26")
# =========================

def create_structure(base: Path):
    """Create empty folder and file structure for frontend + backend."""

    # ---------- FRONTEND ----------
    frontend_root = base / "frontend"
    frontend_src = frontend_root / "src"

    frontend_dirs = [
        frontend_root / "public",
        frontend_src / "api",
        frontend_src / "components" / "common",
        frontend_src / "components" / "layout",
        frontend_src / "pages" / "InternalStatus",
        frontend_src / "hooks",
        frontend_src / "types",
        frontend_src / "utils",
        frontend_src / "styles",
    ]

    frontend_files = [
        frontend_src / "api" / "statusApi.ts",
        frontend_src / "components" / "common" / "Button.tsx",
        frontend_src / "components" / "common" / "Spinner.tsx",
        frontend_src / "components" / "common" / "StatusBadge.tsx",
        frontend_src / "components" / "layout" / "PageLayout.tsx",
        frontend_src / "pages" / "InternalStatus" / "InternalStatusPage.tsx",
        frontend_src / "pages" / "InternalStatus" / "InternalStatus.module.css",
        frontend_src / "pages" / "InternalStatus" / "types.ts",
        frontend_src / "hooks" / "useStatusData.ts",
        frontend_src / "types" / "status.types.ts",
        frontend_src / "utils" / "dateHelpers.ts",
        frontend_src / "styles" / "global.css",
        frontend_src / "App.tsx",
        frontend_src / "main.tsx",
        frontend_src / "vite-env.d.ts",
        frontend_root / "package.json",
        frontend_root / "tsconfig.json",
        frontend_root / "vite.config.ts",
        frontend_root / ".env",
        frontend_root / "index.html",
    ]

    # ---------- BACKEND ----------
    backend_root = base / "backend"
    backend_src = backend_root / "src"

    backend_dirs = [
        backend_src / "routes",
        backend_src / "controllers",
        backend_src / "services",
        backend_src / "config",
        backend_src / "models",
        backend_src / "middlewares",
        backend_src / "utils",
        backend_src / "tests",
    ]

    backend_files = [
        backend_src / "routes" / "status.routes.js",
        backend_src / "controllers" / "status.controller.js",
        backend_src / "services" / "db.service.js",
        backend_src / "config" / "db.config.js",
        backend_src / "models" / "index.js",
        backend_src / "middlewares" / "logger.js",
        backend_src / "utils" / "helpers.js",
        backend_src / "tests" / "status.test.js",
        backend_src / "app.js",
        backend_root / "package.json",
        backend_root / ".env",
        backend_root / "server.js",
    ]

    # Create directories
    for d in frontend_dirs + backend_dirs:
        d.mkdir(parents=True, exist_ok=True)
        print(f"📁 Created: {d}")

    # Create empty files
    for f in frontend_files + backend_files:
        f.touch(exist_ok=True)
        print(f"📄 Created: {f}")

    print("\n✅ Structure created successfully!")

if __name__ == "__main__":
    create_structure(BASE_PATH)