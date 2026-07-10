import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ caseNumber: string }>;
}) {
  const { caseNumber } = await params;

  if (!/^\d+$/.test(caseNumber)) {
    notFound();
  }

  const parsedCaseNumber = Number(caseNumber);

  if (!Number.isSafeInteger(parsedCaseNumber) || parsedCaseNumber < 1) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cases')
    .select('id')
    .eq('case_number', parsedCaseNumber)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    notFound();
  }

  redirect(`/archive/${data.id}`);
}
