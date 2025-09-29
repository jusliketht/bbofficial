// Quick JWT Debug Script
const jwt = require('jsonwebtoken');

console.log('🔍 JWT Debug Test');

const payload = {
  userId: 'test-user-id-123',
  email: 'test@example.com',
  role: 'user'
};

const secret = 'your-access-secret-key';
const expiry = '15m';

console.log('Payload:', payload);
console.log('Secret length:', secret.length);
console.log('Expiry:', expiry);

try {
  const token = jwt.sign(payload, secret, {
    expiresIn: expiry,
    issuer: 'itr-filing-platform',
    audience: 'users'
  });

  console.log('✅ JWT Generation successful!');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');

  // Test verification
  const decoded = jwt.verify(token, secret);
  console.log('✅ JWT Verification successful!');
  console.log('Decoded payload:', decoded);

} catch (error) {
  console.log('❌ JWT Error:', error.message);
  console.log('Error stack:', error.stack);
}
