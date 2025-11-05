import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth';
import bikeRoutes from './routes/bikes';
import walletRoutes from './routes/wallet';
import rideRoutes from './routes/rides';
import adminRoutes from './routes/admin';
import techRoutes from './routes/technician';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './services/socketService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || "http://localhost:3000" }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Bike Rental API', version: '1.0.0' },
    servers: [{ url: '/api' }]
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/technician', techRoutes);

app.use(errorHandler);

// Socket.IO
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
});