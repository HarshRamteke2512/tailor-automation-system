package Tailor.demo.controller;

import Tailor.demo.entity.Order;
import Tailor.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ---------------------------------------------------------
    // ENDPOINT 1: Fetch All Orders
    // URL: GET http://localhost:8089/api/orders
    // ---------------------------------------------------------
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ENDPOINT 2: Get Order by ID
    // URL: GET http://localhost:8089/api/orders/{id}
    // ---------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            return orderService.getOrderById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ENDPOINT 3: Create a New Order
    // URL: POST http://localhost:8089/api/orders
    // ---------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order newOrder) {
        try {
            Order savedOrder = orderService.createNewOrder(newOrder);
            return ResponseEntity.ok(savedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ENDPOINT 4: Update an Existing Order
    // URL: PUT http://localhost:8089/api/orders/{id}
    // ---------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody Order updatedOrder) {
        try {
            Order order = orderService.updateOrder(id, updatedOrder);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ENDPOINT 5: Delete an Order
    // URL: DELETE http://localhost:8089/api/orders/{id}
    // ---------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{orderId}/production")
    public ResponseEntity<?> startProduction(@PathVariable Long orderId) {
        try {
            Order updatedOrder = orderService.moveOrderToProduction(orderId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{orderId}/complete")
    public ResponseEntity<?> markComplete(@PathVariable Long orderId) {
        try {
            Order updatedOrder = orderService.moveOrderToComplete(orderId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{orderId}/deliver")
    public ResponseEntity<?> markDelivered(@PathVariable Long orderId) {
        try {
            Order updatedOrder = orderService.moveOrderToDelivered(orderId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
