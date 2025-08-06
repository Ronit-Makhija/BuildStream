#!/usr/bin/env node
/**
 * Script to set up local PostgreSQL database for TimeTracker Pro
 * Run this after setting up your local PostgreSQL instance
 */

const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function setupDatabase() {
  console.log('🚀 Setting up local PostgreSQL database...');
  
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.log('Please create .env.local with your database connection string');
    process.exit(1);
  }
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    // Create sample users
    console.log('👥 Creating sample users...');
    const adminPassword = await hashPassword('admin123');
    const employeePassword = await hashPassword('employee123');
    
    const insertQuery = `
      INSERT INTO users (username, password, role) VALUES 
      ('admin', $1, 'admin'),
      ('employee1', $2, 'employee'),
      ('sarah', $2, 'employee'),
      ('john', $2, 'employee'),
      ('mike', $2, 'employee')
      ON CONFLICT (username) DO NOTHING;
    `;
    
    const result = await pool.query(insertQuery, [adminPassword, employeePassword]);
    console.log(`✅ Sample users created!`);
    
    console.log('\n📝 Login Credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Employee: username=employee1, password=employee123');
    console.log('Employee: username=sarah, password=employee123');
    console.log('Employee: username=john, password=employee123');
    console.log('Employee: username=mike, password=employee123');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Verify your DATABASE_URL in .env.local');
    console.log('3. Ensure the database and user exist');
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, hashPassword };