import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';

export type MetadataNavItem = {
  id: string;
  label: string;
  isComplete: boolean;
  isMetadataStep: true;
};

export type TemplateNavItem = NonNullable<ReviewTemplate>[number] & {
  isMetadataStep: false;
};

export type AnyNavItem = MetadataNavItem | TemplateNavItem;
