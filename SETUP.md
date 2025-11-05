# Setup Instructions

## Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git** for version control
- **PostgreSQL** (if running without Docker)

## Quick Start (Recommended)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd FULL_STACK_PROJECT
```

### 2. Environment Configuration

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment  
cp frontend/.env.example frontend/.env
```

### 3. Docker Setup (Easiest)

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Initialize Database

```bash
# Run migrations and seed data
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

## Manual Setup (Development)

### 1. Database Setup

```bash
# Install PostgreSQL locally or use Docker
docker run --name bike-rental-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bike_rental -p 5432:5432 -d postgres:15

# Update backend/.env with your database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bike_rental"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bike_rental"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

## Default User Accounts

After seeding the database, you can login with:

### Admin Account
- **Email**: admin@college.edu
- **Password**: admin123
- **Role**: Administrator with full access

### Student Account
- **Email**: student@college.edu
- **Password**: student123
- **Role**: Student with ₹200 wallet balance

### Technician Account
- **Email**: tech@college.edu
- **Password**: tech123
- **Role**: Technician for maintenance

## Development Commands

### Backend Commands

```bash
cd backend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:migrate    # Run migrations
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio

# Testing
npm test
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Testing
npm test
```

### Root Commands

```bash
# Install all dependencies
npm run setup

# Start both frontend and backend
npm run dev

# Build both applications
npm run build

# Run all tests
npm test

# Docker operations
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
```

## Database Management

### Prisma Commands

```bash
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Database Seeding

The seed script creates:
- 4 docking stations across campus
- 50 bikes (10 e-bikes, 40 standard)
- 3 user accounts (admin, student, technician)
- 1 sample maintenance ticket
- Default pricing rules

## Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

### End-to-End Testing

```bash
# Install Playwright (if using E2E tests)
npx playwright install

# Run E2E tests
npm run test:e2e
```

## Production Deployment

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production Deployment

```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
# Serve build folder with nginx or similar
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000/3001
   lsof -ti:3000 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database connection issues**
   ```bash
   # Check PostgreSQL is running
   docker-compose ps postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Prisma client issues**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

4. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs and Debugging

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Backend debugging
cd backend
DEBUG=* npm run dev

# Database debugging
cd backend
npx prisma studio
```

### Performance Optimization

1. **Database Indexing**
   - Indexes are automatically created for foreign keys
   - Add custom indexes for frequently queried fields

2. **Frontend Optimization**
   - Code splitting with React.lazy()
   - Image optimization
   - Bundle analysis with `npm run build -- --analyze`

3. **Backend Optimization**
   - Connection pooling (configured in Prisma)
   - Response caching for static data
   - Compression middleware

## Security Checklist

- [ ] Change default JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable database SSL in production
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Monitoring

### Health Checks

- Backend: `GET /api/health`
- Database: Connection status in logs
- Frontend: Application loads without errors

### Metrics to Monitor

- Response times
- Database query performance
- Active user sessions
- Bike availability
- Transaction success rates

For additional help, check the API documentation at `/api-docs` or review the architecture documentation in `ARCHITECTURE.md`.