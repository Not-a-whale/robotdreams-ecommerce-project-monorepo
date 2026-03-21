'use server';
import { getSession } from './session';
import { authFetch } from './authFetch';

const getProfile = async () => {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('No session found');
  }
  const response = await authFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/protected`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to load profile: ${response.status}`);
  }
  return response.json();
};
export { getProfile };