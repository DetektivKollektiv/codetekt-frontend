'use client';

import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button } from '../ui/button';

interface DetailEvaluationCarouselProps {
  children: ReactNode;
  options?: EmblaOptionsType;
}

export function DetailEvaluationCarousel({
  children,
  options,
}: DetailEvaluationCarouselProps) {
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

  return (
    <div className="overflow-visible">
      {/* Carousel */}
      <div className="flex justify-between w-full">
        <div>
          <Button
            variant="outline"
            size="icon"
            className={`z-20 rounded-full shadow-lg transition-opacity  ${
              prevBtnDisabled ? 'disabled:opacity-0' : ''
            }`}
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <div>
          <Button
            variant="outline"
            size="icon"
            className={`z-20 rounded-full shadow-lg transition-opacity  ${
              nextBtnDisabled ? 'disabled:opacity-0' : ''
            }`}
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="embla mt-4 " ref={emblaRef}>
        <div className="embla__container flex gap-4">{children}</div>
      </div>
    </div>
  );
}
