'use client';

import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface TutorialCarouselProps {
  children: ReactNode;
  options?: EmblaOptionsType;
}

export function TutorialCarousel({
  children,
  options,
}: TutorialCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
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

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const selectTimer = window.setTimeout(() => onSelect(emblaApi), 0);

    emblaApi.on('reInit', onSelect).on('select', onSelect);

    return () => {
      window.clearTimeout(selectTimer);
      emblaApi.off('reInit', onSelect).off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="overflow-visible">
      <div className="flex w-full justify-between">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
          aria-label="Vorherige Seite"
        >
          <ChevronLeft data-icon="inline-start" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
          aria-label="Nächste Seite"
        >
          <ChevronRight data-icon="inline-start" />
        </Button>
      </div>
      <div className="embla mt-4" ref={emblaRef}>
        <div className="embla__container flex gap-4">{children}</div>
      </div>
    </div>
  );
}
