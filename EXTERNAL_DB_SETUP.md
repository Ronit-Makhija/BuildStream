# External Database Setup for TimeTracker Pro

Choose one of these external database services to eliminate Replit's free tier limits while continuing development on Replit.

## Option 1: Supabase (Recommended - Free Forever)

### Setup Steps:
1. Go to [supabase.com](https://supabase.com)
2. Create free account and new project
3. Set a strong database password
4. Go to Project Settings → Database
5. Copy the "Connection string" under "Connection pooling"
6. Replace `[YOUR-PASSWORD]` with your database password

### Update Replit Secrets:
1. In Replit, go to Tools → Secrets
2. Add these secrets:
   - `DATABASE_URL`: `postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
   - `SESSION_SECRET`: Generate random string (32+ characters)

### Advantages:
- ✅ **Free forever** (500MB database)
- ✅ **No time limits**
- ✅ **Real PostgreSQL**
- ✅ **Built-in dashboard**
- ✅ **Automatic backups**

## Option 2: Neon (Generous Free Tier)

### Setup Steps:
1. Go to [neon.tech](https://neon.tech)
2. Create free account and project
3. Copy connection string from dashboard
4. Add to Replit secrets as `DATABASE_URL`

### Advantages:
- ✅ **3 GB storage free**
- ✅ **Serverless PostgreSQL**
- ✅ **Automatic scaling**
- ✅ **No time limits on free tier**

## Option 3: Railway (Good Free Tier)

### Setup Steps:
1. Go to [railway.app](https://railway.app)
2. Create project with PostgreSQL
3. Get connection string from Variables tab
4. Add to Replit secrets

### Advantages:
- ✅ **$5 free credits monthly**
- ✅ **Real PostgreSQL**
- ✅ **Easy deployment later**

## Option 4: PlanetScale (MySQL Alternative)

### Setup Steps:
1. Go to [planetscale.com](https://planetscale.com)
2. Create free database
3. Get connection string
4. Minor schema adjustments needed (MySQL vs PostgreSQL)

### Advantages:
- ✅ **5GB free storage**
- ✅ **Branching for database**
- ✅ **No connection limits**

## Quick Setup for Supabase (5 minutes):

1. **Create Supabase project**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Get connection string**: Settings → Database → Connection string
3. **Add to Replit**: Tools → Secrets → Add `DATABASE_URL`
4. **Push schema**: `npm run db:push`
5. **Continue developing!**

## Why These Are Better Than Replit Database:

| Feature | Replit Free | External Services |
|---------|-------------|-------------------|
| Storage | 10GB | 500MB-5GB |
| Time limits | Usage-based | None |
| Connections | Limited | Higher limits |
| Backups | Basic | Automatic |
| Control | Limited | Full control |
| Cost predictability | Variable | Fixed/Free |

## Recommended: Start with Supabase

Supabase is the easiest migration because:
- Uses PostgreSQL (no schema changes needed)
- Generous free tier with no time limits
- Excellent dashboard for database management
- Can scale up later if needed
- Works perfectly with your existing Drizzle setup