import crypto from 'crypto';

export function generateMagicToken(bookingId, email) {
  const salt = process.env.ADMIN_PASSWORD || 'admin123';
  return crypto.createHmac('sha256', salt)
    .update(`${bookingId}:${email}`)
    .digest('hex')
    .slice(0, 16);
}

export function validateMagicToken(bookingId, email, token) {
  if (!bookingId || !email || !token) return false;
  const expected = generateMagicToken(bookingId, email);
  return expected === token;
}
