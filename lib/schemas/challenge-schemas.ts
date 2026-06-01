import { z } from 'zod';

export const challengeTagGoalSchema = z.object({
  label: z.string(),
  tagValue: z.string(),
  target: z.number().int().positive(),
});

export const challengeConfigContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  totalTarget: z.number().int().positive(),
  milestones: z.array(z.number().int().nonnegative()).min(2),
  dailyGoals: z.tuple([
    z.number().int().positive(),
    z.number().int().positive(),
    z.number().int().positive(),
  ]),
  descriptionColumns: z.array(z.string()).min(1).max(2),
  tagGoals: z.array(challengeTagGoalSchema),
  leaderboardLimit: z.number().int().positive().optional(),
});

export const challengeDailyResolvedCasesSchema = z.object({
  date: z.string(),
  resolvedCases: z.number().int().nonnegative(),
});

export const challengeTagGoalResultSchema = z.object({
  tagValue: z.string(),
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
  tag_goal_results: z.array(challengeTagGoalResultSchema),
  leaderboard: z.array(challengeLeaderboardItemSchema),
});

export type ChallengeConfigContentData = z.infer<
  typeof challengeConfigContentSchema
>;
export type ChallengeDailyResolvedCasesData = z.infer<
  typeof challengeDailyResolvedCasesSchema
>;
export type ChallengeLeaderboardItemData = z.infer<
  typeof challengeLeaderboardItemSchema
>;
export type ChallengeDynamicData = z.infer<typeof challengeDynamicDataSchema>;
