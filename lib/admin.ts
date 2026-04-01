// Admin emails that can access the CEO dashboard
export const ADMIN_EMAILS = ['spinaiceo@gmail.com'];

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
