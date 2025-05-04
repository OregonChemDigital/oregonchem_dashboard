import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cors from 'cors';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS with specific configuration
app.use(cors({
    origin: ['https://oregonchem-dashboard.onrender.com', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', 
        "default-src 'self' https://oregonchem-backend.onrender.com; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https: blob: https://www.google-analytics.com; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "connect-src 'self' https://oregonchem-backend.onrender.com https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://www.google-analytics.com https://analytics.google.com; " +
        "frame-ancestors 'none';"
    );
    res.setHeader('Set-Cookie', 'SameSite=None; Secure');
    next();
});

// Enable compression
app.use(compression());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint (moved to /health)
app.get('/health', (req, res) => {
  console.log('Health check requested from:', req.headers.host);
  try {
    // Verify that the dist directory exists and has the necessary files
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error('Static files not found');
    }
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      host: req.headers.host,
      port: PORT,
      staticFiles: 'available'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle client-side routing with error handling
app.get('*', (req, res, next) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(500).json({
      error: 'Static files not found',
      timestamp: new Date().toISOString()
    });
  }
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      next(err);
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'production');
  console.log('Health check available at:', `http://localhost:${PORT}/health`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 