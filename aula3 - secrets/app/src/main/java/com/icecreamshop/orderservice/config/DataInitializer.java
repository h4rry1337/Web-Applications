package com.icecreamshop.orderservice.config;

import com.icecreamshop.orderservice.model.Order;
import com.icecreamshop.orderservice.model.OrderItem;
import com.icecreamshop.orderservice.model.OrderStatus;
import com.icecreamshop.orderservice.model.PaymentMethod;
import com.icecreamshop.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * Data Initialization - Creates sample ice cream orders on startup
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (orderRepository.count() == 0) {
            initializeSampleOrders();
            System.out.println("✅ Sample ice cream orders created successfully!");
        }
    }
    
    private void initializeSampleOrders() {
        // Sample Order 1
        OrderItem item1 = new OrderItem("Vanilla", "Large", 2, new BigDecimal("5.99"), "Chocolate chips");
        OrderItem item2 = new OrderItem("Chocolate", "Medium", 1, new BigDecimal("4.99"), "Nuts");
        
        Order order1 = new Order(
            "Alice Johnson",
            "alice.johnson@email.com",
            "+1-555-101-2345",
            "456 Oak Avenue, Sweet Town, ST 67890",
            Arrays.asList(item1, item2),
            new BigDecimal("16.97")
        );
        order1.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        order1.setStatus(OrderStatus.DELIVERED);
        order1.setSpecialInstructions("Please leave at front door");
        order1.setPaymentTransactionId("txn_abc123def456");
        order1.setCreatedAt(LocalDateTime.now().minusHours(2));
        
        // Sample Order 2
        OrderItem item3 = new OrderItem("Strawberry", "Small", 3, new BigDecimal("3.99"), "Sprinkles");
        
        Order order2 = new Order(
            "Bob Smith",
            "bob.smith@email.com",
            "+1-555-202-3456",
            "789 Pine Street, Flavor City, FC 13579",
            Arrays.asList(item3),
            new BigDecimal("11.97")
        );
        order2.setPaymentMethod(PaymentMethod.PAYPAL);
        order2.setStatus(OrderStatus.PREPARING);
        order2.setSpecialInstructions("Extra napkins please");
        order2.setPaymentTransactionId("pp_xyz789uvw012");
        order2.setCreatedAt(LocalDateTime.now().minusMinutes(30));
        
        // Sample Order 3
        OrderItem item4 = new OrderItem("Mint Chocolate Chip", "Large", 1, new BigDecimal("6.49"));
        OrderItem item5 = new OrderItem("Rocky Road", "Medium", 2, new BigDecimal("5.49"), "Extra marshmallows");
        
        Order order3 = new Order(
            "Carol Williams",
            "carol.williams@email.com",
            "+1-555-303-4567",
            "321 Elm Drive, Sundae City, SC 24680",
            Arrays.asList(item4, item5),
            new BigDecimal("17.47")
        );
        order3.setPaymentMethod(PaymentMethod.STRIPE);
        order3.setStatus(OrderStatus.PENDING);
        order3.setSpecialInstructions("Birthday surprise - please add candles");
        order3.setCreatedAt(LocalDateTime.now().minusMinutes(10));
        
        // Sample Order 4 - Recent order
        OrderItem item6 = new OrderItem("Cookies and Cream", "Large", 2, new BigDecimal("5.99"), "Oreo pieces");
        
        Order order4 = new Order(
            "David Brown",
            "david.brown@email.com",
            "+1-555-404-5678",
            "654 Maple Lane, Cream Valley, CV 35791",
            Arrays.asList(item6),
            new BigDecimal("11.98")
        );
        order4.setPaymentMethod(PaymentMethod.APPLE_PAY);
        order4.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order4.setSpecialInstructions("Call when arriving");
        order4.setPaymentTransactionId("ap_mno345pqr678");
        order4.setCreatedAt(LocalDateTime.now().minusMinutes(45));
        
        // Save all orders
        orderRepository.saveAll(Arrays.asList(order1, order2, order3, order4));
        
        System.out.println("🍦 Created sample orders:");
        System.out.println("   - Alice Johnson: 2 items, DELIVERED");
        System.out.println("   - Bob Smith: 1 item, PREPARING");
        System.out.println("   - Carol Williams: 2 items, PENDING");
        System.out.println("   - David Brown: 1 item, OUT_FOR_DELIVERY");
    }
}
