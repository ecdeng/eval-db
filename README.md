# evaldb

A centralized repository and management interface for browser agent evaluations. This system allows engineers to curate, categorize, and tag test cases to measure agent performance across different web domains and tool requirements. Play with it here: https://eval-db.vercel.app/

## Features

- **Test Management**: Create, edit, and delete test cases with prompts, expected outcomes, and metadata
- **Advanced Filtering**: Filter tests by category, sub-category, difficulty, tool tags, and test sets
- **Bulk Operations**: Import tests from CSV, export filtered results, and bulk edit tags
- **Taxonomy Management**: Manage categories, sub-categories, and tool tags with constraint checking
- **Search**: Global search across prompts and golden answers
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Neon (Serverless PostgreSQL) with Prisma ORM
- **UI**: Shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query v5
- **Validation**: Zod
- **CSV Processing**: PapaParse (import), json2csv (export)

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Neon recommended - free tier available)
- Environment variables configured

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory. See [SETUP.md](./SETUP.md) for detailed database configuration instructions.
   
   **Quick start** (Neon - Recommended):
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&schema=public"
   ```
   
   Get your connection string from [neon.tech](https://neon.tech) after creating a project.
   
   For detailed setup instructions, see [SETUP.md](./SETUP.md).

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed default taxonomies
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed default taxonomies
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma client

## Project Structure

```
evals-db/
├── app/
│   ├── api/              # API routes
│   │   ├── tests/        # Test CRUD endpoints
│   │   ├── categories/   # Category management
│   │   ├── subcategories/# Sub-category management
│   │   └── tool-tags/    # Tool tag listing
│   ├── page.tsx          # Main dashboard
│   └── layout.tsx         # Root layout
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── settings/         # Settings components
│   └── ui/               # Shadcn/ui components
├── lib/
│   ├── api.ts            # TanStack Query hooks
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── public/               # Static assets
```

## Database Schema

The application uses three main models:

- **Test**: Main test entity with relations to Category and SubCategory
- **Category**: Top-level taxonomy (e.g., E-commerce, Productivity)
- **SubCategory**: Child taxonomy with parent relation

## CSV Import Format

When importing tests via CSV, use the following columns:

- `id` (optional) - UUID for updates
- `prompt` - Test instruction
- `initialUrl` or `initial_url` - Starting URL
- `golden` - Expected outcome
- `difficulty` - "simple" or "complex"
- `category` - Category name (must exist)
- `subCategory` or `Sub-Category` - Sub-category name (must exist)
- `toolTags` or `tool_tags` - Comma-separated tool tags
- `testSets` or `test_sets` - Comma-separated test set names

## Deployment

This application is optimized for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Start:**
1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `DATABASE_URL` environment variable (your Neon connection string)
4. Deploy
5. Run database migrations: `npx prisma migrate deploy` (or use Vercel CLI)

For detailed step-by-step instructions, troubleshooting, and alternative deployment options, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## License

MIT

