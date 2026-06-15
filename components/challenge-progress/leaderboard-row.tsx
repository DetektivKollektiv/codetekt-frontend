import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TableCell, TableRow } from '@/components/ui/table';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { getInitials } from '@/lib/utils/get-initials';

interface LeaderboardRowProps {
  rank: number;
  user: ChallengeProgress['leaderboard'][number];
}

export function LeaderboardRow({ rank, user }: LeaderboardRowProps) {
  return (
    <TableRow className="border-brand-darkblue/15">
      <TableCell className="font-black tabular-nums">{rank}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-brand-darkblue text-meta font-black text-brand-coral">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <span className="font-bold">{user.username}</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-black tabular-nums">
        {user.reviewedCases}
      </TableCell>
      <TableCell className="text-right font-black tabular-nums text-brand-darkblue/65">
        {user.activeDays}
      </TableCell>
    </TableRow>
  );
}
