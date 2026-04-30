import { z } from 'zod';

export const tutorialFaqItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  answerHtml: z.string(),
});

export const tutorialBlogArticleSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  imageAlt: z.string().optional(),
  publishedAt: z.string(),
  siteName: z.string(),
  buttonLabel: z.string().optional(),
});

export const tutorialCommunityCardSchema = z.object({
  title: z.string(),
  description: z.string(),
  buttonLabel: z.string(),
  url: z.string().url(),
  illustrationSrc: z.string(),
  illustrationAlt: z.string().optional(),
});

export const tutorialContentSchema = z.object({
  faqItems: z.array(tutorialFaqItemSchema),
  blogArticles: z.array(tutorialBlogArticleSchema),
  communityCard: tutorialCommunityCardSchema,
});

export type TutorialFaqItemData = z.infer<typeof tutorialFaqItemSchema>;
export type TutorialBlogArticleData = z.infer<
  typeof tutorialBlogArticleSchema
>;
export type TutorialCommunityCardData = z.infer<
  typeof tutorialCommunityCardSchema
>;
export type TutorialContentData = z.infer<typeof tutorialContentSchema>;
