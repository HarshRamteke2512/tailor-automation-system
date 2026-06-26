package Tailor.demo.client;

import Tailor.demo.entity.Order;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Component
public class PythonFastApiClient {

    private final RestTemplate restTemplate = new RestTemplate();

    private final String PYTHON_SERVER_URL = System.getenv().getOrDefault("PYTHON_SERVER_URL", "http://localhost:8000");

    @Async
    public void triggerStatusNotification(Order order) {
        String targetUrl = PYTHON_SERVER_URL + "/api/notify/status-update";

        Map<String, Object> payload = new HashMap<>();
        payload.put("token_id", order.getToken());
        payload.put("customer_name", order.getCustomerName());
        payload.put("customer_phone", order.getPhone());
        payload.put("garment_type", order.getGarmentType());
        payload.put("current_status", order.getStatus());
        payload.put("pending_balance", order.getTotalAmount() != null ? String.valueOf(order.getTotalAmount()) : "0");

        try {
            restTemplate.postForObject(targetUrl, payload, String.class);
            System.out.println("✅ Status notification sent to Python for Order #" + order.getOrderId());
        } catch (Exception e) {
            System.err.println("❌ Failed to reach Python Notification Engine: " + e.getMessage());
        }
    }

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