import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { env } from '../env';
import { randomUUID } from 'crypto';

const pool = new Pool({
  connectionString: env.DIRECT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  const name = process.argv[2];
  const email = process.argv[3];
  const password = process.argv[4];

  if (!name || !email || !password) {
    console.error('Usage: npx ts-node src/db/createAdmin.ts "Full Name" "email@domain.com" "StrongPassword123!"');
    process.exit(1);
  }

  if (password.length < 10) {
    console.error('Error: Password must be at least 10 characters long.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const id = `u-${randomUUID().slice(0, 8)}`;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, active, force_approvals)
       VALUES ($1, $2, $3, $4, 'boss', true, 0)
       ON CONFLICT (email) DO UPDATE SET 
         password_hash = EXCLUDED.password_hash,
         active = true
       RETURNING id, name, email, role`,
      [id, name.trim(), normalizedEmail, passwordHash]
    );
    console.log('✅ Admin account created/updated successfully:');
    console.log(`   Name: ${res.rows[0].name}`);
    console.log(`   Email: ${res.rows[0].email}`);
    console.log(`   Role: ${res.rows[0].role}`);
  } catch (err) {
    console.error('❌ Failed to create admin:', err);
  } finally {
    await pool.end();
  }
}

createAdmin();