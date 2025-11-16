const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
  const connection = await mysql.createConnection({
    host: 'ballast.proxy.rlwy.net',
    port: 27236,
    user: 'root',
    password: 'XXiVqTIvMfrkaXZyKiWEaswMTzMMIsqY',
    database: 'railway',
    ssl: {
      rejectUnauthorized: false
    }
  });

  const users = [
    { email: 'admin@charisword.org', password: 'admin123' },
    { email: 'protocol@charisword.org', password: 'protocol123' },
    { email: 'Betty@charisword.org', password: 'betty123' },
    { email: 'finance@charisword.org', password: 'finance123' }
  ];

  try {
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hash, user.email]
      );
      console.log(`Updated password for ${user.email}`);
    }
    console.log('All passwords updated successfully!');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await connection.end();
  }
}

updatePasswords();
