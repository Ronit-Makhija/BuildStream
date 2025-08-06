#!/usr/bin/env node
/**
 * Push database schema to external database
 */

import { execSync, spawn } from 'child_process';
import pg from 'pg';
const { Pool } = pg;

async function pushSchema() {
  console.log('🚀 Pushing database schema...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not found');
    process.exit(1);
  }
  
  try {
    // Test database connection first
    console.log('🔌 Testing database connection...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query('SELECT NOW()');
    await pool.end();
    console.log('✅ Database connection successful!');
    
    // Push schema using drizzle-kit
    console.log('📊 Pushing database schema...');
    
    // Use child process to handle the interactive prompt
    const child = spawn('npx', ['drizzle-kit', 'push'], {
      stdio: ['pipe', 'inherit', 'inherit'],
      env: process.env
    });
    
    // Auto-respond "yes" to the data loss warning
    setTimeout(() => {
      child.stdin.write('y\n');
    }, 2000);
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database schema pushed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Schema push failed');
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nMake sure to:');
    console.log('1. Update DATABASE_URL in Replit Secrets');
    console.log('2. Use correct external database connection string');
    process.exit(1);
  }
}

pushSchema();