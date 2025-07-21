const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/generate-admin-hash.js <your-admin-password>');
  console.log('Example: node scripts/generate-admin-hash.js mySecureAdminPassword');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('Admin password hash:');
console.log(hash);
console.log('\nAdd this to your Vercel environment variables as ADMIN_PASSWORD_HASH');