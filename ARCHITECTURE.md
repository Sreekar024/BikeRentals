# College Bicycle Rental System - Architecture Documentation

## System Overview

The College Bicycle Rental System is a full-stack web application designed to manage bicycle rentals on college campuses. The system provides real-time bike tracking, wallet integration, and comprehensive management dashboards.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - REST APIs     │    │ - User Data     │
│ - Map View      │    │ - Socket.IO     │    │ - Bike Data     │
│ - Wallet        │    │ - Auth System   │    │ - Transactions  │
│ - Admin Panel   │    │ - Real-time     │    │ - Ride History  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **TailwindCSS** for responsive UI design
- **React Router** for client-side routing
- **Zustand** for lightweight state management
- **React Leaflet** for interactive maps
- **Socket.IO Client** for real-time updates

### Backend
- **Node.js** with Express framework
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **PostgreSQL** as primary database
- **JWT** for authentication
- **Socket.IO** for real-time communication
- **Zod** for request validation
- **Swagger** for API documentation

### DevOps & Infrastructure
- **Docker** for containerization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Database Schema

### Core Entities

#### Users
- Stores user information, roles, and KYC status
- Supports STUDENT, ADMIN, and TECHNICIAN roles
- Links to wallet for payment processing

#### Bikes
- Tracks bike type (STANDARD/E_BIKE), status, and location
- Real-time GPS coordinates for tracking
- Battery percentage for e-bikes
- Links to docking stations

#### Docks
- Physical locations where bikes can be parked
- GPS coordinates and capacity information
- Active/inactive status management

#### Rides
- Complete ride lifecycle from start to end
- Duration, distance, and cost calculation
- Route tracking with GeoJSON data
- Links to start/end docks

#### Wallet & Transactions
- Digital wallet system for payments
- Transaction history with different types
- Hold/charge/refund mechanism
- Real-time balance updates

## API Architecture

### RESTful Endpoints

```
/api/auth/*          - Authentication & user management
/api/bikes/*         - Bike operations & reservations
/api/wallet/*        - Wallet & payment operations
/api/rides/*         - Ride management & tracking
/api/admin/*         - Administrative functions
/api/technician/*    - Maintenance operations
```

### Real-time Communication

- **Socket.IO** for live bike location updates
- **Heartbeat system** for ride tracking
- **Event-driven** bike status changes
- **Real-time notifications** for users

## Security Implementation

### Authentication & Authorization
- **JWT tokens** stored in HTTP-only cookies
- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **Session management** with secure cookies

### Data Protection
- **Input validation** with Zod schemas
- **SQL injection prevention** via Prisma ORM
- **XSS protection** with Helmet middleware
- **CORS configuration** for API security

### API Security
- **Rate limiting** for API endpoints
- **Request sanitization** and validation
- **Error handling** without data leakage
- **Audit logging** for admin actions

## Real-time Features

### Live Bike Tracking
- GPS coordinates updated every 10 seconds
- Real-time map updates via WebSocket
- Battery level monitoring for e-bikes
- Availability status broadcasting

### Ride Management
- Live ride timer and cost calculation
- Heartbeat system for location updates
- Real-time route tracking
- Instant ride completion notifications

## Payment System

### Wallet Architecture
- **Hold mechanism** for reservations (₹50 security deposit)
- **Automatic charging** based on ride duration/distance
- **Refund system** for unused amounts
- **Transaction history** with detailed records

### Pricing Engine
- **Dynamic pricing** based on time and distance
- **Penalty system** for late returns and off-dock parking
- **Promotional discounts** support
- **Real-time cost calculation** during rides

## Scalability Considerations

### Database Optimization
- **Indexed queries** for fast lookups
- **Connection pooling** for concurrent requests
- **Read replicas** for analytics queries
- **Partitioning** for large transaction tables

### Caching Strategy
- **Redis** for session storage (future enhancement)
- **API response caching** for static data
- **Client-side caching** with React Query
- **CDN integration** for static assets

### Microservices Ready
- **Modular architecture** for easy service extraction
- **API-first design** for service communication
- **Event-driven patterns** for loose coupling
- **Container-based deployment** for scalability

## Monitoring & Analytics

### Application Monitoring
- **Health check endpoints** for service status
- **Error tracking** and logging
- **Performance metrics** collection
- **Real-time dashboards** for operations

### Business Analytics
- **Ride patterns** and usage statistics
- **Revenue tracking** and reporting
- **User behavior** analysis
- **Bike utilization** metrics

## Deployment Strategy

### Development Environment
- **Docker Compose** for local development
- **Hot reloading** for rapid development
- **Database seeding** for test data
- **Environment isolation** with containers

### Production Deployment
- **Container orchestration** with Kubernetes
- **Load balancing** for high availability
- **SSL/TLS termination** at load balancer
- **Database backups** and disaster recovery

### CI/CD Pipeline
- **Automated testing** on pull requests
- **Code quality checks** with linting
- **Security scanning** for vulnerabilities
- **Automated deployment** to staging/production

## Future Enhancements

### Advanced Features
- **Machine learning** for demand prediction
- **IoT integration** for smart bike locks
- **Mobile app** with offline capabilities
- **Payment gateway** integration

### Scalability Improvements
- **Microservices architecture** migration
- **Event sourcing** for audit trails
- **CQRS pattern** for read/write separation
- **GraphQL API** for flexible queries

This architecture provides a solid foundation for a production-ready bicycle rental system with room for future growth and enhancements.