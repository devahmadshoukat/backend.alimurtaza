# Vercel Deployment Guide

## Issues Fixed

The main issues causing the Vercel serverless function crash were:

1. **Module Type Mismatch**: Removed `"type": "module"` from package.json since the code uses CommonJS imports
2. **Database Connection**: Modified database connection to work in serverless environment with on-demand connection
3. **Server Startup**: Removed `app.listen()` for production to prevent port binding issues
4. **Environment Variables**: Added proper environment variable configuration

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Set Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard and set these environment variables:

- `JWT_SECRET`: Your JWT secret key (use a strong, random string)
- `NODE_ENV`: `production`

### 5. Configure MongoDB Atlas

Ensure your MongoDB Atlas cluster:
- Has proper network access (0.0.0.0/0 for Vercel)
- Has the correct connection string
- Is in an active state

## Key Changes Made

### 1. Database Connection (`src/db.ts`)
```typescript
// Now uses on-demand connection with caching
export const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Using existing database connection");
        return;
    }
    // ... connection logic
};
```

### 2. Server Configuration (`server.ts`)
```typescript
// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        // Handle connection errors
    }
});

// Only start server in development
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        // ... server startup logs
    });
}

export default app;
```

### 3. Vercel Configuration (`vercel.json`)
```json
{
    "version": 2,
    "builds": [
        {
            "src": "server.ts",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/api/(.*)",
            "dest": "/server.ts"
        }
    ],
    "functions": {
        "server.ts": {
            "maxDuration": 30
        }
    }
}
```

## Testing Your Deployment

1. **Health Check**: `GET /api/health`
2. **API Documentation**: `GET /api`
3. **Products**: `GET /api/products`

## Common Issues and Solutions

### 1. Function Timeout
- Increase `maxDuration` in vercel.json
- Optimize database queries
- Use connection pooling

### 2. Database Connection Issues
- Check MongoDB Atlas network access
- Verify connection string
- Ensure database is active

### 3. Environment Variables
- Set all required env vars in Vercel dashboard
- Use strong JWT secrets
- Don't commit secrets to code

### 4. Cold Start Issues
- Database connection is now on-demand
- Consider using MongoDB Atlas connection pooling
- Monitor function execution times

## Monitoring

Use Vercel's built-in monitoring:
- Function logs in Vercel dashboard
- Performance metrics
- Error tracking

## Local Development

For local development, the server still works normally:
```bash
npm run dev
```

The server will start on port 4000 with full functionality.

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] MongoDB Atlas configured correctly
- [ ] JWT secret is strong and secure
- [ ] All routes tested
- [ ] Error handling working
- [ ] CORS configured properly
- [ ] Database connection stable
