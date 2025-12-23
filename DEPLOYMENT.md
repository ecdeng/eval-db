# Deployment Guide

This guide will help you deploy the Browser Agent Test Management application to Vercel (recommended) or other platforms.

## Option 1: Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Next.js applications. It's optimized for Next.js and provides automatic deployments from Git.

### Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. A Vercel account (sign up at [vercel.com](https://vercel.com) - free tier available)
3. Your Neon database connection string

### Step-by-Step Deployment

#### 1. Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/evals-db.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"

2. **Import Your Repository**:
   - Select your `evals-db` repository
   - Click "Import"

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add the following:
     ```
     DATABASE_URL=your-neon-connection-string-here
     ```
   - Use your Neon connection string (the one from your `.env` file)
   - Make sure to select all environments (Production, Preview, Development)

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

#### 3. Run Database Migrations

After the first deployment, you need to run migrations on your production database:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migrations (this will use your production DATABASE_URL)
npx prisma migrate deploy
```

**Option B: Using Neon Console**

1. Go to your Neon project dashboard
2. Use the SQL Editor to run the migration SQL manually
3. Or use the connection string with a local Prisma command

**Option C: One-time Migration Script**

You can also create a one-time migration script that runs on first deployment:

```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Run migrations
  console.log('Running migrations...')
  // This would typically use prisma migrate deploy
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

#### 4. Seed Production Database (Optional)

If you want default taxonomies in production:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-neon-connection-string"

# Run seed
npm run db:seed
```

Or create a one-time API route that seeds on first access (be careful with this approach).

### Post-Deployment

1. **Verify Deployment**:
   - Visit your Vercel URL (e.g., `https://evals-db.vercel.app`)
   - Check that the application loads correctly

2. **Set Up Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Monitor Deployments**:
   - Vercel automatically deploys on every push to main
   - Preview deployments are created for pull requests
   - Check the Deployments tab for build logs

### Environment Variables in Vercel

- **Production**: Used for production deployments
- **Preview**: Used for preview deployments (PRs)
- **Development**: Used for local development with `vercel dev`

Make sure `DATABASE_URL` is set for all environments.

---

## Option 2: Other Deployment Platforms

### Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add `DATABASE_URL` environment variable
5. Railway will auto-detect Next.js and deploy

### Netlify

1. Create account at [netlify.com](https://netlify.com)
2. New site → Import from Git
3. Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add `DATABASE_URL` environment variable
6. Deploy

### Self-Hosted (VPS/Docker)

If you prefer self-hosting:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Run with Node.js**:
   ```bash
   npm start
   ```

3. **Or use Docker** (create a `Dockerfile`):
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

---

## Important Notes

### Database Migrations

- **Never run `prisma migrate dev` in production** - use `prisma migrate deploy` instead
- Migrations should be run as part of your deployment process
- Consider using a migration service or CI/CD pipeline

### Environment Variables

- Never commit `.env` files to Git (already in `.gitignore`)
- Always set `DATABASE_URL` in your hosting platform's environment variables
- Use different databases for development and production

### Build Optimizations

- Vercel automatically optimizes Next.js builds
- Static pages are pre-rendered
- API routes run as serverless functions

### Security

- Your Neon database connection string is secure in Vercel's environment variables
- Consider enabling Vercel's security features (rate limiting, etc.)
- Use strong database passwords

---

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 18+)

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly in Vercel
- Check that Neon database allows connections from Vercel's IPs
- Ensure SSL is enabled (`?sslmode=require`)

### Migrations Not Running

- Run migrations manually using Vercel CLI
- Or create a migration API route that runs once

### Environment Variables Not Working

- Make sure variables are set for the correct environment
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported in Vercel
- [ ] `DATABASE_URL` environment variable added
- [ ] First deployment completed
- [ ] Database migrations run on production
- [ ] Application tested on live URL
- [ ] Custom domain configured (optional)

---

## Next Steps After Deployment

1. **Set up monitoring** (optional):
   - Vercel Analytics
   - Error tracking (Sentry, etc.)

2. **Configure backups**:
   - Neon provides automatic backups
   - Consider additional backup strategies

3. **Set up CI/CD**:
   - Vercel handles this automatically
   - Consider adding tests to your workflow

4. **Performance optimization**:
   - Monitor page load times
   - Optimize database queries if needed

