import { ForgotPasswordForm } from '@/components/forgot-password-form';

export default function Page() {
  return (
    <div className="h-full flex-1 flex w-full items-center justify-center p-6 md:p-10 bg-gradient-neutral-coral">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
