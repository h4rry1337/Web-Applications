package com.icecreamshop.orderservice.repository;

import com.icecreamshop.orderservice.model.Order;
import com.icecreamshop.orderservice.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Order Repository for database operations
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find orders by customer email
     */
    List<Order> findByCustomerEmailIgnoreCase(String customerEmail);
    
    /**
     * Find orders by customer phone
     */
    List<Order> findByCustomerPhone(String customerPhone);
    
    /**
     * Find orders by status
     */
    List<Order> findByStatus(OrderStatus status);
    
    /**
     * Find orders by customer name (case insensitive, partial match)
     */
    List<Order> findByCustomerNameContainingIgnoreCase(String customerName);
    
    /**
     * Find orders created between two dates
     */
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * Find orders by status and created date
     */
    List<Order> findByStatusAndCreatedAtAfter(OrderStatus status, LocalDateTime date);
    
    /**
     * Find recent orders (last 24 hours)
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :since ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(@Param("since") LocalDateTime since);
    
    /**
     * Find orders by delivery address containing text
     */
    List<Order> findByDeliveryAddressContainingIgnoreCase(String addressPart);
    
    /**
     * Count orders by status
     */
    Long countByStatus(OrderStatus status);
    
    /**
     * Find pending orders older than specified time
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' AND o.createdAt < :cutoffTime")
    List<Order> findStalePendingOrders(@Param("cutoffTime") LocalDateTime cutoffTime);
}
