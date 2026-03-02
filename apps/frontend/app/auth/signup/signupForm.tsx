'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SubmitButton from '@/components/ui/submitButton';
import { signUp } from '@/lib/auth';
import * as React from 'react';

const SignUpForm = () => {
  const [state, action] = React.useActionState(signUp, undefined);
  return (
    <form action={action}>
      <div className="flex flex-col gap-2">
        {state?.message && (
          <p className="text-red-500 text-sm">{state.message}</p>
        )}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input type="text" id="name" name="name" placeholder="John Doe" />
        </div>
        {state?.error?.name && (
          <p className="text-red-500 text-sm">{state.error.name[0]}</p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="john@example.com"
          />
        </div>
        {state?.error?.email && (
          <p className="text-red-500 text-sm">{state.error.email[0]}</p>
        )}
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="********"
          />
        </div>
        {state?.error?.password && (
          <ul className="text-red-500 text-sm">
            {state.error.password.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <SubmitButton>Sign Up</SubmitButton>
    </form>
  );
};

export default SignUpForm;
