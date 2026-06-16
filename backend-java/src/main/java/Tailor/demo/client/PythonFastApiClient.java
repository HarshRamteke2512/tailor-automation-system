package Tailor.demo.client;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Component
public class PythonFastApiClient {

    // Spring's built-in tool for making HTTP REST calls
    private final RestTemplate restTemplate = new RestTemplate();
    
    // TODO: Update this to match your teammate's FastAPI server address
    private final String PYTHON_SERVER_URL = "http://localhost:8000";

    // ---------------------------------------------------------
    // TRIGGER 1: WhatsApp Notification (Fire and Forget)
    // ---------------------------------------------------------
    @Async
    public void triggerWhatsAppNotification(String customerPhone, Long orderId) {
        String targetUrl = PYTHON_SERVER_URL + "/api/notifications/whatsapp";

        // Build the JSON map to send to Python
        Map<String, Object> payload = new HashMap<>();
        payload.put("phone", customerPhone);
        payload.put("message", "Great news! Your tailor order #" + orderId + " is READY FOR PICKUP!");

        try {
            // Make the POST request
            restTemplate.postForObject(targetUrl, payload, String.class);
            System.out.println("✅ WhatsApp trigger sent to Python for Order #" + orderId);
        } catch (Exception e) {
            System.err.println("❌ Failed to reach Python Notification Engine: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // TRIGGER 2: Image Cleanup Webhook (Asynchronous)
    // ---------------------------------------------------------
    @Async
    public void triggerImageCleanup(Long orderId) {
        String targetUrl = PYTHON_SERVER_URL + "/api/media/cleanup";

        Map<String, Object> payload = new HashMap<>();
        payload.put("order_id", orderId);

        try {
            restTemplate.postForObject(targetUrl, payload, String.class);
            System.out.println("✅ Cleanup webhook fired for Order #" + orderId);
        } catch (Exception e) {
            System.err.println("❌ Failed to reach Python Media Service: " + e.getMessage());
        }
    }
}