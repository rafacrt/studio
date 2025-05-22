
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Always redirect to the dashboard as login is removed
  redirect('/dashboard');
  // Return null as redirect will handle it.
  return null;
}
