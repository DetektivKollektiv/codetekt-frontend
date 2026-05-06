import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/database.types';
import {
  E2E_SECOND_USER_EMAIL,
  E2E_SECOND_USER_ID,
  E2E_USER_EMAIL,
  E2E_USER_ID,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from './env';

type CaseRecord = Pick<
  Database['public']['Tables']['cases']['Row'],
  'id' | 'content' | 'submitted_by'
>;

let adminClient: SupabaseClient<Database> | null = null;
const userIdByEmail = new Map<string, string>();
const configuredUserIdsByEmail = new Map(
  [
    [E2E_USER_EMAIL, E2E_USER_ID],
    [E2E_SECOND_USER_EMAIL, E2E_SECOND_USER_ID],
  ].filter((entry): entry is [string, string] => Boolean(entry[1])),
);

export const getAdminClient = () => {
  if (adminClient) return adminClient;

  adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
};

const throwIfError = (action: string, error: unknown) => {
  if (error) {
    throw new Error(`${action} failed: ${JSON.stringify(error)}`);
  }
};

const delay = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const getUserIdByEmail = async (email: string) => {
  const cachedUserId = userIdByEmail.get(email);
  if (cachedUserId) return cachedUserId;

  const configuredUserId = configuredUserIdsByEmail.get(email);
  if (configuredUserId) {
    userIdByEmail.set(email, configuredUserId);
    return configuredUserId;
  }

  const perPage = 1000;

  for (let page = 1; ; page += 1) {
    const { data, error } = await getAdminClient().auth.admin.listUsers({
      page,
      perPage,
    });
    throwIfError('List Supabase users', error);

    const user = data.users.find((candidate) => candidate.email === email);
    if (user) {
      userIdByEmail.set(email, user.id);
      return user.id;
    }

    if (data.users.length < perPage) break;
  }

  throw new Error(`No Supabase auth user found for ${email}.`);
};

export const getE2EUserId = () => getUserIdByEmail(E2E_USER_EMAIL);

export const getProfileTutorialCompletedAt = async (
  userEmail = E2E_USER_EMAIL,
) => {
  const userId = await getUserIdByEmail(userEmail);
  const { data, error } = await getAdminClient()
    .from('profiles')
    .select('tutorial_completed_at')
    .eq('id', userId)
    .maybeSingle();

  throwIfError('Fetch profile tutorial completion', error);

  if (!data) {
    throw new Error(`No profile found for ${userEmail}.`);
  }

  return data.tutorial_completed_at;
};

export const setProfileTutorialCompletedAt = async (
  completedAt: string | null,
  userEmail = E2E_USER_EMAIL,
) => {
  const userId = await getUserIdByEmail(userEmail);
  const { data, error } = await getAdminClient()
    .from('profiles')
    .update({ tutorial_completed_at: completedAt })
    .eq('id', userId)
    .select('tutorial_completed_at')
    .single();

  throwIfError('Update profile tutorial completion', error);

  if (!data) {
    throw new Error(`No profile updated for ${userEmail}.`);
  }

  return data.tutorial_completed_at;
};

export const getCaseByContent = async (
  content: string,
): Promise<CaseRecord | null> => {
  const { data, error } = await getAdminClient()
    .from('cases')
    .select('id, content, submitted_by')
    .eq('content', content)
    .maybeSingle();

  throwIfError('Fetch case by content', error);
  return data;
};

export const waitForCaseByContent = async (content: string) => {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const caseRecord = await getCaseByContent(content);
    if (caseRecord) return caseRecord;
    await delay(250);
  }

  throw new Error(`Case was not persisted for ${content}`);
};

export const waitForSubmittedReview = async (
  caseId: string,
  userEmail = E2E_USER_EMAIL,
) => {
  const userId = await getUserIdByEmail(userEmail);
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const { data, error } = await getAdminClient()
      .from('review_answers_submitted')
      .select('id')
      .eq('case_id', caseId)
      .eq('reviewed_by', userId)
      .maybeSingle();

    throwIfError('Fetch submitted review', error);
    if (data?.id) return data.id;
    await delay(250);
  }

  throw new Error(`Submitted review was not persisted for case ${caseId}`);
};

export const waitForAggregatedReview = async (caseId: string) => {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const { data, error } = await getAdminClient()
      .from('review_aggregations')
      .select('case_id')
      .eq('case_id', caseId)
      .maybeSingle();

    throwIfError('Fetch aggregated review', error);
    if (data?.case_id) return data.case_id;
    await delay(250);
  }

  throw new Error(`Aggregated review was not persisted for case ${caseId}`);
};

export const insertCaseCategory = async (
  caseId: string,
  value: 'opinion' | 'report' | 'satire' | 'text_message',
  userEmail = E2E_SECOND_USER_EMAIL,
) => {
  const userId = await getUserIdByEmail(userEmail);
  const { error } = await getAdminClient().from('case_categories').insert({
    case_id: caseId,
    value,
    created_by: userId,
  });

  throwIfError('Insert case category', error);
};

export const cleanupCase = async (caseId: string) => {
  const client = getAdminClient();

  const { data: comments, error: commentsError } = await client
    .from('case_comments')
    .select('id')
    .eq('case_id', caseId);
  throwIfError('Fetch case comments for cleanup', commentsError);

  const commentIds = (comments ?? []).map((comment) => comment.id);
  if (commentIds.length > 0) {
    throwIfError(
      'Delete case comment likes',
      (await client.from('case_comment_likes').delete().in('comment_id', commentIds))
        .error,
    );
    throwIfError(
      'Delete case comment reports',
      (await client.from('case_comment_reports').delete().in('comment_id', commentIds))
        .error,
    );
    throwIfError(
      'Delete case comment moderations',
      (
        await client
          .from('case_comment_moderations')
          .delete()
          .in('comment_id', commentIds)
      ).error,
    );
  }

  throwIfError(
    'Delete case metadata disputes',
    (await client.from('cases_metadata_disputes').delete().eq('case_id', caseId))
      .error,
  );
  throwIfError(
    'Delete review aggregations',
    (await client.from('review_aggregations').delete().eq('case_id', caseId))
      .error,
  );
  throwIfError(
    'Delete in-progress review answers',
    (
      await client
        .from('review_answers_in_progress')
        .delete()
        .eq('case_id', caseId)
    ).error,
  );
  throwIfError(
    'Delete submitted review answers',
    (await client.from('review_answers_submitted').delete().eq('case_id', caseId))
      .error,
  );
  throwIfError(
    'Delete case comments',
    (await client.from('case_comments').delete().eq('case_id', caseId)).error,
  );
  throwIfError(
    'Delete case factcheck',
    (await client.from('case_factchecks').delete().eq('case_id', caseId)).error,
  );
  throwIfError(
    'Delete case keywords',
    (await client.from('case_keywords').delete().eq('case_id', caseId)).error,
  );
  throwIfError(
    'Delete case category',
    (await client.from('case_categories').delete().eq('case_id', caseId)).error,
  );
  throwIfError(
    'Delete case title',
    (await client.from('case_titles').delete().eq('case_id', caseId)).error,
  );
  throwIfError(
    'Delete open graph data',
    (await client.from('open_graph_data').delete().eq('case_id', caseId)).error,
  );
  throwIfError(
    'Delete case',
    (await client.from('cases').delete().eq('id', caseId)).error,
  );
};
