const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const client = require('prom-client');

dotenv.config();

const app = express();

// Initialize the default metrics collection
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Create a counter metric with method and route labels for more detailed insights
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route'],
});

// Middleware to count requests and label them by method and route
app.use((req, res, next) => {
  // Do not count the /metrics endpoint itself
  if (req.path !== '/metrics') {
    // Use req.route?.path or fallback to req.path for route label
    // Since some routes may not be registered yet, fallback to req.path
    const route = req.route?.path || req.path;
    requestCounter.inc({ method: req.method, route });
  }
  next();
});

// Metrics endpoint to expose Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(cors({
  origin: ['http://localhost:3000', 'https://mern-eventmanagement-frontend.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
