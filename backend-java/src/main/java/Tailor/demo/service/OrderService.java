package Tailor.demo.service;

import Tailor.demo.entity.Order;
import Tailor.demo.repository.OrderRepository;
import Tailor.demo.client.PythonFastApiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.time.LocalDate;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PythonFastApiClient pythonClient;

    @Autowired
    public OrderService(OrderRepository orderRepository, PythonFastApiClient pythonClient) {
        this.orderRepository = orderRepository;
        this.pythonClient = pythonClient;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order createNewOrder(Order newOrder) {
        String token = generateUniqueToken();
        newOrder.setToken(token);
        if (newOrder.getOrderDate() == null) {
            newOrder.setOrderDate(LocalDate.now());
        }
        return orderRepository.save(newOrder);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order updateOrder(Long id, Order updatedOrder) {
        return orderRepository.findById(id).map(existingOrder -> {
            existingOrder.setCustomerName(updatedOrder.getCustomerName());
            existingOrder.setPhone(updatedOrder.getPhone());
            existingOrder.setOrderDate(updatedOrder.getOrderDate());
            existingOrder.setDeliveryDate(updatedOrder.getDeliveryDate());
            existingOrder.setStatus(updatedOrder.getStatus());
            existingOrder.setTotalAmount(updatedOrder.getTotalAmount());
            existingOrder.setAdvanceAmount(updatedOrder.getAdvanceAmount());
            existingOrder.setStyle(updatedOrder.getStyle());
            existingOrder.setNotes(updatedOrder.getNotes());
            existingOrder.setFabricPhoto(updatedOrder.getFabricPhoto());
            return orderRepository.save(existingOrder);
        }).orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    public Order moveOrderToProduction(Long id) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus("IN_PRODUCTION");
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public Order moveOrderToComplete(Long id) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus("COMPLETED");
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public Order moveOrderToDelivered(Long id) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus("DELIVERED");
            Order saved = orderRepository.save(order);
            if (order.getPhone() != null && !order.getPhone().isBlank()) {
                pythonClient.triggerStatusNotification(order);
            }
            pythonClient.triggerImageCleanup(order.getOrderId());
            return saved;
        }).orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    private String generateUniqueToken() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        String token;
        do {
            token = String.valueOf(random.nextInt(1000, 10000));
        } while (orderRepository.findByToken(token).isPresent());
        return token;
    }
}
