from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class FabricImage(Base):
    __tablename__ = "fabric_images"

    image_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, index=True)  # This maps to the 4-digit token ID
    image_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)