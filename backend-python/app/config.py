from app.shop_details import (
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_API_VERSION,
    WHATSAPP_TEMPLATE_NAME,
)

META_GRAPH_URL = (
    f"https://graph.facebook.com/{WHATSAPP_API_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    if WHATSAPP_PHONE_NUMBER_ID
    else ""
)
