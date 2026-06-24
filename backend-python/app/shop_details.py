import os
from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────────
# TAILOR SHOP — Central Configuration
# Edit values here to configure the entire system
# Values from .env take precedence over defaults below
# ──────────────────────────────────────────────

# ── PostgreSQL Database ──
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "tailor-automation-system")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Madhu@1006")

# ── WhatsApp Cloud API (Meta) ──
# Get these from https://developers.facebook.com
# Leave empty for dry-run mode (logs messages, doesn't send)
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_API_VERSION = os.getenv("WHATSAPP_API_VERSION", "v22.0")
WHATSAPP_TEMPLATE_NAME = os.getenv("WHATSAPP_TEMPLATE_NAME", "order_ready_for_pickup")

# ── File Upload Limits ──
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "5"))
