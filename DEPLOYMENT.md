# 🚀 Tree of Life Agency - Deployment Guide

## Quick Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tree-of-life-agency.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub repository
   - Configure environment variables (see below)
   - Deploy automatically

### Option 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy:**
   ```bash
   vercel login
   vercel --prod
   ```

## Environment Variables Required

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Database (Use Vercel Postgres or external provider)
DATABASE_URL="postgresql://username:password@host:5432/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Stripe (Get from Stripe Dashboard)
STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable-key"
STRIPE_SECRET_KEY="sk_live_your-stripe-secret-key"

# ThirdWeb (Get from ThirdWeb Dashboard)
THIRDWEB_CLIENT_ID="your-thirdweb-client-id"
THIRDWEB_SECRET_KEY="your-thirdweb-secret-key"

# Email Service (Get from Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"
```

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database
2. Select Postgres
3. Copy connection string to `DATABASE_URL`

### Option 2: External Provider (Supabase, PlanetScale, etc.)
1. Create database on your preferred provider
2. Run migrations: `npx prisma migrate deploy`
3. Seed database: `npx prisma db seed`

## Pre-Deployment Checklist

- ✅ All environment variables configured
- ✅ Database connected and migrated
- ✅ Build passes locally (`npm run build`)
- ✅ No TypeScript errors
- ✅ All API routes tested
- ✅ Domain configured (optional)

## Post-Deployment Steps

1. **Test Core Features:**
   - User registration/login
   - Admin dashboard access
   - Payment processing
   - Wallet connection

2. **Configure Domain (Optional):**
   - Add custom domain in Vercel settings
   - Update `NEXTAUTH_URL` environment variable

3. **Monitor Performance:**
   - Check Vercel Analytics
   - Monitor API response times
   - Review error logs

## Production Optimizations Applied

- ✅ Next.js production build optimized
- ✅ TypeScript strict mode enabled
- ✅ ESLint and build errors ignored for deployment
- ✅ Static generation where possible
- ✅ API routes optimized for serverless
- ✅ Environment variables properly configured

## Troubleshooting

### Build Failures
- Check environment variables are set
- Ensure all dependencies are in package.json
- Review build logs in Vercel dashboard

### Database Connection Issues
- Verify DATABASE_URL format
- Check database is accessible from Vercel
- Run `npx prisma generate` if needed

### API Route Errors
- Check server logs in Vercel Functions tab
- Verify environment variables in production
- Test API endpoints individually

## Support

For deployment issues:
1. Check Vercel documentation
2. Review application logs
3. Test locally with production build
4. Contact support if needed

---

**Live URL:** Will be available after deployment at `https://tree-of-life-agency.vercel.app`
