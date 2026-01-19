import Review from '@/components/review';
import { getCase } from '@/lib/queries/getCase';
import { getReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { reviewTemplateSchema } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reviewTemplate, error } = await getReviewTemplate(supabase, id);
  const { data: caseData, error: caseError } = await getCase(supabase, id);

  if (reviewTemplate) {
    console.log('Review template data:', reviewTemplate);
    const parsed = reviewTemplateSchema.array().safeParse(reviewTemplate);
    console.log('Parsed review template:', parsed);
    if (!parsed.success) {
      console.error('Invalid review template data:', parsed.error);
      //notFound();
      return <div>{JSON.stringify(reviewTemplate)}</div>;
    }
  }

  if (error) {
    throw error;
  }

  if (caseError) {
    throw caseError;
  }

  if (!reviewTemplate || !caseData) {
    notFound();
  }

  return (
    <div className=" w-full mt-10 lg:mt-12 mb-24 lg:mb-32">
      <Review reviewTemplate={reviewTemplate} case={caseData} />
    </div>
  );
}
