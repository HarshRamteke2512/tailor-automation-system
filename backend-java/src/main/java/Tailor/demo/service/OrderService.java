package Tailor.demo.service;

import Tailor.demo.entity.Order;
import Tailor.demo.repository.OrderRepository;
import Tailor.demo.client.PythonFastApiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // 1. This wires up your new Python messenger!
    @Autowired
    private PythonFastApiClient pythonClient;

    private static final int MAX_DAILY_HOURS = 40;

    // ---------------------------------------------------------
    // RULE 1: Experience-Driven Capacity Pool
    // ---------------------------------------------------------
    public Order createNewOrder(Order newOrder) {
        List<Order> existingOrders = orderRepository.findByDeliveryDate(newOrder.getDeliveryDate());
        int totalBookedHours = 0;
        for (Order existing : existingOrders) {
            totalBookedHours += existing.getEstHours();
        }
        if ((totalBookedHours + newOrder.getEstHours()) > MAX_DAILY_HOURS) {
            throw new RuntimeException("Shop capacity exceeded for this date! Total hours would be " 
                    + (totalBookedHours + newOrder.getEstHours()) + ". Please choose a different delivery date.");
        }
        return orderRepository.save(newOrder);
    }

    // ---------------------------------------------------------
    // RULE 2: Strict Workflow Transitions
    // ---------------------------------------------------------
    public Order moveOrderToProduction(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Error: Order not found!"));

        if (!"BOOKED".equals(order.getStatus())) {
            throw new RuntimeException("Wait! You can only move an order to IN_PRODUCTION if its current status is BOOKED.");
        }
        order.setStatus("IN_PRODUCTION");
        return orderRepository.save(order);
    }

    // ---------------------------------------------------------
    // NEW RULE 3: Ready For Pickup (Triggers WhatsApp)
    // ---------------------------------------------------------
    public Order markReadyForPickup(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));

        // Ensure it is coming from the workshop floor
        if (!"STITCHING_COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Status must be STITCHING_COMPLETED first.");
        }

        order.setStatus("READY_FOR_PICKUP");
        Order savedOrder = orderRepository.save(order);

        // 🔥 FIRE THE WEBHOOK TO PYTHON!
        // We pass the phone number directly from the linked Customer table
        pythonClient.triggerWhatsAppNotification(order.getCustomer().getPhone(), order.getOrderId());

        return savedOrder;
    }

    // ---------------------------------------------------------
    // NEW RULE 4: Delivered & Paid (Triggers Image Deletion)
    // ---------------------------------------------------------
    public Order markDeliveredAndPaid(Long orderId, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));

        order.setStatus("DELIVERED");
        Order savedOrder = orderRepository.save(order);

        // 🔥 FIRE THE WEBHOOK TO CLEAN UP THE DISK!
        pythonClient.triggerImageCleanup(order.getOrderId());

        return savedOrder;
    }
}