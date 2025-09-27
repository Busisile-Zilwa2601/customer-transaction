# Customer Transaction

This codebase is a microservices backend system with a gateway, authentication, and account, transaction management services. It features strong validation, secure authentication, messaging between services, and robust error/logging mechanisms.

## High-Level Architecture
- **API-Gateway**
    |-- This is the entry point for client requests, handling routing, basic rate-limiting, and proxies underlying requests --|
- **AUTH_SERVICE**
    |-- For client registration, account creation and client management, handles user authentication --|
- **ACOUNT_SERVICE**
    |-- Manages client account wih limited account information --|
- **TRANSACTION_SERVICE**
    |-- Manages custom transaction functionality --|

## Features

- **RESTful API**: Provides endpoints for managing customer transactions.
- **Authentication**: Secures routes using JWT-based authentication.
- **Pagination**: Supports pagination for transaction data retrieval.
- **Caching**: Utilizes Redis to cache transaction data for improved performance.
- **Messaging**: Integrates with RabbitMQ for asynchronous communication with other systems.

## Technologies Used

- **Node.js**: JavaScript runtime for building the API.
- **TypeScript**: Superset of JavaScript for type safety and better development experience.
- **Express**: Web framework for building the API.
- **MongoDB**: NoSQL database for storing transaction data.
- **Redis**: In-memory data structure store for caching.
- **RabbitMQ**: Message broker for handling communication between services.

## Getting started

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB
- Redis
- RabbitMQ

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Busisile-Zilwa2601/customer-transaction.git
   cd customer-transaction
   ```

2. Install dependencies:
   ```
   npm install
   ```
3.  Check up environment varialbles: 
    This should include the 
    ``` 
    MONGODB_URI_DEV=<mongodb-uri>
    REDIS_URL=<redis-host>
    RABBITMQ_URL=<rabbitmq-url>
    JWT_SECRET=<jwt-secret>
    ```
4.  Start the application:
    FROM customer-transaction
        4.1.1 cd account_service
        4.1.2 npm run dev
    FROM customer-transaction
        4.2.1 cd transaction_service
        4.2.2 npm run dev
    
    FROM customer-transaction
        4.3.1 cd auth_service
        4.2.2 npm run dev

    FROM customer-transaction
        4.2.1 cd ap-gateway
        4.2.2 npm run dev

    Note: The above will run on NODE_ENV=development and uses mock-data to create account and transaction data.

    **Docker**
    - Start services    
        ```
            docker-compose up --build
        ```
        OR

        ```
            docker-compose up --build -d
        ```

    - To stop and remove
        ```
            docker-compose down
        ```
    - To view logs
        ```
            docker-compose logs -f
        ```