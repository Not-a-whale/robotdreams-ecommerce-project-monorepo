import Link from 'next/link';
import SignUpForm from './signupForm';

const SignUpPage = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96 flex gap-4 flex-col justify-center items-center">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <SignUpForm />
      <div className="flex justify-between text-sm">
        <p>Already have an account?</p>
        <Link className="underline" href={'/auth/signin'}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;
