import Link from 'next/link';
import SignInForm from './signInForm';
import { BACKEND_URL } from '@/lib/constants';

const SignInPage = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96 flex gap-4 flex-col justify-center items-center">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <SignInForm />
      <hr />
      <a
        href={`${BACKEND_URL}/auth/google/login`}
        className="w-full"
      >
        <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors">
          Sign in with Google
        </button>
      </a>
      <div className="flex justify-between text-sm">
        <p>Don&apos;t have an account?</p>
        <Link className="underline" href={'/auth/signup'}>
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default SignInPage;
