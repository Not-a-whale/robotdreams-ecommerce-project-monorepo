'use server';

import { redirect } from 'next/navigation';
import { FormState, LoginFormSchema, SignupFormSchema } from './type';
import { createSession } from './session';
import { cookies } from 'next/headers';

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://api:3000';

console.log('backendUrl', backendUrl);

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
