import type { MergeDeep } from 'type-fest';
import type {
  ChallengeConfigContentData,
  InProgressReviewAnswer,
  OpenGraphData,
  ReviewAggregationData,
  SubmittedReviewAnswer,
  TutorialContentData,
} from '../schemas';
import type { Database as DatabaseGenerated } from './database.types-generated';

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        challenge_configs: {
          Row: {
            content: ChallengeConfigContentData;
            created_at: string;
            ends_on: string;
            id: string;
            is_active: boolean;
            starts_on: string;
            updated_at: string;
          };
          Insert: {
            content: ChallengeConfigContentData;
            created_at?: string;
            ends_on: string;
            id?: string;
            is_active?: boolean;
            starts_on: string;
            updated_at?: string;
          };
          Update: {
            content?: ChallengeConfigContentData;
            created_at?: string;
            ends_on?: string;
            id?: string;
            is_active?: boolean;
            starts_on?: string;
            updated_at?: string;
          };
          Relationships: [];
        };
        open_graph_data: {
          Row: {
            raw_data: OpenGraphData | null;
          };
          Insert: {
            raw_data?: OpenGraphData | null;
          };
          Update: {
            raw_data?: OpenGraphData | null;
          };
        };
        review_aggregations: {
          Row: {
            data: ReviewAggregationData | null;
          };
          Insert: {
            data?: ReviewAggregationData | null;
          };
          Update: {
            data?: ReviewAggregationData | null;
          };
        };
        review_answers_in_progress: {
          Row: {
            data: InProgressReviewAnswer | null;
          };
          Insert: {
            data?: InProgressReviewAnswer | null;
          };
          Update: {
            data?: InProgressReviewAnswer | null;
          };
        };
        review_answers_submitted: {
          Row: {
            data: SubmittedReviewAnswer | null;
          };
          Insert: {
            data?: SubmittedReviewAnswer | null;
          };
          Update: {
            data?: SubmittedReviewAnswer | null;
          };
        };
        profiles: {
          Row: {
            tutorial_completed_at: string | null;
          };
          Insert: {
            tutorial_completed_at?: string | null;
          };
          Update: {
            tutorial_completed_at?: string | null;
          };
        };
        tutorial_content: {
          Row: {
            content: TutorialContentData | null;
          };
          Insert: {
            content?: TutorialContentData | null;
          };
          Update: {
            content?: TutorialContentData | null;
          };
        };
      };
      Functions: {
        get_challenge_progress: {
          Args: {
            challenge_ends_on: string;
            challenge_starts_on: string;
            leaderboard_limit?: number;
            tag_values?: string[];
          };
          Returns: {
            daily_resolved_cases: {
              date: string;
              resolvedCases: number;
            }[];
            leaderboard: {
              activeDays: number;
              reviewedCases: number;
              userId: string;
              username: string;
            }[];
            tag_goal_results: {
              resolvedCases: number;
              tagValue: string;
            }[];
            total_resolved_cases: number;
          }[];
        };
        get_aggregation_reviewers: {
          Args: {
            case_ids?: string[] | null;
          };
          Returns: {
            case_id: string;
            reviewer_id: string;
            username: string | null;
          }[];
        };
      };
      Views: {
        review_answers_in_progress_without_open_disputes: {
          Row: {
            data: InProgressReviewAnswer | null;
          };
        };
        review_aggregations_without_open_disputes: {
          Row: {
            data: ReviewAggregationData | null;
          };
        };
      };
    };
  }
>;

// follwong types are from generated. Imported here so they use the merged Database type

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
