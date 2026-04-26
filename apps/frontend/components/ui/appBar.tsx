import { getSession } from '@/lib/session';
import Link from 'next/link';
import { Suspense } from 'react';
import { ShoppingCartIcon } from '../ShoppingCartIcon';
import { UserMenu } from '../UserMenu';
import Search from '../Search';

const AppBar = async () => {
  const session = await getSession();

  return (
    <div className="py-2 shadow flex gap-3 bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
      <div className="flex items-center gap-4 w-full px-4">
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <div className="flex-1 flex justify-center px-4">
          <Suspense fallback={null}>
            <Search />
          </Suspense>
        </div>
        <div className="flex items-center gap-4">
          <ShoppingCartIcon />
          {session ? (
            <UserMenu
              name={session.user.name}
              initialAvatarUrl={session.user.avatarUrl}
            />
          ) : (
            <div className="flex gap-4 text-sm">
              <Link href="/auth/signin">Sign In</Link>
              <Link href="/auth/signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppBar;
