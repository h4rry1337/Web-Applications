package com.icecreamshop.orderservice.model;

/**
 * Payment Method Enumeration
 */
public enum PaymentMethod {
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    PAYPAL("PayPal"),
    STRIPE("Stripe"),
    CASH_ON_DELIVERY("Cash on Delivery"),
    APPLE_PAY("Apple Pay"),
    GOOGLE_PAY("Google Pay");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
