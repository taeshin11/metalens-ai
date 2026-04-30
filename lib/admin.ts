const ADMIN_EMAILS_ENV = process.env.ADMIN_EMAILS;
export const ADMIN_EMAILS = ADMIN_EMAILS_ENV
  ? ADMIN_EMAILS_ENV.split(',').map(e => e.trim().toLowerCase())
  : ['spinaiceo@gmail.com', 'taeshinkim11@gmail.com'];

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
