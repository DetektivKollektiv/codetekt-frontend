import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { TagGoalItem } from './tag-goal-item';

interface TagGoalsSectionProps {
  tagGoals: ChallengeProgress['tagGoals'];
}

export function TagGoalsSection({ tagGoals }: TagGoalsSectionProps) {
  return (
    <section>
      <h3 className="text-heading-lg font-black tracking-normal">Tag-Ziele</h3>
      <div className="mt-6 flex flex-col gap-6">
        {tagGoals.map((goal) => (
          <TagGoalItem key={goal.tagValue} goal={goal} />
        ))}
      </div>
    </section>
  );
}
