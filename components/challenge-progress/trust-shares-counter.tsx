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
    <div className="flex min-w-0 flex-col items-center px-3 text-center sm:px-6">
      <h3 className="text-display-eyebrow uppercase text-neutral-0/70">
        {title}
      </h3>
      <p className=" text-display-lg tabular-nums text-brand-yellow sm:text-[6rem] lg:text-[8rem]">
        {count}
      </p>
      <p className=" max-w-56 text-body-md">{description}</p>
    </div>
  );
}
