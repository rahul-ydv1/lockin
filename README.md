# LockIn

A personal knowledge graph, concept tracker, and study planner built with Next.js and Prisma.

## Architecture

LockIn organizes self-directed learning into an interconnected graph:

- **Knowledge Graph & Concepts**: Track concepts, define prerequisites, and monitor mastery progression (Novice to Mastered).
- **Resources & Notes**: Save and categorize articles, books, papers, and videos with rich metadata and domain previews.
- **Spaced Repetition**: Active recall review system implementing the SM-2 algorithm.
- **Study Planner**: Schedule study tasks, execute focused Pomodoro sessions, and track semester timelines.
- **Skills & Projects**: Link learned concepts to practical projects and skill trees.
- **Analytics**: Activity heatmaps, learning velocity, and mastery distributions.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Database & ORM**: PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Auth.js / NextAuth v5](https://authjs.dev/) (OAuth & Credentials)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/) & React Hook Form

## Getting Started

### 1. Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in the required credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct PostgreSQL connection string (for migrations)
- `AUTH_SECRET`: Secret key for session encryption
- `NEXTAUTH_URL`: Canonical URL (e.g., `http://localhost:3000`)

### 3. Database Migration & Seed

Generate the Prisma client, push schemas, and seed development data:

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

- `pnpm dev`: Start the Next.js development server
- `pnpm build`: Generate Prisma client and create production build
- `pnpm start`: Run the production server
- `pnpm lint`: Run ESLint across the codebase
- `pnpm db:push`: Push schema changes directly to the database
- `pnpm db:seed`: Seed sample data
