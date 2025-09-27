package com.icecreamshop.orderservice.model;

/**
 * Order Status Enumeration
 */
public enum OrderStatus {
    PENDING("Order received, processing"),
    CONFIRMED("Order confirmed, preparing"),
    PREPARING("Ice cream being prepared"),
    READY("Order ready for pickup/delivery"),
    OUT_FOR_DELIVERY("Order out for delivery"),
    DELIVERED("Order delivered successfully"),
    CANCELLED("Order cancelled"),
    REFUNDED("Order refunded");
    
    private final String description;
    
    OrderStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
