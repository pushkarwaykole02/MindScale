# Deployment Guide

This guide will help you deploy the Customer Behavior Mining System to production.

## 🚀 Quick Start

### Prerequisites
- Supabase account
- Vercel/Netlify account (for frontend)
- Render/Railway account (for backend)
- GitHub repository

## 📋 Deployment Steps

### 1. Supabase Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Set up authentication**
   - Go to Authentication > Settings
   - Configure your site URL (your frontend domain)
   - Set up email templates if needed

3. **Create database tables** (optional)
   ```sql
   -- Create analytics table
   CREATE TABLE analytics (
     id SERIAL PRIMARY KEY,
     metric_name VARCHAR(100),
     metric_value DECIMAL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create predictions table
   CREATE TABLE predictions (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     prediction_data JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### 2. Frontend Deployment (Vercel)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `client` folder as the root directory

2. **Configure environment variables**
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=https://your-backend-domain.com
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your frontend will be available at `https://your-app.vercel.app`

### 3. Backend Deployment (Render)

1. **Create a new Web Service**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select the `server` folder as the root directory

2. **Configure build settings**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set environment variables**
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Deploy**
   - Render will build and deploy your backend
   - Your API will be available at `https://your-app.onrender.com`

### 4. Update CORS Settings

1. **Update Supabase CORS**
   - Go to Supabase Dashboard > Settings > API
   - Add your frontend domain to allowed origins

2. **Update backend CORS**
   - Update the CORS configuration in `server/server.js`
   - Add your production frontend URL

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-backend-domain.com
```

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_database_url
```

## 📊 Database Setup

### Supabase Tables

1. **Analytics Table**
   ```sql
   CREATE TABLE analytics (
     id SERIAL PRIMARY KEY,
     metric_name VARCHAR(100) NOT NULL,
     metric_value DECIMAL NOT NULL,
     category VARCHAR(50),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Predictions Table**
   ```sql
   CREATE TABLE predictions (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     input_data JSONB NOT NULL,
     prediction_result JSONB NOT NULL,
     confidence DECIMAL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Clusters Table**
   ```sql
   CREATE TABLE clusters (
     id SERIAL PRIMARY KEY,
     cluster_id INTEGER NOT NULL,
     cluster_name VARCHAR(100) NOT NULL,
     cluster_data JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Association Rules Table**
   ```sql
   CREATE TABLE association_rules (
     id SERIAL PRIMARY KEY,
     antecedent JSONB NOT NULL,
     consequent JSONB NOT NULL,
     confidence DECIMAL NOT NULL,
     support DECIMAL NOT NULL,
     lift DECIMAL NOT NULL,
     category VARCHAR(50),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

## 🚀 Alternative Deployment Options

### Frontend Alternatives

1. **Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `client/dist`
   - Add environment variables

2. **GitHub Pages**
   - Enable GitHub Pages in repository settings
   - Use GitHub Actions for deployment
   - Update base URL in `vite.config.js`

### Backend Alternatives

1. **Railway**
   - Connect GitHub repository
   - Select Node.js template
   - Set start command: `npm start`
   - Add environment variables

2. **Heroku**
   - Create Heroku app
   - Connect GitHub repository
   - Add buildpacks: Node.js
   - Set environment variables

3. **DigitalOcean App Platform**
   - Create new app
   - Connect GitHub repository
   - Configure build and run commands
   - Set environment variables

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure environment variable storage
   - Rotate API keys regularly

2. **CORS Configuration**
   - Only allow necessary origins
   - Use HTTPS in production
   - Configure proper headers

3. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Use different limits for different endpoints
   - Monitor and adjust as needed

4. **Authentication**
   - Use Supabase RLS policies
   - Implement proper session management
   - Add CSRF protection

## 📈 Monitoring and Analytics

1. **Error Tracking**
   - Set up Sentry for error monitoring
   - Monitor API response times
   - Track user interactions

2. **Performance Monitoring**
   - Use Vercel Analytics for frontend
   - Monitor backend performance
   - Set up alerts for downtime

3. **Database Monitoring**
   - Monitor Supabase usage
   - Set up database backups
   - Track query performance

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"serviceId": "${{ secrets.RENDER_SERVICE_ID }}"}' \
            https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in Supabase settings
   - Ensure HTTPS is used in production

2. **Authentication Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure proper session handling

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **API Errors**
   - Check environment variables
   - Verify database connections
   - Monitor server logs

### Debug Mode

Enable debug mode by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 📞 Support

For deployment issues:
1. Check the logs in your hosting platform
2. Verify environment variables
3. Test locally first
4. Check Supabase dashboard for database issues

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features**
   - User authentication
   - Dashboard functionality
   - API endpoints
   - Chart rendering

2. **Set up monitoring**
   - Error tracking
   - Performance monitoring
   - Uptime monitoring

3. **Configure backups**
   - Database backups
   - Code backups
   - Environment variable backups

4. **Documentation**
   - Update README with production URLs
   - Document any custom configurations
   - Create user guides

---

Your Customer Behavior Mining System is now live! 🚀
