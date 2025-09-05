require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('../shared/utils/logger');
const ApiResponse = require('../shared/utils/response');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const webhookRoutes = require('./routes/webhook.routes');


const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';


// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Auth specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12, // limit auth attempts
  message: 'Too many authentication attempts'
});


app.use('/webhooks', webhookRoutes);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use(`${API_PREFIX}/subscriptions`, subscriptionRoutes);


// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Health check
app.get('/health', (req, res) => {
  ApiResponse.success(res, { status: 'healthy', timestamp: new Date() });
});

// API routes
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// 404 handler
app.use((req, res) => {
  ApiResponse.error(res, 'Route not found', 404);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  ApiResponse.error(res, 'Internal server error', 500);
});


// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database in development
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}${API_PREFIX}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}


module.exports = app;








// const express = require('express');
//
// // const PORT = process.env.PORT || 8080;
// const PORT = process.env.PORT || 3000;
//
// const app = express(); // create server
//
// app.get('/', (req, res) => {
//   res.send('♻️ START WEB SERVICE! I am using NodeJS, Postgres & QR-Code‼️');
// })
//
// app.listen(PORT, () => console.log(`🟩🌟 Server started and listening on port ${PORT}`));
