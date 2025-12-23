# Database Setup Guide

## DATABASE_URL Configuration

The `DATABASE_URL` environment variable is required to connect to your PostgreSQL database. Here are setup instructions for different scenarios:

### Option 1: Neon (Recommended - Easiest Setup)

**Neon** is a serverless PostgreSQL that's extremely easy to set up, has no IP restrictions, and works perfectly with Vercel.

1. **Create a Neon account**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub (free tier available)
   - Click "Create Project"
   - Choose a name and region (closest to you)

2. **Get your connection string**:
   - After creating the project, you'll see a connection string immediately
   - It looks like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - Copy the connection string (you can also find it later in Settings → Connection Details)

3. **Create `.env` file**:
   ```bash
   # Create .env file in the root directory
   touch .env
   ```

4. **Add DATABASE_URL to `.env`**:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&schema=public"
   ```
   
   Replace the connection string with your actual Neon connection string. The `?sslmode=require&schema=public` parameters are already included in Neon's connection string, but we add `&schema=public` for Prisma.

   **Benefits of Neon**:
   - ✅ No IP restrictions
   - ✅ Automatic SSL
   - ✅ Free tier (generous limits)
   - ✅ Instant setup
   - ✅ Great Vercel integration
   - ✅ Database branching for testing

### Option 2: Supabase

1. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Fill in project details and wait for it to be created

2. **Get your connection string**:
   - In your Supabase project, go to **Settings** → **Database**
   - Scroll down to **Connection string** section
   - Select **URI** tab
   - Copy the connection string

3. **Add DATABASE_URL to `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public&sslmode=require"
   ```
   
   **Note**: Supabase may require IP allowlisting. Check Settings → Database → Connection pooling for IP restrictions.

### Option 3: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   - **macOS**: `brew install postgresql@15` or download from [postgresql.org](https://www.postgresql.org/download/)
   - **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian) or use your package manager
   - **Windows**: Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Create a database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE evals_db;
   
   # Create user (optional, or use default postgres user)
   CREATE USER evals_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE evals_db TO evals_user;
   
   # Exit psql
   \q
   ```

3. **Create `.env` file**:
   ```bash
   touch .env
   ```

4. **Add DATABASE_URL to `.env`**:
   ```env
   DATABASE_URL="postgresql://evals_user:your_password@localhost:5432/evals_db?schema=public"
   ```
   
   Or if using the default postgres user:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/evals_db?schema=public"
   ```

### Option 4: Other PostgreSQL Hosting Services

For other PostgreSQL providers (AWS RDS, Railway, Neon, etc.), use their provided connection string format:

```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

## After Setting Up DATABASE_URL

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```
   
   This will create all the necessary tables in your database.

3. **Seed Default Data** (optional):
   ```bash
   npm run db:seed
   ```
   
   This will populate default categories, sub-categories, and tool tags.

4. **Verify Connection** (optional):
   ```bash
   npm run db:studio
   ```
   
   This opens Prisma Studio where you can view and edit your database data in a GUI.

## Troubleshooting

### Connection Refused
- Check that PostgreSQL is running: `pg_isready` or `psql -U postgres`
- Verify the host and port are correct
- Check firewall settings if using a remote database

### Authentication Failed
- Double-check your username and password
- For Supabase: Make sure you're using the database password, not your account password
- URL-encode special characters in passwords

### Database Does Not Exist
- Create the database first: `CREATE DATABASE evals_db;`
- Verify the database name in your connection string

### SSL Required
If you get SSL errors, add `?sslmode=require` to your connection string:
```env
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public&sslmode=require"
```

**Note**: Neon includes SSL by default, so this is usually not needed.

## Security Notes

- **Never commit `.env` to version control** - it's already in `.gitignore`
- Use strong passwords for production databases
- Consider using connection pooling for production (Supabase provides this automatically)
- For production, use environment variables provided by your hosting platform (Vercel, etc.)

