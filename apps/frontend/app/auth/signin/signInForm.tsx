'use client';

import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/submitButton';
import { signIn } from '@/lib/auth';
import { Label } from '@radix-ui/react-label';
import Link from 'next/link';
import { useFormState } from 'react-dom';

const SignInForm = () => {
  const [state, action] = useFormState(signIn, undefined);
  return (
    <form action={action}>
      <div className="flex flex-col gap-2 w-64">
        {state?.message && (
          <p className="text-red-500 text-sm">{state.message}</p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="example@example.com"
            type="email"
          />
          {state?.error?.email && (
            <p className="text-red-500 text-sm">{state.error.email[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="********"
            type="password"
          />
          {state?.error?.password && (
            <p className="text-red-500 text-sm">{state.error.password[0]}</p>
          )}
        </div>
        <Link className="text-sm underline" href={'#'}>
          Forgot password?
        </Link>
      </div>
      <SubmitButton>Sign In</SubmitButton>
    </form>
  );
};

export default SignInForm;
