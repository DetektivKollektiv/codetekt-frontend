import { FC } from 'react';
import { Card, CardContent } from '../ui/card';

interface EmptyCardProps {
  message: string;
}

const EmptyCard: FC<EmptyCardProps> = ({ message }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-48 lg:h-72 w-full flex bg-muted ">
      <CardContent className="p-4 lg:p-6 w-full flex items-center justify-center">
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyCard;
