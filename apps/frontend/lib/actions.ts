'use server';
import { getSession } from './session';
import { authFetch } from './authFetch';
import { SERVER_BACKEND_URL } from './constants';

const getProfile = async () => {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('No session found');
  }
  const response = await authFetch(
    `${SERVER_BACKEND_URL}/auth/protected`,
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