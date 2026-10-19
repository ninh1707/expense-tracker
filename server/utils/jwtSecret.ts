/** Fail closed: never accept a hard-coded/default JWT signing key. */
export function getJwtSecret(): string {
  const value = process.env.JWT_SECRET?.trim();
  if (!value || value === 'CHANGE_ME_USE_OPENSSL_RAND_HEX_32' || value === 'finance_manager_super_secret_jwt_key_2026' || value.length < 32) {
    throw new Error('JWT_SECRET chưa được cấu hình an toàn (cần ít nhất 32 ký tự ngẫu nhiên).');
  }
  return value;
}
