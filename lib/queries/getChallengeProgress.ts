import type { SupabaseClient } from '@supabase/supabase-js';
import { getVisibleChallengeMessage } from '@/lib/challenge-message';
import {
  challengeConfigContentSchema,
  challengeDynamicDataSchema,
  challengeMessagesSchema,
} from '@/lib/schemas';
import type {
  ChallengeDailyResolvedCasesData,
  ChallengeDynamicData,
  ChallengeLeaderboardItemData,
  ChallengeMessageData,
} from '@/lib/schemas';
import type { Database, Tables } from '@/lib/types/database.types';

const DEFAULT_LEADERBOARD_LIMIT = 5;

type ChallengeConfigRow = Pick<
  Tables<'challenge_configs'>,
  | 'content'
  | 'ends_on'
  | 'id'
  | 'messages'
  | 'starts_on'
  | 'visible_from'
  | 'visible_until'
>;

export interface ChallengeProgress {
  activeMessage: ChallengeMessageData | null;
  dailyGoals: [number, number, number];
  dailyResolvedCases: ChallengeDailyResolvedCasesData[];
  descriptionColumns: string[];
  endsOn: string;
  eyebrow: string;
  id: string;
  intro: ChallengeConfigRow['content']['intro'];
  leaderboard: ChallengeLeaderboardItemData[];
  milestones: number[];
  startsOn: string;
  title: string;
  totalResolvedCases: number;
  totalTarget: number;
  userResolvedPoints: number[];
  visibleFrom: string;
  visibleUntil: string;
}

const toChallengeProgress = (
  config: ChallengeConfigRow,
  dynamicData: ChallengeDynamicData,
  now: Date,
): ChallengeProgress => {
  return {
    id: config.id,
    activeMessage: getVisibleChallengeMessage(config.messages, now),
    startsOn: config.starts_on,
    endsOn: config.ends_on,
    visibleFrom: config.visible_from,
    visibleUntil: config.visible_until,
    eyebrow: config.content.eyebrow,
    title: config.content.title,
    intro: config.content.intro,
    totalTarget: config.content.totalTarget,
    milestones: config.content.milestones,
    dailyGoals: config.content.dailyGoals,
    descriptionColumns: config.content.descriptionColumns,
    dailyResolvedCases: dynamicData.daily_resolved_cases,
    totalResolvedCases: dynamicData.total_resolved_cases,
    userResolvedPoints: dynamicData.user_resolved_points,
    leaderboard: dynamicData.leaderboard,
  };
};

export async function getChallengeProgress(
  client: SupabaseClient<Database>,
): Promise<{ data: ChallengeProgress | null; error: Error | null }> {
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: config, error: configError } = await client
    .from('challenge_configs')
    .select(
      'id, starts_on, ends_on, visible_from, visible_until, content, messages',
    )
    .lte('visible_from', nowIso)
    .gte('visible_until', nowIso)
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

  const parsedMessages = challengeMessagesSchema.safeParse(
    config.messages ?? [],
  );

  if (!parsedMessages.success) {
    return {
      data: null,
      error: new Error('Challenge-Nachrichten haben ein ungültiges Format'),
    };
  }

  const parsedConfig: ChallengeConfigRow = {
    ...config,
    content: parsedContent.data,
    messages: parsedMessages.data,
  };

  const { data: dynamicRows, error: dynamicError } = await client.rpc(
    'get_challenge_progress',
    {
      challenge_ends_on: parsedConfig.ends_on,
      challenge_starts_on: parsedConfig.starts_on,
      leaderboard_limit:
        parsedConfig.content.leaderboardLimit ?? DEFAULT_LEADERBOARD_LIMIT,
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
    data: toChallengeProgress(parsedConfig, parsedDynamicData.data, now),
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
