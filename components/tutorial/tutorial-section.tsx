import { ReactNode } from 'react';

interface TutorialSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function TutorialSection({
  title,
  description,
  children,
}: TutorialSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      {title || description ? (
        <div className="flex flex-col gap-2">
          {title ? <h2 className="text-2xl font-bold">{title}</h2> : null}
          {description ? (
            <p className="text-body-md text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
