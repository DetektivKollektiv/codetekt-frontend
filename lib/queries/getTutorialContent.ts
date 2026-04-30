import { SupabaseClient } from '@supabase/supabase-js';
import { TutorialContentData, tutorialContentSchema } from '@/lib/schemas';
import { Database, Tables } from '@/lib/types/database.types';

export async function getTutorialContent(
  client: SupabaseClient<Database>,
): Promise<{ data: TutorialContentData | null; error: Error | null }> {
  const queryResult = await client
    .from('tutorial_content')
    .select('content')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
  const { data, error } = queryResult as {
    data: Pick<Tables<'tutorial_content'>, 'content'> | null;
    error: Error | null;
  };

  if (error) {
    return { data: null, error };
  }

  if (!data?.content) {
    return { data: null, error: null };
  }

  const parsedContent = tutorialContentSchema.safeParse(data.content);

  if (!parsedContent.success) {
    return {
      data: null,
      error: new Error('Tutorial-Inhalte haben ein ungültiges Format'),
    };
  }

  return { data: parsedContent.data, error: null };
}
