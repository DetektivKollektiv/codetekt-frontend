import { cn } from '@/lib/utils';

const progressLegendItems = [
  {
    label: 'Von dir gelöst',
    className: 'bg-brand-green',
  },
  {
    label: 'Gelöst',
    className: 'bg-brand-purple-dark',
  },
  {
    label: 'Ungelöst',
    className: 'bg-neutral-0/55',
  },
] as const;

export function ProgressLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {progressLegendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className={cn(
              'size-[clamp(1rem,1.6vw,1.3rem)] rounded-full',
              item.className,
            )}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap text-body-sm font-bold">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
