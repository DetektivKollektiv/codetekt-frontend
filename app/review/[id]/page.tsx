import Review from '@/components/review';
import { getCase } from '@/lib/queries/getCase';
import { getReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { getSubmittedReviewAnswer } from '@/lib/queries/getSubmittedReviewAnswer';
import { reviewTemplateSchema } from '@/lib/schemas';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();

  // Run these queries in parallel
  const [auth, { data: caseData, error: caseError }] = await Promise.all([
    getAuth(supabase),
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

  if (caseError) {
    notFound();
  }

  if (!caseData) {
    notFound();
  }

  const metadataIncomplete =
    !caseData.case_titles ||
    (caseData.case_keywords?.length ?? 0) === 0 ||
    !caseData.case_categories;

  let reviewTemplate: Awaited<ReturnType<typeof getReviewTemplate>>['data'] =
    null;
  let reviewTemplateError: Awaited<
    ReturnType<typeof getReviewTemplate>
  >['error'] = null;

  if (!metadataIncomplete) {
    const { data, error } = await getReviewTemplate(supabase, id);
    reviewTemplate = data;
    reviewTemplateError = error;
  }

  if (reviewTemplate) {
    const parsed = reviewTemplateSchema.array().safeParse(reviewTemplate);

    if (!parsed.success) {
      notFound();
    }
  }

  if (reviewTemplateError && !metadataIncomplete) {
    notFound();
  }

  return (
    <div className=" w-full mt-10 lg:mt-12 mb-24 lg:mb-32">
      <Review
        reviewTemplate={reviewTemplate}
        caseData={caseData}
        isSubmitted={isSubmitted}
      />
    </div>
  );
}
