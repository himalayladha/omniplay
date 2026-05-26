/**
 * Registration is disabled for public users.
 * New accounts can only be created through:
 *  - /install  → first-run setup wizard (creates the super-admin)
 *  - /admin    → admin panel User Management (admins can promote existing users)
 *
 * This page redirects anyone who lands on /register to the install wizard.
 */
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  redirect('/install');
}
