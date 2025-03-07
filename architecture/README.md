# E-commerce Microservices Architecture

## Overview
This e-commerce system consists of 5 microservices:

1. **Product Service** (Port 8001)
   - Manages product catalog
   - Handles inventory
   - Product categories and search
   - Written in Node.js/Express

2. **User Service** (Port 8002)
   - User management
   - Authentication & authorization
   - User preferences
   - Written in Node.js/Express

3. **Order Service** (Port 8003)
   - Order processing
   - Order history
   - Order status tracking
   - Written in Node.js/Express

4. **Cart Service** (Port 8004)
   - Shopping cart management
   - Price calculations
   - Temporary storage
   - Written in Node.js/Express

5. **Payment Service** (Port 8005)
   - Payment processing
   - Refund handling
   - Payment status tracking
   - Written in Node.js/Express

## System Architecture
- API Gateway pattern for client communication
- Event-driven communication between services using RabbitMQ
- MongoDB for data persistence
- Redis for caching
- JWT for authentication

## Communication Patterns
- Synchronous: REST APIs for direct requests
- Asynchronous: Event-based communication for cross-service operations