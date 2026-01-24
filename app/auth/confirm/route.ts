import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const token = searchParams.get('token'); // Legacy format
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  const supabase = await createClient();

  // Handle both PKCE (token_hash) and legacy (token) formats
  const tokenToVerify = token_hash || token;

  if (tokenToVerify && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenToVerify,
    });

    if (!error) {
      // User is confirmed and logged in
      redirect(next);
    } else {
      // Verification failed
      console.error('Verification error:', error);
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // No valid token found
  redirect(`/auth/error?error=No%20token%20found`);
}
