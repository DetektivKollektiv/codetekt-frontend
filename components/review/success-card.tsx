import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  return (
    <Card className="pt-6 flex flex-col">
      <Confetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={250}
        recycle={false}
      />

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
          width={400 * 1.5}
          height={300 * 1.5}
        />
      </CardContent>
      <CardFooter className="mt-auto flex flex-col justify-end">
        {children}
      </CardFooter>
    </Card>
  );
};

export default SuccesCard;
