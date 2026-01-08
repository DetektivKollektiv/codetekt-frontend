import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types-generated';

export type TypedSupabaseClient = SupabaseClient<Database>;
