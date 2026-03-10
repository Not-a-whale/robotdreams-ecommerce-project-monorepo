'use server';

import { redirect } from 'next/navigation';
import { FormState, LoginFormSchema, SignupFormSchema } from './type';
import { createSession, getSession } from './session';
import { cookies } from 'next/headers';

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://api:3000';

console.log('backendUrl', backendUrl);

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
): Promise<string | null> => {
  const resolvedAvatarUrl = user.avatarUrl ?? null;

  if (!user.avatarFileId) {
    return resolvedAvatarUrl;
  }

  const fileUrlResponse = await fetch(
    `${backendUrl}/files/${user.avatarFileId}/url?userId=${encodeURIComponent(String(user.id))}`,
    { cache: 'no-store' },
  );

  if (!fileUrlResponse.ok) {
    return resolvedAvatarUrl;
  }

  const fileUrlData = (await fileUrlResponse.json()) as { url?: string };
  return fileUrlData.url ?? resolvedAvatarUrl;
};

const getUserByIdentity = async (
  user: Pick<BackendUser, 'id' | 'email'>,
): Promise<BackendUser | null> => {
  const latestUserUrl = user.email
    ? `${backendUrl}/user/${encodeURIComponent(user.email)}`
    : `${backendUrl}/user/id/${encodeURIComponent(String(user.id))}`;

  const response = await fetch(latestUserUrl, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as BackendUser;
};

// Legacy hydration source kept for fallback while transitioning to protected-user JSON.
export async function getHydratedUserFromSessionSource(): Promise<HydratedUser | null> {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const latestUser = await getUserByIdentity({
      id: String(session.user.id),
      email: session.user.email,
    });

    if (!latestUser) {
      return {
        id: String(session.user.id),
        name: session.user.name,
        avatarUrl: session.user.avatarUrl ?? null,
      };
    }

    const resolvedAvatarUrl = await resolveAvatarUrl(latestUser);

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

export async function getHydratedProtectedUser(): Promise<HydratedUser | null> {
  const session = await getSession();
  console.log('Session data:', session);
  if (!session?.user?.id || !session.accessToken) {
    return null;
  }
  console.log('Session has user and access token, proceeding to fetch protected resource.');
  const fallbackUser: HydratedUser = {
    id: String(session.user.id),
    name: session.user.name,
    avatarUrl: session.user.avatarUrl ?? null,
  };

  try {
    console.log('Fetching protected resource with access token:', session.accessToken);
    const response = await fetch(`${backendUrl}/auth/protected`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    });
    console.log('Protected resource response:', response);
    if (!response.ok) {
      return fallbackUser;
    }

    const protectedUser = (await response.json()) as BackendUser;
    const identityUser: BackendUser = {
      id: protectedUser.id,
      email: protectedUser.email,
      name: protectedUser.name,
      avatarUrl: protectedUser.avatarUrl ?? null,
      avatarFileId: protectedUser.avatarFileId ?? null,
    };

    const latestUser = await getUserByIdentity({
      id: identityUser.id,
      email: identityUser.email,
    });

    const avatarSource = latestUser ?? identityUser;
    const resolvedAvatarUrl = await resolveAvatarUrl(avatarSource);

    return {
      id: String(identityUser.id),
      name: identityUser.name,
      avatarUrl: resolvedAvatarUrl,
    };
  } catch {
    return fallbackUser;
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
  (await cookies()).delete('session');
  redirect('/auth/signin');
}
