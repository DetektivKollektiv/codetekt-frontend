import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { LeaderboardRow } from './leaderboard-row';

interface LeaderboardSectionProps {
  leaderboard: ChallengeProgress['leaderboard'];
}

export function LeaderboardSection({
  leaderboard,
}: LeaderboardSectionProps) {
  return (
    <section className="border-t border-brand-darkblue/25 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
      <h3 className="text-heading-lg font-black tracking-normal">
        Leaderboard
      </h3>
      <div className="relative mt-5 max-h-72 overflow-y-auto no-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-brand-coral [&_tr>th:first-child]:rounded-tl-md [&_tr>th:last-child]:rounded-tr-md">
            <TableRow className="border-brand-darkblue/20">
              <TableHead className="w-9 bg-brand-coral text-brand-darkblue/65">
                #
              </TableHead>
              <TableHead className="bg-brand-coral text-brand-darkblue/65">
                co:detectives
              </TableHead>
              <TableHead className="bg-brand-coral text-right text-brand-darkblue/65">
                Fälle
              </TableHead>
              <TableHead className="bg-brand-coral text-right text-brand-darkblue/65">
                Tage
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <LeaderboardRow
                  key={user.userId}
                  rank={index + 1}
                  user={user}
                />
              ))
            ) : (
              <TableRow className="border-brand-darkblue/15">
                <TableCell
                  colSpan={4}
                  className="py-6 text-center font-bold text-brand-darkblue/65"
                >
                  Noch keine Challenge-Aktivitäten
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="sticky bottom-0 h-6 bg-gradient-to-t from-brand-coral to-brand-coral/0" />
      </div>
    </section>
  );
}
