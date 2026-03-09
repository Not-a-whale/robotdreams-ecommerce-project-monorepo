import SignInButtons from '../SignInButton';
import { getSession } from '@/lib/session';
import Link from 'next/link';

const AppBar = async () => {
  const session = await getSession();

  return (
    <div className="py-2 shadow flex gap-3 bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
      <div className="flex items-center gap-4 w-full">
        {session && (
          <>
            <p>Welcome, {session?.user?.name}!</p>
            <Link href={'/'}>Home</Link>
            <Link href={'/dashboard'}>Dashboard</Link>
            <Link href={'/profile'}>Profile</Link>
          </>
        )}
          <div className="ml-auto mr-4">
            <SignInButtons session={session} />
          </div>
      </div>
    </div>
  );
};

export default AppBar;
