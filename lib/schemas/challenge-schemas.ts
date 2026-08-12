import { z } from 'zod';

export const challengeIntroSectionSchema = z.object({
  heading: z.string().optional(),
  bodyHtml: z.string(),
});

export const challengeIntroContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  descriptionHtml: z.string(),
  imageSrc: z.string(),
  imageAlt: z.string().optional(),
  sections: z.array(challengeIntroSectionSchema).min(1),
});

export const challengeInformationContentSchema = z.object({
  title: z.string(),
  descriptionHtml: z.string(),
  buttonLabel: z.string(),
  contentHtml: z.string(),
});

const challengeMilestoneValueSchema = z.number().int().nonnegative();

export const challengeMilestoneSchema = z.union([
  challengeMilestoneValueSchema.transform((value) => ({
    value,
    label: undefined,
    tooltip: undefined,
  })),
  z.object({
    value: challengeMilestoneValueSchema,
    label: z.string().min(1).optional(),
    tooltip: z.string().min(1).optional(),
  }),
]);

export const challengeConfigContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  totalTarget: z.number().int().positive(),
  milestones: z.array(challengeMilestoneSchema).min(2),
  trustShares: z.object({
    title: z.string(),
    count: z.number().int().nonnegative(),
    description: z.string(),
  }),
  dailyGoals: z.tuple([
    z.number().int().positive(),
    z.number().int().positive(),
    z.number().int().positive(),
  ]),
  descriptionColumnsHtml: z.array(z.string()).min(1).max(2),
  intro: challengeIntroContentSchema,
  information: challengeInformationContentSchema.optional(),
  leaderboardLimit: z.number().int().positive().optional(),
  leaderboardReviewCaps: z
    .record(z.string(), z.number().int().positive())
    .optional(),
});

export const challengeMessageSchema = z.object({
  contentHtml: z.string(),
  visibleFrom: z.string(),
  visibleUntil: z.string(),
});

export const challengeMessagesSchema = z.array(challengeMessageSchema);

export const challengeDailyResolvedCasesSchema = z.object({
  date: z.string(),
  resolvedCases: z.number().int().nonnegative(),
});

export const challengeLeaderboardItemSchema = z.object({
  userId: z.string(),
  username: z.string(),
  reviewedCases: z.number().int().nonnegative(),
  activeDays: z.number().int().nonnegative(),
});

export const challengeDynamicDataSchema = z.object({
  total_resolved_cases: z.number().int().nonnegative(),
  daily_resolved_cases: z.array(challengeDailyResolvedCasesSchema),
  leaderboard: z.array(challengeLeaderboardItemSchema),
  user_resolved_points: z.array(z.number().int().positive()),
});

export type ChallengeConfigContentData = z.infer<
  typeof challengeConfigContentSchema
>;
export type ChallengeIntroContentData = z.infer<
  typeof challengeIntroContentSchema
>;
export type ChallengeInformationContentData = z.infer<
  typeof challengeInformationContentSchema
>;
export type ChallengeMilestoneData = z.infer<typeof challengeMilestoneSchema>;
export type ChallengeMessageData = z.infer<typeof challengeMessageSchema>;
export type ChallengeDailyResolvedCasesData = z.infer<
  typeof challengeDailyResolvedCasesSchema
>;
export type ChallengeLeaderboardItemData = z.infer<
  typeof challengeLeaderboardItemSchema
>;
export type ChallengeDynamicData = z.infer<typeof challengeDynamicDataSchema>;
