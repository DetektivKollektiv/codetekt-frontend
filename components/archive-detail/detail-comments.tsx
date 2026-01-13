'use client';

import { DetailCommentCard } from './detail-comment-card';
import type { CaseComments } from '@/lib/queries/getCaseComments';

interface DetailCommentsProps {
  comments: CaseComments;
  userId?: string;
}

export function DetailComments({ comments, userId }: DetailCommentsProps) {
  if (!comments || comments.length === 0) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Kommentare</h2>
          <p className="text-muted-foreground mt-1">
            Noch keine Kommentare zu diesem Fall
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Kommentare</h2>
        <p className="text-muted-foreground mt-1">
          {comments.length} Kommentar{comments.length !== 1 ? 'e' : ''} zu
          diesem Fall
        </p>
      </div>

      {/* Comments grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {comments.map((comment) => (
          <DetailCommentCard
            key={comment.id}
            comment={comment}
            userId={userId}
          />
        ))}
      </div>
    </section>
  );
}
