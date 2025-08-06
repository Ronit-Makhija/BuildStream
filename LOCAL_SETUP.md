# Local PostgreSQL Setup Guide for TimeTracker Pro

This guide will help you switch from Replit's managed database to your own local PostgreSQL instance.

## Part 1: Install PostgreSQL Locally

### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run installer with default settings (port 5432)
3. Remember the superuser password you set
4. Add PostgreSQL to PATH:
   - Open System Properties → Advanced → Environment Variables
   - Add `C:\Program Files\PostgreSQL\15\bin` to your PATH
   - Or restart Command Prompt and use full path to psql

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Part 2: Create Database and User

Access PostgreSQL:

**Option A: Using full path (if PATH not set)**
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

**Option B: Using SQL Shell (recommended for Windows)**
- Start Menu → PostgreSQL 15 → SQL Shell (psql)
- Press Enter for default values (server, database, port, username)
- Enter your postgres password

**Option C: Using pgAdmin (GUI)**
- Start Menu → PostgreSQL 15 → pgAdmin 4
- Connect to local server with your postgres password

**macOS/Linux:**
```bash
sudo -u postgres psql
```

Create database and user:
```sql
-- Create database
CREATE DATABASE timesheet_app;

-- Create user
CREATE USER timesheet_user WITH PASSWORD 'secure_password_123';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE timesheet_app TO timesheet_user;

-- Connect to the new database and grant schema permissions
\c timesheet_app
GRANT ALL ON SCHEMA public TO timesheet_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timesheet_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timesheet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO timesheet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO timesheet_user;

\q
```

## Part 3: Configure the Application

### 1. Create Local Environment File

Create `.env.local` in your project root:
```bash
# Local PostgreSQL Configuration
DATABASE_URL="postgresql://timesheet_user:secure_password_123@localhost:5432/timesheet_app"

# Session Secret (generate a new one for production)
SESSION_SECRET="your-super-secret-session-key-here-make-it-long-and-random"

# Environment
NODE_ENV=development
```

### 2. Install dotenv (if not already installed)
```bash
npm install dotenv
```

### 3. Push Database Schema
```bash
# Using the local database
NODE_ENV=development node -r dotenv/config node_modules/.bin/drizzle-kit push dotenv_config_path=.env.local
```

### 4. Set Up Sample Users
```bash
# Run the setup script
node -r dotenv/config setup-local-db.js dotenv_config_path=.env.local
```

### 5. Run the Application Locally
```bash
# Run with local database
NODE_ENV=development node -r dotenv/config server/index.ts dotenv_config_path=.env.local

# Or using tsx
NODE_ENV=development tsx -r dotenv/config server/index.ts dotenv_config_path=.env.local
```

## Part 4: Default Login Credentials

After running the setup script, you can login with:

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Employee Accounts:**
- Username: `employee1` | Password: `employee123`
- Username: `sarah` | Password: `employee123`
- Username: `john` | Password: `employee123`
- Username: `mike` | Password: `employee123`

## Part 5: Troubleshooting

### Connection Issues
1. Ensure PostgreSQL is running:
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql  # Linux
   brew services list | grep postgres  # macOS
   ```

2. Test connection manually:
   ```cmd
   # Windows (use full path if psql not in PATH)
   "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -p 5432 -U timesheet_user -d timesheet_app
   
   # Or use SQL Shell: Start Menu → PostgreSQL 15 → SQL Shell (psql)
   # Then enter: timesheet_app, timesheet_user, localhost, 5432, [password]
   ```
   
   ```bash
   # macOS/Linux
   psql -h localhost -p 5432 -U timesheet_user -d timesheet_app
   ```

### Permission Issues
If you get permission errors, reconnect to the database as superuser and re-run the GRANT commands.

### Port Conflicts
If port 5432 is busy, you can change PostgreSQL port in:
- Linux: `/etc/postgresql/15/main/postgresql.conf`
- macOS: `/usr/local/var/postgres/postgresql.conf`
- Windows: `C:\Program Files\PostgreSQL\15\data\postgresql.conf`

Then update your `DATABASE_URL` accordingly.

## Part 6: Production Deployment

For production deployment:

1. Use a strong password for the database user
2. Generate a secure SESSION_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
3. Consider using environment variables instead of `.env.local`
4. Set up proper firewall rules for database access
5. Enable SSL for database connections in production

## Database Schema

The application automatically creates these tables:
- `users` - User accounts with roles
- `tasks` - Task entries with timestamps  
- `timesheets` - Daily timesheet summaries
- `session` - Session storage

All relationships and constraints are handled automatically by Drizzle ORM.