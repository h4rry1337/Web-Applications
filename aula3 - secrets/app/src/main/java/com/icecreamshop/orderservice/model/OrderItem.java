package com.icecreamshop.orderservice.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * Order Item - Embeddable class representing an ice cream item in an order
 */
@Embeddable
public class OrderItem {
    
    @NotBlank(message = "Flavor is required")
    private String flavor;
    
    @NotBlank(message = "Size is required")
    private String size;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 50, message = "Maximum quantity is 50")
    private Integer quantity;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be positive")
    private BigDecimal unitPrice;
    
    private String toppings;
    
    // Constructors
    public OrderItem() {}
    
    public OrderItem(String flavor, String size, Integer quantity, BigDecimal unitPrice) {
        this.flavor = flavor;
        this.size = size;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
    
    public OrderItem(String flavor, String size, Integer quantity, BigDecimal unitPrice, String toppings) {
        this(flavor, size, quantity, unitPrice);
        this.toppings = toppings;
    }
    
    // Getters and Setters
    public String getFlavor() { return flavor; }
    public void setFlavor(String flavor) { this.flavor = flavor; }
    
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public String getToppings() { return toppings; }
    public void setToppings(String toppings) { this.toppings = toppings; }
    
    // Business logic
    public BigDecimal getSubtotal() {
        return unitPrice != null && quantity != null ? 
               unitPrice.multiply(BigDecimal.valueOf(quantity)) : 
               BigDecimal.ZERO;
    }
}
