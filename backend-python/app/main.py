import os
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from PIL import Image
import io

# Import our database infrastructure modules
from app.database import get_db, engine, Base
from app.models import FabricImage

app = FastAPI(title="Tailor Shop Automation - Media Locker")

# Create the database tables automatically if they don't exist yet
Base.metadata.create_all(bind=engine)

# Constant limits
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")


def dispatch_customer_notification(order_id: int):
    """
    Placeholder service for the automated alert layer.
    This runs right after a successful DB commit.
    """
    # TODO: Integrate Twilio or an SMS gateway here later
    print(f"[NOTIFICATION SERVICE] Triggered alert for Order #{order_id}: Fabric image verified.")
    return True


@app.get("/")
def read_root():
    return {"status": "Python Media & Notification Service Online"}


@app.post("/api/media/upload", status_code=status.HTTP_201_CREATED)
async def upload_fabric_image(
        token_id: int = Form(...),
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    # 1. Edge Case Protection: Validate File Content Type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided must be an image format."
        )

    # 2. Edge Case Protection: Enforce 5MB Maximum File Size Limit
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the strict 5MB maximum limit."
        )

    try:
        # 3. Compress and optimize the physical image file
        image = Image.open(io.BytesIO(image_bytes))

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        # 4. Cash Busting: Append a timestamp chunk to prevent filename collisions
        timestamp = int(time.time())
        target_filename = f"{token_id}_{timestamp}_fabric.jpg"
        target_path = os.path.join(UPLOAD_DIR, target_filename)

        # Save with optimization settings
        image.save(target_path, "JPEG", quality=75)

        web_url_path = f"/static/uploads/{target_filename}"

        # 5. Database Commit: Write record to PostgreSQL
        new_image_record = FabricImage(
            order_id=token_id,
            image_path=web_url_path
        )
        db.add(new_image_record)
        db.commit()
        db.refresh(new_image_record)

        # 6. Notification Dispatch: Fire an automatic notification trigger event
        dispatch_customer_notification(token_id)

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