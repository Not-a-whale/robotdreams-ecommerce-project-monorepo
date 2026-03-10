'use server';

import { getSession } from './session';

const getProfile = async () => {
  const session = await getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/protected`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    },
  );
  const result = await response.json();
  return result;
};
