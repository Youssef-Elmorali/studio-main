import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupSuccess() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] py-12">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Registration Successful!</h1>
        <p className="text-muted-foreground">
          Your account has been created successfully. You can now sign in to access your account.
        </p>
        <div className="pt-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}