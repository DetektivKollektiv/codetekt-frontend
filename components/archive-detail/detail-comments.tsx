'use client';

import { Button } from '@/components/ui/button';
import { caseCommentsQuery, type CaseComments } from '@/lib/queries/getCaseComments';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { useQuery } from '@tanstack/react-query';
import type { EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DetailCommentCard } from './detail-comment-card';

interface DetailCommentsProps {
  comments: CaseComments;
  auth: Awaited<ReturnType<typeof getAuth>>;
  caseId: string;
}

export function DetailComments({ comments, auth, caseId }: DetailCommentsProps) {
  const supabase = createClient();

  const { data: commentsData } = useQuery({
    ...caseCommentsQuery(supabase, caseId),
    initialData: comments,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    dragFree: false,
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);

    return () => {
      emblaApi.off('reInit', onSelect).off('select', onSelect);
    };
  }, [emblaApi, onSelect]);
  if (!commentsData || commentsData.length === 0) {
    return (
      <section className="space-y-6 page-max-w">
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
    <section className="space-y-6 relative">
      {/* Header */}
      <div className="page-max-w">
        <h2 className="text-2xl font-bold">Kommentare</h2>
        <p className="text-muted-foreground mt-1">
          {commentsData.length} Kommentar{commentsData.length !== 1 ? 'e' : ''} zu
          diesem Fall
        </p>
      </div>

      {/* Comments carousel */}
      <div className="overflow-hidden py-0.5 relative">
        <div className="relative overflow-visible page-max-w">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container flex gap-4 items-stretch">
              {commentsData.map((comment) => (
                <div
                  key={comment.id}
                  className="flex-[0_0_100%] md:flex-[0_0_calc(50%-0.5rem)] lg:flex-[0_0_calc(33.333%-0.667rem)] min-w-0 h-auto flex w-full"
                >
                  <DetailCommentCard comment={comment} auth={auth} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Navigation buttons */}
      {commentsData.length > 1 && (
        <div className="page-max-w relative flex justify-between">
          <Button
            variant="outline"
            id="prev-button-xxx"
            size="icon"
            className={` z-20 rounded-full shadow-lg ${
              prevBtnDisabled ? 'hidden' : ''
            }`}
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1"></div>
          <Button
            variant="outline"
            size="icon"
            className={` z-20 rounded-full shadow-lg ${
              nextBtnDisabled ? 'hidden' : ''
            }`}
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
