import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { FC } from 'react';

interface ReviewProps {
  reviewTemplate: ReviewTemplate;
}

const Review: FC<ReviewProps> = ({ reviewTemplate }) => {
  return <div className="page-max-w">{JSON.stringify(reviewTemplate)}</div>;
};

export default Review;
