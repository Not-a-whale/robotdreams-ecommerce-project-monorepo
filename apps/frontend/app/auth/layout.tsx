import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back!</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
