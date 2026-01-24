import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const token = searchParams.get('token');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  console.log('🔍 Confirm route called');
  console.log('token_hash:', token_hash);
  console.log('token:', token);
  console.log('type:', type);

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('token');
  redirectTo.searchParams.delete('type');
  redirectTo.searchParams.delete('next');

  const supabase = await createClient();
  const tokenToVerify = token_hash || token;

  if (tokenToVerify && type) {
    console.log('✅ Calling verifyOtp...');

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenToVerify,
    });

    console.log('verifyOtp result:', { data, error });

    if (!error) {
      console.log('✅ Success! Redirecting to:', redirectTo.pathname);
      return NextResponse.redirect(redirectTo);
    } else {
      console.error('❌ Verification error:', error);
      const errorUrl = request.nextUrl.clone();
      errorUrl.pathname = '/auth/error';
      errorUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(errorUrl);
    }
  }

  console.log('❌ No token found');
  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = '/auth/error';
  errorUrl.searchParams.set('error', 'No token found');
  return NextResponse.redirect(errorUrl);
}
