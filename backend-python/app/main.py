import os
import time
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from PIL import Image
import io
import httpx

from app.database import get_db, engine, Base
from app.models import FabricImage
from app.config import WHATSAPP_ACCESS_TOKEN, META_GRAPH_URL, WHATSAPP_TEMPLATE_NAME
from app.shop_details import MAX_FILE_SIZE_MB

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tailor-python")

app = FastAPI(title="Tailor Shop Automation - Media & Notification Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")


async def send_whatsapp_template(phone: str, params: dict):
    if not WHATSAPP_ACCESS_TOKEN or not META_GRAPH_URL.startswith("https://"):
        logger.info(f"[WHATSAPP DRY-RUN] Would notify {phone}: {params}")
        return {"status": "dry_run", "message": "WhatsApp not configured"}

    body = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "template",
        "template": {
            "name": WHATSAPP_TEMPLATE_NAME,
            "language": {"code": "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": params.get("customer_name", "")},
                        {"type": "text", "text": params.get("garment_type", "")},
                        {"type": "text", "text": params.get("token_id", "")},
                    ],
                }
            ],
        },
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            META_GRAPH_URL,
            headers={
                "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            json=body,
        )

    if resp.is_error:
        logger.error(f"[WHATSAPP] API error for {phone}: {resp.text}")
        return {"status": "error", "detail": resp.text}

    logger.info(f"[WHATSAPP] Message sent to {phone}: {resp.json()}")
    return {"status": "sent", "response": resp.json()}


@app.get("/")
def read_root():
    return {"status": "Python Media & Notification Service Online"}


@app.post("/api/notify/status-update")
async def notify_status_update(payload: dict):
    phone = payload.get("customer_phone", "")
    if not phone:
        raise HTTPException(status_code=400, detail="customer_phone is required")

    result = await send_whatsapp_template(phone, payload)
    return {
        "notification_id": f"ntf_{int(time.time())}",
        "gateway_status": result["status"],
        "target_channel": "WhatsApp",
    }


@app.post("/api/media/cleanup")
async def media_cleanup(payload: dict):
    token_id = payload.get("token_id") or payload.get("order_id")
    if not token_id:
        raise HTTPException(status_code=400, detail="token_id or order_id is required")

    import glob
    pattern = os.path.join(UPLOAD_DIR, f"{token_id}_*")
    removed = 0
    for f in glob.glob(pattern):
        os.remove(f)
        removed += 1

    logger.info(f"[CLEANUP] Removed {removed} file(s) for token {token_id}")
    return {"status": "success", "message": f"Storage cleaned for Token #{token_id}"}


@app.post("/api/media/upload", status_code=status.HTTP_201_CREATED)
async def upload_fabric_image(
        token_id: int = Form(...),
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided must be an image format."
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the strict 5MB maximum limit."
        )

    try:
        image = Image.open(io.BytesIO(image_bytes))

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        timestamp = int(time.time())
        target_filename = f"{token_id}_{timestamp}_fabric.jpg"
        target_path = os.path.join(UPLOAD_DIR, target_filename)

        image.save(target_path, "JPEG", quality=75)

        web_url_path = f"/static/uploads/{target_filename}"

        new_image_record = FabricImage(
            order_id=token_id,
            image_path=web_url_path
        )
        db.add(new_image_record)
        db.commit()
        db.refresh(new_image_record)

        return {
            "status": "success",
            "image_id": new_image_record.image_id,
            "token_id": token_id,
            "image_url": web_url_path
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database or media processing pipeline failure: {str(e)}"
        )