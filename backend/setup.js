#!/usr/bin/env node

/**
 * SAC Treasury Portal - Setup Script
 * 
 * This script helps you set up initial data for the portal:
 * 1. Create treasury account
 * 2. Bulk create student accounts
 * 3. Bulk create entity accounts
 * 
 * Usage: node setup.js
 */

import axios from 'axios';
import readline from 'readline';
import fs from 'fs';

const API_URL = process.env.API_URL || 'http://localhost:5000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createTreasuryAccount() {
  console.log('\n📋 === CREATE TREASURY ACCOUNT ===\n');
  
  const email = await question('Treasury Email (e.g., treasury@iimidr.ac.in): ');
  const password = await question('Treasury Password (min 8 characters): ');

  try {
    const response = await axios.post(`${API_URL}/api/auth/setup/treasury`, {
      email,
      password
    });

    console.log('\n✅ Treasury account created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  Save these credentials securely!\n');
  } catch (error) {
    console.error('\n❌ Error creating treasury account:');
    console.error(error.response?.data || error.message);
  }
}

async function bulkCreateStudents() {
  console.log('\n📋 === BULK CREATE STUDENT ACCOUNTS ===\n');
  console.log('You can provide student emails in two ways:');
  console.log('1. Enter a CSV file path with emails');
  console.log('2. Enter emails manually (comma-separated)\n');
  
  const choice = await question('Choose option (1 or 2): ');

  let emails = [];

  if (choice === '1') {
    const filePath = await question('Enter CSV file path: ');
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      emails = content.split('\n')
        .map(line => line.trim())
        .filter(email => email && email.includes('@'));
    } catch (error) {
      console.error('❌ Error reading file:', error.message);
      return;
    }
  } else {
    const input = await question('Enter emails (comma-separated): ');
    emails = input.split(',').map(email => email.trim()).filter(email => email);
  }

  console.log(`\n📧 Found ${emails.length} email(s)`);
  console.log('Sample:', emails.slice(0, 3).join(', '), '...\n');

  const confirm = await question('Proceed with creation? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled');
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/api/auth/setup/students`, {
      emails
    });

    console.log('\n✅ Student accounts created!');
    console.log(`Total: ${response.data.total}`);
    console.log(`Successful: ${response.data.successful}`);
    console.log(`Failed: ${response.data.failed}`);

    if (response.data.failed > 0) {
      console.log('\n❌ Failed accounts:');
      response.data.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.email}: ${r.error}`));
    }

    // Save credentials to file
    const credentials = response.data.results
      .filter(r => r.success)
      .map(r => `${r.email},${r.password}`)
      .join('\n');

    const filename = `student_credentials_${Date.now()}.csv`;
    fs.writeFileSync(filename, 'Email,Password\n' + credentials);
    console.log(`\n📁 Credentials saved to: ${filename}`);

  } catch (error) {
    console.error('\n❌ Error creating student accounts:');
    console.error(error.response?.data || error.message);
  }
}

async function bulkCreateEntities() {
  console.log('\n📋 === BULK CREATE ENTITY ACCOUNTS ===\n');
  console.log('You can provide entities in two ways:');
  console.log('1. Enter a CSV file path (email,entityName)');
  console.log('2. Enter manually\n');
  
  const choice = await question('Choose option (1 or 2): ');

  let entities = [];

  if (choice === '1') {
    const filePath = await question('Enter CSV file path: ');
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      entities = content.split('\n')
        .slice(1) // Skip header
        .map(line => {
          const [email, entityName] = line.split(',').map(s => s.trim());
          return { email, entityName };
        })
        .filter(e => e.email && e.entityName);
    } catch (error) {
      console.error('❌ Error reading file:', error.message);
      return;
    }
  } else {
    console.log('\nEnter entities one by one (empty email to finish):\n');
    
    while (true) {
      const email = await question('Entity Email: ');
      if (!email) break;
      
      const entityName = await question('Entity Name: ');
      entities.push({ email, entityName });
      console.log('✓ Added\n');
    }
  }

  console.log(`\n🏢 Found ${entities.length} entity/entities`);
  entities.forEach(e => console.log(`  - ${e.entityName} (${e.email})`));

  const confirm = await question('\nProceed with creation? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled');
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/api/auth/setup/entities`, {
      entities
    });

    console.log('\n✅ Entity accounts created!');
    console.log(`Total: ${response.data.total}`);
    console.log(`Successful: ${response.data.successful}`);
    console.log(`Failed: ${response.data.failed}`);

    if (response.data.failed > 0) {
      console.log('\n❌ Failed accounts:');
      response.data.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.email}: ${r.error}`));
    }

    // Save credentials to file
    const credentials = response.data.results
      .filter(r => r.success)
      .map(r => `${r.email},${r.entityName},${r.password}`)
      .join('\n');

    const filename = `entity_credentials_${Date.now()}.csv`;
    fs.writeFileSync(filename, 'Email,Entity Name,Password\n' + credentials);
    console.log(`\n📁 Credentials saved to: ${filename}`);

  } catch (error) {
    console.error('\n❌ Error creating entity accounts:');
    console.error(error.response?.data || error.message);
  }
}

async function main() {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║       SAC TREASURY PORTAL - SETUP SCRIPT          ║
  ║              IIM Indore                           ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);

  console.log(`\nBackend API URL: ${API_URL}\n`);

  while (true) {
    console.log('\n=== MAIN MENU ===\n');
    console.log('1. Create Treasury Account');
    console.log('2. Bulk Create Student Accounts');
    console.log('3. Bulk Create Entity Accounts');
    console.log('4. Exit\n');

    const choice = await question('Choose an option (1-4): ');

    switch (choice) {
      case '1':
        await createTreasuryAccount();
        break;
      case '2':
        await bulkCreateStudents();
        break;
      case '3':
        await bulkCreateEntities();
        break;
      case '4':
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n❌ Invalid option');
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
