import Image from 'next/image';
import { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface SuccesCardProps {
  children?: React.ReactNode;
}

const SuccesCard: FC<SuccesCardProps> = ({ children }) => {
  return (
    <Card className="pt-6 flex flex-col">
      <CardHeader className="relative">
        <CardTitle className=" text-display-sm">
          Danke für deine Unterstützung!
        </CardTitle>
        <CardDescription className="max-w-xl">
          Der Fall wurde erfolgreich abgeschlossen und alle Änderungen wurden
          gespeichert.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-12 md:space-y-8 flex-1 flex items-center justify-center">
        <Image
          src={'/images/unterstuetzen.svg'}
          alt="Success"
          width={400}
          height={300}
        />
      </CardContent>
      <CardFooter className="mt-auto flex flex-col justify-end">
        {children}
      </CardFooter>
    </Card>
  );
};

export default SuccesCard;
