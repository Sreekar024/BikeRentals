# College Bicycle Rental System

A complete full-stack web application for managing bicycle rentals on college campuses with real-time tracking, wallet integration, and admin management.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd FULL_STACK_PROJECT

# Start with Docker
docker-compose up -d

# Or run locally
npm run setup
npm run dev
```

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Auth**: JWT with HTTP-only cookies

## 📁 Project Structure

```
├── frontend/          # React frontend
├── backend/           # Node.js API server
├── shared/           # Shared types and utilities
├── docker-compose.yml
└── README.md
```

## 🔧 Environment Setup

1. Copy environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Update database credentials in `backend/.env`

3. Push database schema:
```bash
cd backend && npm run db:push
```

4. Seed initial data:
```bash
npm run db:seed
```

## 🎯 Features

### Student Portal
- Register/Login with KYC verification
- Live bike map with availability
- Book and unlock bikes via QR/ID
- Real-time ride tracking with cost calculation
- Integrated wallet system
- Ride history and receipts

### Admin Portal
- Dashboard with analytics
- Bike and dock management
- User management and KYC approval
- Pricing rules and promotions
- Maintenance ticket system

### Technician Portal
- View assigned maintenance tickets
- Update ticket status and notes
- Upload maintenance photos

## 🔐 Default Credentials

**Admin**: admin@college.edu / admin123
**Student**: student@college.edu / student123
**Technician**: tech@college.edu / tech123

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

```bash
# Build for production
docker-compose -f docker-compose.prod.yml up -d

# Or manual deployment
npm run build
npm run start:prod
```

## 📊 API Documentation

Visit `http://localhost:3001/api-docs` for Swagger documentation.

## 🎨 Demo

- **Student Portal**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/admin
- **API**: http://localhost:3001