import { signOut } from '@/lib/auth';
import { getSession } from '@/lib/session';
import Link from 'next/link';

type SignInButtonsProps = {
  session: any;
};

const SignInButtons = async ({ session }: SignInButtonsProps) => {
  return !session ? (
    <div className="flex gap-4">
      <Link href="/auth/signin">Sign In</Link>
      <Link href="/auth/signup">Sign Up</Link>
    </div>
  ) : (
    <>
      <form action={signOut}>
        <button type="submit" className="underline">
          Sign Out
        </button>
      </form>
    </>
  );
};

export default SignInButtons;
