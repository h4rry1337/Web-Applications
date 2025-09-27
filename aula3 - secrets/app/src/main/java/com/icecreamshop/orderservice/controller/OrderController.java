package com.icecreamshop.orderservice.controller;

import com.icecreamshop.orderservice.model.Order;
import com.icecreamshop.orderservice.model.OrderStatus;
import com.icecreamshop.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * Ice Cream Order REST Controller
 * Provides RESTful endpoints for managing ice cream orders
 */
@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*") 
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Value("${payment.stripe.secret.key}")
    private String stripeSecretKey;
    
    @Value("${aws.access.key.id}")
    private String awsAccessKey;
    
    @Value("${admin.api.token}")
    private String adminApiToken;
    
    /**
     * Create a new ice cream order
     */
    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody Order order) {
        try {
            Order createdOrder = orderService.createOrder(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all orders
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get orders by customer email
     */
    @GetMapping("/customer/{email}")
    public ResponseEntity<List<Order>> getOrdersByCustomerEmail(@PathVariable String email) {
        List<Order> orders = orderService.getOrdersByCustomerEmail(email);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get orders by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<Order> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Update order status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id, 
            @RequestParam OrderStatus status) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Cancel order
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        try {
            Order cancelledOrder = orderService.cancelOrder(id);
            return ResponseEntity.ok(cancelledOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Mark order as delivered
     */
    @PostMapping("/{id}/delivered")
    public ResponseEntity<Order> markAsDelivered(@PathVariable Long id) {
        try {
            Order deliveredOrder = orderService.markAsDelivered(id);
            return ResponseEntity.ok(deliveredOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get recent orders
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Order>> getRecentOrders() {
        List<Order> orders = orderService.getRecentOrders();
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Search orders by customer name
     */
    @GetMapping("/search")
    public ResponseEntity<List<Order>> searchOrders(@RequestParam String customerName) {
        List<Order> orders = orderService.searchOrdersByCustomerName(customerName);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get order statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<OrderService.OrderStatistics> getOrderStatistics() {
        OrderService.OrderStatistics stats = orderService.getOrderStatistics();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Debug configuration
     */
    @GetMapping("/debug/config")
    public ResponseEntity<DebugConfig> getDebugConfig() {
        DebugConfig config = new DebugConfig(
            stripeSecretKey,
            awsAccessKey,
            adminApiToken
        );
        return ResponseEntity.ok(config);
    }
    
    /**
     * Debug admin
     */
    @GetMapping("/debug/admin")
    public ResponseEntity<OrderService.AdminCredentials> getAdminCredentials() {
        OrderService.AdminCredentials credentials = orderService.getAdminCredentials();
        return ResponseEntity.ok(credentials);
    }
    
    /**
     * Debug configuration class
     */
    public static class DebugConfig {
        private final String stripeSecretKey;
        private final String awsAccessKey;
        private final String adminApiToken;
        
        public DebugConfig(String stripeSecretKey, String awsAccessKey, String adminApiToken) {
            this.stripeSecretKey = stripeSecretKey;
            this.awsAccessKey = awsAccessKey;
            this.adminApiToken = adminApiToken;
        }
        
        public String getStripeSecretKey() { return stripeSecretKey; }
        public String getAwsAccessKey() { return awsAccessKey; }
        public String getAdminApiToken() { return adminApiToken; }
    }
}
