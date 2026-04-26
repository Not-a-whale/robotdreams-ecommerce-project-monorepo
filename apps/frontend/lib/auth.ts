'use server';

import { redirect } from 'next/navigation';
import { FormState, LoginFormSchema, SignupFormSchema } from './type';
import { createSession, getSession } from './session';
import { cookies } from 'next/headers';
import { SERVER_BACKEND_URL } from './constants';

const backendUrl = SERVER_BACKEND_URL;

export type HydratedUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type BackendUser = {
  id: string | number;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  avatarFileId?: string | null;
};

const resolveAvatarUrl = async (
  user: BackendUser,
  accessToken?: string,
): Promise<string | null> => {
  const resolvedAvatarUrl = user.avatarUrl ?? null;

  if (!user.avatarFileId) {
    return resolvedAvatarUrl;
  }

  if (!accessToken) {
    return resolvedAvatarUrl;
  }

  const fileUrlResponse = await fetch(
    `${backendUrl}/files/${user.avatarFileId}/url?userId=${encodeURIComponent(String(user.id))}`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!fileUrlResponse.ok) {
    return resolvedAvatarUrl;
  }

  const fileUrlData = (await fileUrlResponse.json()) as { url?: string };
  return fileUrlData.url ?? resolvedAvatarUrl;
};

const getUserByIdentity = async (
  user: Pick<BackendUser, 'id' | 'email'>,
  accessToken?: string,
): Promise<BackendUser | null> => {
  if (!accessToken) {
    return null;
  }

  const latestUserUrl = `${backendUrl}/user/id/${encodeURIComponent(String(user.id))}`;

  const response = await fetch(latestUserUrl, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as BackendUser;
};

export async function getHydratedUserFromSessionSource(): Promise<HydratedUser | null> {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }


  try {
    const latestUser = await getUserByIdentity({
      id: String(session.user.id),
      email: session.user.email,
    }, session.accessToken);

    if (!latestUser) {
      return {
        id: String(session.user.id),
        name: session.user.name,
        avatarUrl: session.user.avatarUrl ?? null,
      };
    }

    const resolvedAvatarUrl = await resolveAvatarUrl(latestUser, session.accessToken);

    return {
      id: String(latestUser.id),
      name: latestUser.name,
      avatarUrl: resolvedAvatarUrl,
    };
  } catch {
    return {
      id: String(session.user.id),
      name: session.user.name,
      avatarUrl: session.user.avatarUrl ?? null,
    };
  }
}

export async function getHydratedProtectedUser(): Promise<{
  user: HydratedUser | null;
  token: string | null;
}> {
  const session = await getSession();
  console.log('Session data:', session);
  if (!session?.user?.id || !session.accessToken) {
    return { user: null, token: null };
  }
  console.log(
    'Session has user and access token, proceeding to fetch protected resource.',
  );
  const fallbackUser: HydratedUser = {
    id: String(session.user.id),
    name: session.user.name,
    avatarUrl: session.user.avatarUrl ?? null,
  };

  try {
    console.log(
      'Fetching protected resource with access token:',
      session.accessToken,
    );
    const response = await fetch(`${backendUrl}/auth/protected`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    });
    console.log('Protected resource response:', response);
    if (!response.ok) {
      return { user: fallbackUser, token: session.accessToken };
    }

    const protectedUser = (await response.json()) as BackendUser;
    const identityUser: BackendUser = {
      id: protectedUser.id,
      email: protectedUser.email,
      name: protectedUser.name,
      avatarUrl: protectedUser.avatarUrl ?? null,
      avatarFileId: protectedUser.avatarFileId ?? null,
    };

    const resolvedAvatarUrl = await resolveAvatarUrl(identityUser, session.accessToken);

    return {
      user: {
        id: String(identityUser.id),
        name: identityUser.name,
        avatarUrl: resolvedAvatarUrl,
      },
      token: session.accessToken,
    };
  } catch {
    return { user: fallbackUser, token: session.accessToken };
  }
}

export async function signUp(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const validationFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validationFields.success) {
    return {
      error: validationFields.error.flatten().fieldErrors,
    };
  }
  let response: Response;

  try {
    response = await fetch(`${backendUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationFields.data),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Sign-up request failed:', errorMessage);
    return {
      message: 'Unable to reach the backend service. Please try again.',
    };
  }

  if (response.ok) {
    redirect('/auth/signin');
  } else {
    return {
      message:
        response.status === 409 ? 'Email already exists' : response.statusText,
    };
  }
}

export async function signIn(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const validationFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validationFields.success) {
    return {
      error: validationFields.error.flatten().fieldErrors,
    };
  }

  let response: Response;

  try {
    response = await fetch(`${backendUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationFields.data),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Sign-in request failed:', errorMessage);
    return {
      message: 'Unable to reach the backend service. Please try again.',
    };
  }

  console.log('Sign-in response:', response);
  if (response.ok) {
    const result = await response.json();
    await createSession({
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        avatarUrl: result.avatarUrl ?? null,
      },
      accessToken: result?.accessToken,
      refreshToken: result?.refreshToken,
    });
    redirect('/dashboard');
  } else {
    return {
      message:
        response.status === 401
          ? 'Invalid email or password'
          : response.statusText,
    };
  }
}

export async function signOut() {
  const session = await getSession();
  if (session?.accessToken) {
    try {
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
    } catch {
      // backend unreachable — still clear the local session
    }
  }
  (await cookies()).delete('session');
  redirect('/auth/signin');
}

export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: oldRefreshToken }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    const { accessToken, refreshToken } = await response.json();
    const updateRes = await fetch('/api/auth/update', {
      method: 'POST',
      body: JSON.stringify({ accessToken, refreshToken }),
    });
    if (!updateRes.ok) {
      throw new Error('Failed to update tokens');
    }
    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh token');
  }
};
