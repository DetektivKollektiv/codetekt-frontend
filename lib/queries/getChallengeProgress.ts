import type { SupabaseClient } from '@supabase/supabase-js';
import {
  challengeConfigContentSchema,
  challengeDynamicDataSchema,
} from '@/lib/schemas';
import type {
  ChallengeDailyResolvedCasesData,
  ChallengeDynamicData,
  ChallengeLeaderboardItemData,
} from '@/lib/schemas';
import type { Database, Tables } from '@/lib/types/database.types';

const DEFAULT_LEADERBOARD_LIMIT = 5;

type ChallengeConfigRow = Pick<
  Tables<'challenge_configs'>,
  'content' | 'ends_on' | 'id' | 'starts_on'
>;

export interface ChallengeTagGoal {
  label: string;
  resolvedCases: number;
  tagValue: string;
  target: number;
}

export interface ChallengeProgress {
  dailyGoals: [number, number, number];
  dailyResolvedCases: ChallengeDailyResolvedCasesData[];
  descriptionColumns: string[];
  endsOn: string;
  eyebrow: string;
  id: string;
  leaderboard: ChallengeLeaderboardItemData[];
  milestones: number[];
  startsOn: string;
  tagGoals: ChallengeTagGoal[];
  title: string;
  totalResolvedCases: number;
  totalTarget: number;
}

const toChallengeProgress = (
  config: ChallengeConfigRow,
  dynamicData: ChallengeDynamicData,
): ChallengeProgress => {
  const tagResultByValue = new Map(
    dynamicData.tag_goal_results.map((result) => [
      result.tagValue,
      result.resolvedCases,
    ]),
  );

  return {
    id: config.id,
    startsOn: config.starts_on,
    endsOn: config.ends_on,
    eyebrow: config.content.eyebrow,
    title: config.content.title,
    totalTarget: config.content.totalTarget,
    milestones: config.content.milestones,
    dailyGoals: config.content.dailyGoals,
    descriptionColumns: config.content.descriptionColumns,
    dailyResolvedCases: dynamicData.daily_resolved_cases,
    totalResolvedCases: dynamicData.total_resolved_cases,
    tagGoals: config.content.tagGoals.map((goal) => ({
      ...goal,
      resolvedCases: tagResultByValue.get(goal.tagValue) ?? 0,
    })),
    leaderboard: dynamicData.leaderboard,
  };
};

export async function getChallengeProgress(
  client: SupabaseClient<Database>,
): Promise<{ data: ChallengeProgress | null; error: Error | null }> {
  const { data: config, error: configError } = await client
    .from('challenge_configs')
    .select('id, starts_on, ends_on, content')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (configError) {
    return { data: null, error: configError };
  }

  if (!config) {
    return { data: null, error: null };
  }

  const parsedContent = challengeConfigContentSchema.safeParse(config.content);

  if (!parsedContent.success) {
    return {
      data: null,
      error: new Error('Challenge-Konfiguration hat ein ungültiges Format'),
    };
  }

  const parsedConfig: ChallengeConfigRow = {
    ...config,
    content: parsedContent.data,
  };

  const { data: dynamicRows, error: dynamicError } = await client.rpc(
    'get_challenge_progress',
    {
      challenge_ends_on: parsedConfig.ends_on,
      challenge_starts_on: parsedConfig.starts_on,
      leaderboard_limit:
        parsedConfig.content.leaderboardLimit ?? DEFAULT_LEADERBOARD_LIMIT,
      tag_values: parsedConfig.content.tagGoals.map((goal) => goal.tagValue),
    },
  );

  if (dynamicError) {
    return { data: null, error: dynamicError };
  }

  const dynamicRow = dynamicRows?.[0];

  if (!dynamicRow) {
    return {
      data: null,
      error: new Error('Challenge-RPC hat keine Daten zurückgegeben'),
    };
  }

  const parsedDynamicData = challengeDynamicDataSchema.safeParse(dynamicRow);

  if (!parsedDynamicData.success) {
    return {
      data: null,
      error: new Error('Challenge-RPC hat ein ungültiges Format zurückgegeben'),
    };
  }

  return {
    data: toChallengeProgress(parsedConfig, parsedDynamicData.data),
    error: null,
  };
}

export const challengeProgressQuery = (client: SupabaseClient<Database>) => ({
  queryKey: ['challenge-progress'],
  queryFn: async () => {
    const { data, error } = await getChallengeProgress(client);

    if (error) {
      throw error;
    }

    return data;
  },
});
