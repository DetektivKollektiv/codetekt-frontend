'use client';

import { Button } from '@/components/ui/button';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DetailEvaluationCarouselProps {
  children: ReactNode;
  options?: EmblaOptionsType;
  showNavigation?: boolean;
  navigationButtonsPortal: string;
}

export function DetailEvaluationCarousel({
  children,
  options,
  showNavigation = true,
  navigationButtonsPortal,
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
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex gap-4">{children}</div>
      </div>

      {/* Navigation buttons */}
      {showNavigation &&
        createPortal(
          <>
            <Button
              variant="outline"
              size="icon"
              className={`absolute left-0 top-1/2 -translate-y-1/2 translate-x-0 z-20 rounded-full shadow-lg  ${
                prevBtnDisabled ? 'hidden' : ''
              }`}
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-0 z-20 rounded-full shadow-lg  ${
                nextBtnDisabled ? 'hidden' : ''
              }`}
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>,
          document.getElementById(navigationButtonsPortal) as Element
        )}
    </div>
  );
}
