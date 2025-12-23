# Easier Database Setup Alternatives

## Option 1: Neon (Recommended - Easiest Setup)

**Neon** is a serverless PostgreSQL that's extremely easy to set up and works perfectly with Vercel.

### Setup Steps:

1. **Create a Neon account**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub (free tier available)
   - Click "Create Project"

2. **Get your connection string**:
   - After creating the project, you'll see a connection string immediately
   - It looks like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - Copy the connection string

3. **Update your `.env` file**:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&schema=public"
   ```

4. **That's it!** Neon handles SSL automatically and has no IP restrictions.

### Benefits:
- ✅ Free tier (generous limits)
- ✅ No IP restrictions
- ✅ Automatic SSL
- ✅ Instant setup
- ✅ Great Vercel integration
- ✅ Branching (create database branches for testing)

---

## Option 2: Vercel Postgres

Vercel offers managed Postgres that integrates directly with your Vercel projects.

### Setup Steps:

1. **In your Vercel dashboard**:
   - Go to your project (or create one)
   - Navigate to **Storage** tab
   - Click **Create Database** → **Postgres**
   - Choose a plan (Hobby tier is free)

2. **Connection string is auto-configured**:
   - Vercel automatically adds `POSTGRES_URL` to your environment variables
   - Update your `.env` to use it:
   ```env
   DATABASE_URL="${POSTGRES_URL}?schema=public"
   ```
   - Or in Vercel dashboard, add `DATABASE_URL` with value: `${{POSTGRES_URL}}?schema=public`

3. **For local development**:
   - In Vercel dashboard, go to your Postgres database
   - Copy the connection string
   - Add to your local `.env` file

### Benefits:
- ✅ Seamless Vercel integration
- ✅ Free tier available
- ✅ No separate account needed
- ✅ Automatic environment variable setup

---

## Option 3: Railway (Very Easy)

Railway is another great option with a simple setup process.

### Setup Steps:

1. **Create a Railway account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"

2. **Add PostgreSQL**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically creates the database

3. **Get connection string**:
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy the `DATABASE_URL` value

4. **Update your `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway?schema=public"
   ```

### Benefits:
- ✅ $5 free credit monthly
- ✅ Simple setup
- ✅ Good documentation
- ✅ Easy scaling

---

## Option 4: Local PostgreSQL (For Development)

If you just want to get started quickly for development:

### macOS (using Homebrew):

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb evals_db

# Update .env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/evals_db?schema=public"
```

### Benefits:
- ✅ No external dependencies
- ✅ Fast for development
- ✅ Free
- ✅ No internet required

---

## Quick Comparison

| Option | Setup Time | Free Tier | Vercel Integration | Best For |
|--------|-----------|-----------|-------------------|----------|
| **Neon** | ⚡ 2 min | ✅ Yes | ⭐⭐⭐ Excellent | Production & Dev |
| **Vercel Postgres** | ⚡ 3 min | ✅ Yes | ⭐⭐⭐ Perfect | Vercel Projects |
| **Railway** | ⚡ 3 min | ✅ $5 credit | ⭐⭐ Good | General Use |
| **Local** | ⚡ 5 min | ✅ Free | ⭐ Basic | Development Only |

---

## Recommendation

**For easiest setup**: Use **Neon**
- Fastest to get started
- No IP restrictions
- Great free tier
- Works perfectly with Vercel

**For Vercel projects**: Use **Vercel Postgres**
- Best integration
- Automatic environment variables
- No separate account management

---

## After Choosing Your Database

Once you have your `DATABASE_URL` configured:

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Seed Default Data**:
   ```bash
   npm run db:seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

