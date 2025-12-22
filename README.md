# Wholesale Footwear Website

A comprehensive wholesale footwear e-commerce platform designed to connect bulk buyers with footwear suppliers. This platform provides an efficient marketplace for wholesale transactions with robust inventory management, order processing, and vendor management capabilities.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Installation Instructions](#installation-instructions)
- [Architecture Documentation](#architecture-documentation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

The Wholesale Footwear Website is an enterprise-grade e-commerce solution tailored for the wholesale footwear industry. It streamlines the process of bulk ordering, inventory management, and business-to-business (B2B) transactions.

### Key Objectives

- **Streamlined Ordering**: Enable bulk buyers to easily browse and order footwear in large quantities
- **Vendor Management**: Provide vendors with tools to manage inventory and track sales
- **Inventory Optimization**: Real-time inventory tracking and automated stock management
- **Order Fulfillment**: Efficient order processing and fulfillment workflows
- **Analytics & Reporting**: Comprehensive analytics for both buyers and sellers

## Features

- **User Authentication & Authorization**: Secure login and role-based access control (RBAC)
- **Product Catalog**: Comprehensive footwear catalog with advanced filtering and search
- **Shopping Cart & Checkout**: Streamlined checkout process for bulk orders
- **Order Management**: Track orders, manage statuses, and handle fulfillment
- **Inventory Management**: Real-time stock tracking and low-stock alerts
- **Vendor Dashboard**: Analytics and sales reports for vendors
- **Payment Processing**: Secure payment gateway integration
- **Customer Support**: Ticketing system for inquiries and support
- **Mobile Responsive**: Fully responsive design for all devices

## Installation Instructions

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn
- PostgreSQL (v12.0 or higher)
- Redis (v6.0 or higher)
- Git

### Backend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Nar7407/wholesale-footwear-website.git
   cd wholesale-footwear-website
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your configuration:
     ```env
     DATABASE_URL=postgresql://user:password@localhost:5432/footwear_db
     REDIS_URL=redis://localhost:6379
     NODE_ENV=development
     PORT=3000
     JWT_SECRET=your_jwt_secret_here
     PAYMENT_API_KEY=your_payment_api_key
     ```

4. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd client
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   - Create a `.env` file:
     ```env
     REACT_APP_API_URL=http://localhost:3000/api
     REACT_APP_ENV=development
     ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   The frontend will start on `http://localhost:3000`

### Docker Setup (Optional)

If you prefer to use Docker:

```bash
docker-compose up -d
```

This will start all services (PostgreSQL, Redis, Backend, Frontend) in Docker containers.

## Architecture Documentation

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
│                   (React.js Frontend)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway & Middleware                   │
│         (Express.js, Authentication, Rate Limiting)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Services   │ │  Database    │ │   Cache      │
│   Layer      │ │  Layer       │ │   Layer      │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ - Auth       │ │ PostgreSQL   │ │ Redis        │
│ - Products   │ │              │ │              │
│ - Orders     │ │ (Tables:     │ │ (Sessions,   │
│ - Users      │ │  users,      │ │  Cache)      │
│ - Vendors    │ │  products,   │ │              │
│ - Payments   │ │  orders,     │ │              │
└──────────────┘ │  inventory)  │ └──────────────┘
                 └──────────────┘
```

### Technology Stack

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

#### Frontend
- **Framework**: React.js
- **State Management**: Redux
- **UI Components**: Material-UI
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library
- **Build Tool**: Webpack

#### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Version Control**: Git
- **CI/CD**: GitHub Actions

### Database Schema

#### Key Tables

**users**
- id (PK)
- email (UNIQUE)
- password_hash
- first_name
- last_name
- role (buyer, vendor, admin)
- status (active, inactive)
- created_at

**products**
- id (PK)
- vendor_id (FK)
- name
- description
- price
- size
- color
- category
- status (active, discontinued)
- created_at

**orders**
- id (PK)
- buyer_id (FK)
- vendor_id (FK)
- total_amount
- status (pending, confirmed, shipped, delivered)
- created_at
- updated_at

**inventory**
- id (PK)
- product_id (FK)
- quantity_available
- quantity_reserved
- last_updated

**order_items**
- id (PK)
- order_id (FK)
- product_id (FK)
- quantity
- unit_price

### API Endpoints Structure

```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── POST /logout
├── /users
│   ├── GET /:id
│   └── PUT /:id
├── /products
│   ├── GET (list with filters)
│   ├── GET /:id
│   ├── POST (vendor only)
│   └── PUT /:id (vendor only)
├── /orders
│   ├── GET (list)
│   ├── POST (create)
│   ├── GET /:id
│   └── PUT /:id (status updates)
├── /inventory
│   ├── GET /:product_id
│   └── PUT /:product_id (stock updates)
└── /vendors
    ├── GET /:id/dashboard
    └── GET /:id/analytics
```

### Security Architecture

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: All sensitive data encrypted at rest
- **API Security**: Rate limiting, CORS, HTTPS enforcement
- **Input Validation**: Server-side validation on all endpoints
- **SQL Injection Prevention**: Parameterized queries via ORM

### Deployment Architecture

The application is deployed using a microservices-ready architecture:

- **Backend Service**: Node.js API running on port 3000
- **Frontend Service**: React.js SPA served via CDN or web server
- **Database**: PostgreSQL with automated backups
- **Cache**: Redis for sessions and data caching
- **Monitoring**: Application logging and performance monitoring

## Usage

### For Buyers

1. Register or login to your account
2. Browse the product catalog
3. Add items to your cart
4. Proceed to checkout
5. Track your orders in the dashboard

### For Vendors

1. Create a vendor account
2. Add your products to the catalog
3. Manage inventory and pricing
4. View orders and fulfillment details
5. Access analytics and reports in your dashboard

## Contributing

We welcome contributions to the Wholesale Footwear Website project. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team at support@wholesalefootwear.com

---

**Last Updated**: 2025-12-22
