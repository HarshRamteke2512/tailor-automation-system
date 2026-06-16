package Tailor.demo.controller;

import Tailor.demo.entity.Order;
import Tailor.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // Connect the Controller to your Brain (Service Layer)
    @Autowired
    private OrderService orderService;

    // ---------------------------------------------------------
    // ENDPOINT 1: Create a New Order
    // URL: POST http://localhost:8080/api/orders
    // ---------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order newOrder) {
        try {
            // Hand the incoming data to the Service to check shop capacity
            Order savedOrder = orderService.createNewOrder(newOrder);
            
            // If successful, return a 200 OK status and the saved order 
            // (which now includes that cool 4-digit token starting at 1000!)
            return ResponseEntity.ok(savedOrder);
            
        } catch (RuntimeException e) {
            // If the capacity is exceeded, return a 400 Bad Request with the error message
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ENDPOINT 2: Move Order to 'IN_PRODUCTION'
    // URL: PUT http://localhost:8080/api/orders/1000/production
    // ---------------------------------------------------------
    @PutMapping("/{orderId}/production")
    public ResponseEntity<?> startProduction(@PathVariable Long orderId) {
        try {
            // Hand the ID to the Service to enforce your strict workflow transition
            Order updatedOrder = orderService.moveOrderToProduction(orderId);
            return ResponseEntity.ok(updatedOrder);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
