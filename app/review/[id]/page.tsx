import Review from '@/components/review';
import { getCase } from '@/lib/queries/getCase';
import { getReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { getSubmittedReviewAnswer } from '@/lib/queries/getSubmittedReviewAnswer';
import { reviewTemplateSchema } from '@/lib/schemas';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Run these queries in parallel
  const [
    auth,
    { data: reviewTemplate, error },
    { data: caseData, error: caseError },
  ] = await Promise.all([
    getAuth(supabase),
    getReviewTemplate(supabase, id),
    getCase(supabase, id),
  ]);

  const userId = auth.user?.id;

  let isSubmitted = false;
  if (userId) {
    const { data: submittedReview } = await getSubmittedReviewAnswer(
      supabase,
      id,
      userId,
    );
    isSubmitted = !!submittedReview;
  }

  if (reviewTemplate) {
    const parsed = reviewTemplateSchema.array().safeParse(reviewTemplate);
    console.log('Parsed review template:', parsed);
    if (!parsed.success) {
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
      <Review
        reviewTemplate={reviewTemplate}
        case={caseData}
        isSubmitted={isSubmitted}
      />
    </div>
  );
}
