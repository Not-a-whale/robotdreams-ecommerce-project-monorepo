import z from 'zod';

export type FormState =
  | {
      error?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name is required and should be at least 2 characters long')
    .trim(),
  email: z.string().email('Invalid email address').trim(),
  password: z
    .string()
    .min(8, 'Password is required and should be at least 8 characters long')
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
    .regex(/\d/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Password must contain at least one special character',
    })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z
    .string()
    .min(8, 'Password is required and should be at least 8 characters long')
    .trim(),
});
