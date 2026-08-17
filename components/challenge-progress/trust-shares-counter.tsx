interface TrustSharesCounterProps {
  count: number;
  description: string;
  title: string;
}

export function TrustSharesCounter({
  count,
  description,
  title,
}: TrustSharesCounterProps) {
  return (
    <div className="flex w-fit min-w-0 max-w-full justify-self-center flex-col items-center rounded-2xl border border-neutral-0/30 bg-brand-darkblue/30 px-3 py-4 text-center sm:px-6">
      <h3 className="text-display-eyebrow font-black uppercase text-neutral-0">
        {title}
      </h3>
      <p className=" text-display-lg tabular-nums text-brand-yellow sm:text-[6rem] lg:text-[8rem]">
        {count}
      </p>
      <p className=" max-w-56 text-body-md">{description}</p>
    </div>
  );
}
