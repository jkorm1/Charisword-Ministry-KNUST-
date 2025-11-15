const path = require('path');
const fs = require('fs');

// Load environment variables based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
const envPath = path.join(__dirname, '..', isProduction ? '.env.railway' : '.env.local');
console.log('Looking for env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

require('dotenv').config({ path: envPath });

const mysql = require('mysql2/promise');

async function setupDatabase() {
  // Log all environment variables (without password)
  console.log('\nEnvironment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Environment mode:', isProduction ? 'production' : 'development');
  
  const dbVars = ['MYSQLHOST', 'MYSQLPORT', 'MYSQLUSER', 'MYSQLDATABASE', 'MYSQLPASSWORD'];
  dbVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}:`, value ? (varName.includes('PASSWORD') ? '[REDACTED]' : value) : 'NOT SET');
  });

  // Validate required environment variables
  const missingVars = dbVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('\nMissing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  let connection;
  try {
    console.log('\nAttempting to connect to database...');
    
    // Use public URL when running locally with production env
    const connectionConfig = {
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      ssl: {
        rejectUnauthorized: false
      }
    };

    // If running locally with production env, use the public URL
    if (isProduction && !process.env.RAILWAY_ENVIRONMENT) {
      const publicUrl = new URL(process.env.MYSQL_PUBLIC_URL);
      connectionConfig.host = publicUrl.hostname;
      connectionConfig.port = publicUrl.port;
    }

    connection = await mysql.createConnection(connectionConfig);

    console.log('Successfully connected to database!');

    // List of SQL files in order
    const sqlFiles = [
      'clear-database.sql',
      '01-schema-creation.sql',
      '02-payments-system.sql',
      '03-seed-data.sql'
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



