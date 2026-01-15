import Image from 'next/image';
import { FC } from 'react';

interface LoadingComponentProps {}

const LoadingComponent: FC<LoadingComponentProps> = ({}) => {
  return (
    <div className="w-full h-screen bg-background flex items-center justify-center">
      <Image
        src="/codetekt_logo.png"
        alt="Codetekt"
        width={156}
        height={40}
        priority
        className="h-8 w-auto"
      />
    </div>
  );
};

export default LoadingComponent;
