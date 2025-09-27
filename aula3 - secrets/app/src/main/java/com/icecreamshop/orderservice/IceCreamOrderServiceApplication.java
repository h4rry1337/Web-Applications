package com.icecreamshop.orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ice Cream Order Management Microservice
 * 
 * A RESTful microservice for managing ice cream orders, inventory, and customer data.
 * Features include order processing, payment integration, delivery tracking, and analytics.
 * 
 * @author Ice Cream Shop Development Team
 * @version 1.0.0
 */
@SpringBootApplication
public class IceCreamOrderServiceApplication {

    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("🍦 Ice Cream Order Management Service");
        System.out.println("========================================");
        System.out.println("Starting microservice...");
        System.out.println("Application: Ice Cream Order Management");
        System.out.println("Version: 1.0.0");
        System.out.println("Port: 8080");
        System.out.println("Base URL: http://localhost:8080/api/v1");
        System.out.println("Actuator: http://localhost:8080/actuator");
        System.out.println("H2 Console: http://localhost:8080/api/v1/h2-console");
        System.out.println("========================================");
        
        SpringApplication.run(IceCreamOrderServiceApplication.class, args);
        
        System.out.println("✅ Ice Cream Order Service is running!");
    }
}
