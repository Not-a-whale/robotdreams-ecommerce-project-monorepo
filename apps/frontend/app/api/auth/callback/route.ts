import { createSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const avatarUrl = searchParams.get('avatarUrl');

  if (!accessToken || !refreshToken) {
    return new Response('Missing tokens', { status: 400 });
  }

  await createSession({
    user: {
      id: userId!,
      email: email!,
      name: name!,
      avatarUrl: avatarUrl || null,
    },
    accessToken,
    refreshToken,
  });

  redirect('/'); // Redirect to home page after successful login
}
