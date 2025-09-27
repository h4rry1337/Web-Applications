package com.icecreamshop.orderservice.service;

import com.icecreamshop.orderservice.model.Order;
import com.icecreamshop.orderservice.model.OrderStatus;
import com.icecreamshop.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Order Service - Business logic for ice cream orders
 */
@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Value("${icecream.order.max.quantity:50}")
    private Integer maxOrderQuantity;
    
    @Value("${icecream.delivery.radius.km:25}")
    private Integer deliveryRadiusKm;
    
    // Sensitive data in service (SECURITY RISK!)
    @Value("${admin.username}")
    private String adminUsername;
    
    @Value("${admin.password}")
    private String adminPassword;
    
    @Value("${jwt.secret.key}")
    private String jwtSecret;
    
    /**
     * Create a new ice cream order
     */
    public Order createOrder(Order order) {
        validateOrder(order);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        
        // Calculate estimated delivery time (30-60 minutes)
        order.setEstimatedDeliveryTime(
            LocalDateTime.now().plusMinutes(30 + (int)(Math.random() * 30))
        );
        
        return orderRepository.save(order);
    }
    
    /**
     * Get all orders
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    /**
     * Get order by ID
     */
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    /**
     * Get orders by customer email
     */
    public List<Order> getOrdersByCustomerEmail(String email) {
        return orderRepository.findByCustomerEmailIgnoreCase(email);
    }
    
    /**
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    /**
     * Update order status
     */
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found with ID: " + orderId);
    }
    
    /**
     * Cancel order
     */
    public Order cancelOrder(Long orderId) {
        return updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
    
    /**
     * Mark order as delivered
     */
    public Order markAsDelivered(Long orderId) {
        return updateOrderStatus(orderId, OrderStatus.DELIVERED);
    }
    
    /**
     * Get recent orders (last 24 hours)
     */
    public List<Order> getRecentOrders() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return orderRepository.findRecentOrders(since);
    }
    
    /**
     * Search orders by customer name
     */
    public List<Order> searchOrdersByCustomerName(String customerName) {
        return orderRepository.findByCustomerNameContainingIgnoreCase(customerName);
    }
    
    /**
     * Get order statistics
     */
    public OrderStatistics getOrderStatistics() {
        Long totalOrders = orderRepository.count();
        Long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        Long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        Long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        Long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
        
        return new OrderStatistics(totalOrders, pendingOrders, confirmedOrders, 
                                 deliveredOrders, cancelledOrders);
    }
    
    /**
     * Validate order before saving
     */
    private void validateOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        
        int totalQuantity = order.getItems().stream()
            .mapToInt(item -> item.getQuantity())
            .sum();
            
        if (totalQuantity > maxOrderQuantity) {
            throw new IllegalArgumentException(
                "Total quantity exceeds maximum allowed: " + maxOrderQuantity);
        }
    }
    
    /**
     * DANGEROUS METHOD - Exposes sensitive configuration
     * This method should never exist in production code!
     */
    public AdminCredentials getAdminCredentials() {
        return new AdminCredentials(adminUsername, adminPassword, jwtSecret);
    }
    
    /**
     * Inner class for order statistics
     */
    public static class OrderStatistics {
        private final Long totalOrders;
        private final Long pendingOrders;
        private final Long confirmedOrders;
        private final Long deliveredOrders;
        private final Long cancelledOrders;
        
        public OrderStatistics(Long totalOrders, Long pendingOrders, Long confirmedOrders,
                             Long deliveredOrders, Long cancelledOrders) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.confirmedOrders = confirmedOrders;
            this.deliveredOrders = deliveredOrders;
            this.cancelledOrders = cancelledOrders;
        }
        
        // Getters
        public Long getTotalOrders() { return totalOrders; }
        public Long getPendingOrders() { return pendingOrders; }
        public Long getConfirmedOrders() { return confirmedOrders; }
        public Long getDeliveredOrders() { return deliveredOrders; }
        public Long getCancelledOrders() { return cancelledOrders; }
    }
    
    /**
     * SECURITY RISK - Inner class exposing admin credentials
     */
    public static class AdminCredentials {
        private final String username;
        private final String password;
        private final String jwtSecret;
        
        public AdminCredentials(String username, String password, String jwtSecret) {
            this.username = username;
            this.password = password;
            this.jwtSecret = jwtSecret;
        }
        
        public String getUsername() { return username; }
        public String getPassword() { return password; }
        public String getJwtSecret() { return jwtSecret; }
    }
}
