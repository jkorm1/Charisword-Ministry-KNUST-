const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
console.log('Looking for .env.local at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

require('dotenv').config({ path: envPath });

const mysql = require('mysql2/promise');

async function setupDatabase() {
  // Log all environment variables (without password)
  console.log('\nEnvironment Variables:');
  console.log('MYSQLHOST:', process.env.MYSQLHOST);
  console.log('MYSQLPORT:', process.env.MYSQLPORT);
  console.log('MYSQLUSER:', process.env.MYSQLUSER);
  console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
  console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '[REDACTED]' : 'NOT SET');

  // Validate required environment variables
  const requiredVars = ['MYSQLHOST', 'MYSQLPORT', 'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('\nMissing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  let connection;
  try {
    console.log('\nAttempting to connect to database...');
    connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Successfully connected to database!');

    // List of SQL files in order
    const sqlFiles = [
      '01-create-database-schema.sql',
      '02-seed-data.sql',
      '03-create-organization-info.sql',
      '04-create-service-expected-attendance.sql',
      '05-add_attendance_history_table.sql',
      '06-create_payments_table.sql',
      '07-update_date_payments_table.sql',
      '08-update_payments_table.sql',
      '09-add-program-to-offerings.sql',
      '10-add-partnership-service-and-program-connect.sql'
    ];

    // Execute each SQL file in order
    for (const file of sqlFiles) {
      console.log(`\nExecuting ${file}...`);
      
      try {
        const sqlFile = fs.readFileSync(
          path.join(__dirname, file),
          'utf8'
        );

        // Split the SQL file into individual statements
        const statements = sqlFile
          .split(';')
          .filter(statement => statement.trim().length > 0);

        // Execute each statement
        for (const statement of statements) {
          try {
            await connection.query(statement);
          } catch (error) {
            console.error(`Error executing statement in ${file}:`, error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }

        console.log(`Successfully completed ${file}`);
      } catch (error) {
        console.error(`Error reading or executing ${file}:`, error.message);
      }
    }

    console.log('\nAll database scripts executed successfully!');
  } catch (error) {
    console.error('\nError setting up database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

setupDatabase();
