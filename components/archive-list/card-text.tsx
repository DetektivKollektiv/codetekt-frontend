import { FC } from 'react';

interface CardTextProps {
  date: string;
  title: string | null;
  description: string | null;
}

const CardText: FC<CardTextProps> = ({ date, title, description }) => {
  return (
    <div className="h-36">
      <h2 className="text-sm text-muted-foreground">Eingereicht am {date}</h2>
      <h3 className="text-lg font-semibold line-clamp-2 leading-tight mt-2">
        {title || 'Titel nicht verfügbar'}
      </h3>
      <p className="text-body-md text-muted-foreground line-clamp-3 mt-2 leading-tight">
        {description || 'Keine Beschreibung verfügbar.'}
      </p>
    </div>
  );
};

export default CardText;
