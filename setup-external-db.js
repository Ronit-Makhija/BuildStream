#!/usr/bin/env node
/**
 * Setup external database for TimeTracker Pro
 * Creates tables and sample users
 */

import pg from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const { Pool } = pg;
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function setupExternalDatabase() {
  console.log('🚀 Setting up external database for TimeTracker Pro...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('Please add DATABASE_URL to your Replit Secrets');
    process.exit(1);
  }
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    // Create tables
    console.log('📊 Creating database tables...');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee'))
      )
    `);
    
    // Tasks table  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        description TEXT NOT NULL,
        hours NUMERIC(4,2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Timesheets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
        total_hours NUMERIC(4,2) NOT NULL DEFAULT 0,
        submitted_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, date)
      )
    `);
    
    // Session table for authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      ) WITH (OIDS=FALSE);
      
      ALTER TABLE session DROP CONSTRAINT IF EXISTS session_pkey;
      ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
      
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);
    `);
    
    console.log('✅ Database tables created!');
    
    // Create sample users
    console.log('👥 Creating sample users...');
    const adminPassword = await hashPassword('admin123');
    const employeePassword = await hashPassword('employee123');
    
    await pool.query(`
      INSERT INTO users (username, password, role) VALUES 
      ('admin', $1, 'admin'),
      ('employee1', $2, 'employee'),
      ('sarah', $2, 'employee'),
      ('john', $2, 'employee'),
      ('mike', $2, 'employee')
      ON CONFLICT (username) DO NOTHING
    `, [adminPassword, employeePassword]);
    
    console.log('✅ Sample users created!');
    
    console.log('\n🎉 External database setup complete!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Employee: username=employee1, password=employee123');
    console.log('Employee: username=sarah, password=employee123');
    console.log('Employee: username=john, password=employee123');
    console.log('Employee: username=mike, password=employee123');
    
    console.log('\n🚀 Your app is now ready with external database!');
    console.log('✅ No more Replit database limits');
    console.log('✅ Continue developing on Replit');
    console.log('✅ Full database control');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify DATABASE_URL in Replit Secrets');
    console.log('2. Make sure external database is running');
    console.log('3. Check connection string format');
    process.exit(1);
  }
}

setupExternalDatabase();